import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/Guard';
@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMyProfile(@GetUser() user: User) {
    console.log(user);
    return user;
  }
}
