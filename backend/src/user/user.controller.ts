import { Controller, Get, Post, Patch, Body, Param, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "../../../middle-layer/types/User";
import { UserStatus } from "../../../middle-layer/types/UserStatus";
import { VerifyAdminRoleGuard, VerifyUserGuard } from "../guards/auth.guard";
import { ApiResponse, ApiParam } from "@nestjs/swagger";
import { ChangeRoleBody, DeleteUserBody } from "./types/user.types";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users
   */
  @Get()
  @ApiResponse({
    status : 200,
    description : "All users retrieved successfully"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyUserGuard)
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }


  /**
   * Get all inactive users
   */
  @Get("inactive")
  @ApiResponse({
    status : 200,
    description : "All inactive users retrieved successfully"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyUserGuard)
  async getAllInactiveUsers(): Promise<User[]> {
    return await this.userService.getAllInactiveUsers();
  }

  /**
   * Get all active users
   */
  @Get("active")
  @ApiResponse({
    status : 200,
    description : "All active users retrieved successfully"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyUserGuard)
  async getAllActiveUsers(): Promise<User[]> {
    console.log("Fetching all active users");
    return await this.userService.getAllActiveUsers();
  }

  /**
   * Change a user's role (make sure guard is on this route)
   */
  @Patch("change-role")
  @ApiResponse({
    status : 200,
    description : "User role changed successfully"
  })
  @ApiResponse({
    status : 400,
    description : "{Error encountered}"
  })
  @ApiResponse({
    status : 401,
    description : "Unauthorized"
  })
  @ApiResponse({
    status : 404,
    description : "Not Found"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminRoleGuard)
  async addToGroup(
    @Body() changeRoleBody: ChangeRoleBody
  ): Promise<User> {
    let newUser: User = await this.userService.addUserToGroup(
      changeRoleBody.user,
      changeRoleBody.groupName,
      changeRoleBody.requestedBy
    );
    return newUser as User;
  }

  /**
   * Delete a user
   */
  @Post("delete-user")
  @ApiResponse({
    status : 201,
    description : "User deleted successfully"
  })
  @ApiResponse({
    status : 400,
    description : "{Error encountered}"
  })
  @ApiResponse({
    status : 401,
    description : "Unauthorized"
  })
  @ApiResponse({
    status : 404,
    description : "Not Found"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminRoleGuard)
  async deleteUser(
    @Body() deleteUserBody: DeleteUserBody  
  ): Promise<User> {
    let deletedUser = await this.userService.deleteUser(deleteUserBody.user, deleteUserBody.requestedBy);
    return deletedUser as User;
  }

  /**
   * Get user by ID
   */
  @Get(":id")
  @ApiParam({
    name: 'id',
    description: 'User ID to retrieve',
    required: true,
    type: String
  })
  @ApiResponse({
    status : 200,
    description : "User retrieved successfully"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyUserGuard)
  async getUserById(@Param('id') userId: string): Promise<User> {
    return await this.userService.getUserById(userId);
  }
}
