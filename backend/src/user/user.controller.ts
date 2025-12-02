import { Controller, Get, Param,Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../../middle-layer/types/User';
import { UserStatus } from '../../../middle-layer/types/UserStatus';

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
   // Make sure to put a guard on this route
    @Post('change-role')
    async addToGroup(
      @Body('user') user: User,
      @Body('groupName') groupName: UserStatus,
      @Body('requestedBy') requestedBy: User,
    ): Promise< User > {
      let newUser:User = await this.userService.addUserToGroup(user, groupName,requestedBy);
      return newUser as User;
    }

   @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return await this.userService.getUserById(userId);
  }
}