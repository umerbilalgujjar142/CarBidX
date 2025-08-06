import { Controller } from '@nestjs/common';
import { Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll() {
    return this.userService.getAllUsers();
  }

  @Post('add')
  async createUser(@Body() data: CreateUserDto) {
    return this.userService.createUser(data);
  }
}
