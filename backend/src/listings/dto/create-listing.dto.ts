import {
  IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsDecimal,
  IsArray, IsUUID, Min, Max, IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WatchCondition, MovementType, CaseMaterial } from '@prisma/client';

export class CreateListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  watchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty()
  @IsDecimal({ decimal_digits: '2' })
  price: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  originalPrice?: string;

  @ApiProperty({ enum: WatchCondition })
  @IsEnum(WatchCondition)
  condition: WatchCondition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasBox?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPapers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasOriginalStrap?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalAccessories?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: MovementType })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiPropertyOptional({ enum: CaseMaterial })
  @IsOptional()
  @IsEnum(CaseMaterial)
  caseMaterial?: CaseMaterial;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(70)
  caseDiameter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  caseThickness?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  waterResistance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  powerReserve?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  crystal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dialColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  braceletMaterial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  braceletType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  claspType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bezelMaterial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  functions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complications?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lugWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  weight?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
