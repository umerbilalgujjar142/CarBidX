import { Controller, Get, Post, Body } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get()
  async getAll() {
    return this.bidService.getAllBids();
  }

  @Post('add')
  async createBid(@Body() data: CreateBidDto) {
    return this.bidService.createBid(data);
  }
}
