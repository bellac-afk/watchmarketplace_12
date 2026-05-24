import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsDecimal, IsJSON } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType, CaseMaterial, WatchCondition, ListingStatus } from '@prisma/client';

export class WatchFiltersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

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
  minDiameter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxDiameter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearTo?: number;

  @ApiPropertyOptional({ enum: WatchCondition })
  @IsOptional()
  @IsEnum(WatchCondition)
  condition?: WatchCondition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class CreateWatchDto {
  @ApiProperty()
  @IsUUID()
  brandId: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiProperty()
  @IsString()
  reference: string;

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
  caseDiameter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  caseThickness?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waterResistance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
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
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  specifications?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearIntroduced?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearDiscontinued?: number;
}

export class UpdateWatchDto extends CreateWatchDto {}
