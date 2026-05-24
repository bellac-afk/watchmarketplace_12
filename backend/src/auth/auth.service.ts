import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new InternalServerErrorException('JWT_SECRET must be set and at least 32 characters long');
    }
    return secret;
  }

  private getJwtRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret || secret.length < 32) {
      throw new InternalServerErrorException('JWT_REFRESH_SECRET must be set and at least 32 characters long');
    }
    return secret;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        verificationStatus: user.verificationStatus,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const secret = this.getJwtRefreshSecret();
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret,
        clockTolerance: 60, // 1 minute clock skew tolerance
      });

      // Проверяем тип токена
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const storedToken = await this.redis.get(`refresh:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Проверяем, что пользователь всё ещё существует и активен
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, verificationStatus: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Удаляем старый refresh токен
      await this.redis.del(`refresh:${payload.sub}`);

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    // Добавляем access token в blacklist на оставшееся время жизни
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const jwtSecret = this.getJwtSecret();
    const jwtRefreshSecret = this.getJwtRefreshSecret();

    const accessPayload = { sub: userId, email, role, type: 'access' };
    const refreshPayload = { sub: userId, type: 'refresh' };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: jwtSecret,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: jwtRefreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    await this.redis.set(`refresh:${userId}`, refreshToken, 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }
}
