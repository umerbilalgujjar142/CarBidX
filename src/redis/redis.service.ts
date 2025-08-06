import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  public client: Redis;
  public pub: Redis;
  public sub: Redis;

  constructor() {
    this.client = new Redis();
    this.pub = new Redis();
    this.sub = new Redis();
  }
}
