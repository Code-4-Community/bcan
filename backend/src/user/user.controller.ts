import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../../middle-layer/types/User';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }


  @Get('inactive')
  async getAllInactiveUsers(): Promise<User[]> {
    return await this.userService.getAllInactiveUsers();
  }

  @Get('active')
  async getAllActiveUsers(): Promise<User[]> {
    console.log("Fetching all active users");
    return await this.userService.getAllActiveUsers();
  }

   @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return await this.userService.getUserById(userId);
  }

  // Make sure to put a guard on this route
  @Post('change-role')
  async addToGroup(
    @Body('username') username: string,
    @Body('groupName') groupName: string,
    @Body('requestedBy') requestedBy: string,
  ): Promise<{ message: string }> {
    await this.userService.addUserToGroup(username, groupName,requestedBy);
    return { message: `User changed to ${groupName} successfully` };
  }

}