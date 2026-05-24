export { CreateListingDto } from './create-listing.dto';
export { UpdateListingDto } from './update-listing.dto';

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ListingStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: ListingStatus })
  @IsEnum(ListingStatus)
  status: ListingStatus;
}
