import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/Guard';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get('me')
  getMyProfile(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editMyProfile(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
