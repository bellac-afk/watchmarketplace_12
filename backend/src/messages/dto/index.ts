import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty()
  @IsUUID()
  receiverId: string;

  @ApiProperty()
  @IsUUID()
  listingId: string;

  @ApiProperty()
  @IsString()
  content: string;
}
