import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Injectable()
export class BidService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBids() {
    return this.prisma.bid.findMany();
  }

  async createBid(data: CreateBidDto) {
    return this.prisma.bid.create({ data });
  }
}
