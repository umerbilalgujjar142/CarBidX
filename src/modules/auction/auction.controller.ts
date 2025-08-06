import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  async getAll() {
    return this.auctionService.getAllAuctions();
  }

  @Post('add')
  async createAuction(@Body() data: CreateAuctionDto) {
    return this.auctionService.createAuction(data);
  }
}
