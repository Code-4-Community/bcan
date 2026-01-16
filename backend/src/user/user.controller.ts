import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "../../../middle-layer/types/User";
import { UserStatus } from "../../../middle-layer/types/UserStatus";
import { VerifyAdminRoleGuard, VerifyUserGuard } from "../guards/auth.guard";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(VerifyUserGuard)
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get("inactive")
  @UseGuards(VerifyUserGuard)
  async getAllInactiveUsers(): Promise<User[]> {
    return await this.userService.getAllInactiveUsers();
  }

  @Get("active")
  @UseGuards(VerifyUserGuard)
  async getAllActiveUsers(): Promise<User[]> {
    console.log("Fetching all active users");
    return await this.userService.getAllActiveUsers();
  }
  // Make sure to put a guard on this route
  @Post("change-role")
  @UseGuards(VerifyAdminRoleGuard)
  async addToGroup(
    @Body("user") user: User,
    @Body("groupName") groupName: UserStatus,
    @Body("requestedBy") requestedBy: User
  ): Promise<User> {
    let newUser: User = await this.userService.addUserToGroup(
      user,
      groupName,
      requestedBy
    );
    return newUser as User;
  }

  @Post("delete-user")
  @UseGuards(VerifyAdminRoleGuard)
  async deleteUser(
    @Body("user") user: User,
    @Body("requestedBy") requestedBy: User
  ): Promise<User> {
    let deletedUser = await this.userService.deleteUser(user, requestedBy);
    return user as User;
  }

  @Get(":id")
  @UseGuards(VerifyUserGuard)
  async getUserById(@Param("id") userId: string) {
    return await this.userService.getUserById(userId);
  }
}
