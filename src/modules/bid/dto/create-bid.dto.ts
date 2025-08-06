import { IsInt, IsNumber, IsDateString } from 'class-validator';

export class CreateBidDto {
  @IsInt()
  userId: number;

  @IsInt()
  auctionId: number;

  @IsNumber()
  amount: number;

  @IsDateString()
  timestamp: string;
}
