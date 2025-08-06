import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateAuctionDto {
  @IsInt()
  carId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  startingBid: number;

  @IsNumber()
  currentBid: number;

  @IsOptional()
  @IsInt()
  winnerId?: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsInt()
  version?: number;
}
