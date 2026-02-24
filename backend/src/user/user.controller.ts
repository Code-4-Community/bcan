import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Req, Post, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "../../../middle-layer/types/User";
import { UserStatus } from "../../../middle-layer/types/UserStatus";
import { VerifyAdminRoleGuard, VerifyUserGuard, VerifyAdminOrEmployeeRoleGuard } from "../guards/auth.guard";
import { ApiResponse, ApiParam , ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody} from "@nestjs/swagger";
import { ChangeRoleBody, UploadProfilePicBody } from "./types/user.types";
import { FileInterceptor } from "@nestjs/platform-express";

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
    status : 403,
    description : "Forbidden"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminOrEmployeeRoleGuard)
  @ApiBearerAuth()
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
    status : 400,
    description : "{Error encountered}"
  })
  @ApiResponse({
    status : 403,
    description : "Forbidden"
  })
  @ApiResponse({
    status : 404,
    description : "Not Found"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminOrEmployeeRoleGuard)
  @ApiBearerAuth()
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
    status : 400,
    description : "{Error encountered}"
  })
  @ApiResponse({
    status : 401,
    description : "Unauthorized"
  })
  @ApiResponse({
    status : 403,
    description : "Forbidden"
  })
  @ApiResponse({
    status : 404,
    description : "Not Found"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminOrEmployeeRoleGuard)
  @ApiBearerAuth()
  async getAllActiveUsers(): Promise<User[]> {
    console.log("Fetching all active users");
    return await this.userService.getAllActiveUsers();
  }

  /**
   * Change a user's role (make sure guard is on this route)
   */
  @Post("change-role")
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
    status : 403,
    description : "Forbidden"
  })
  @ApiResponse({
    status : 404,
    description : "Not Found"
  })
  @ApiResponse({
    status : 409,
    description : "Conflict"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminRoleGuard)
  @ApiBearerAuth()
  async addToGroup(
    @Body() changeRoleBody: ChangeRoleBody,
    @Req() req: any
  ): Promise<User> {
    // Get the requesting admin from the authenticated session (attached by guard)
    const requestedBy: User = req.user;
    
    let newUser: User = await this.userService.addUserToGroup(
      changeRoleBody.user,
      changeRoleBody.groupName,
      requestedBy
    );
    return newUser as User;
  }

  /**
   * Delete a user
   */
  @Delete("delete-user/:email")
  @ApiParam({
    name: 'email',
    description: 'ID of the user to delete',
    required: true,
    type: String
  })
  @ApiResponse({
    status : 200,
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
    status : 403,
    description : "Forbidden"
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
  @ApiBearerAuth()
  async deleteUser(
    @Param('email') email: string,
    @Req() req: any
  ): Promise<User> {
    // Get the requesting admin from the authenticated session (attached by guard)
    const requestedBy: User = req.user;
    
    // Fetch the user to delete from the database
    const userToDelete: User = await this.userService.getUserByEmail(email);
    
    return await this.userService.deleteUser(userToDelete, requestedBy);
  }

  /**
   * Get user by email
   */
  @Get(":email")
  @ApiParam({
    name: 'email',
    description: 'User email to retrieve',
    required: true,
    type: String
  })
  @ApiResponse({
    status : 200,
    description : "User retrieved successfully"
  })
  @ApiResponse({
    status : 400,
    description : "{Error encountered}"
  })
  @ApiResponse({
    status : 403,
    description : "Forbidden"
  })
  @ApiResponse({
    status : 404,
    description : "Not Found"
  })
  @ApiResponse({
    status : 500,
    description : "Internal Server Error"
  })
  @UseGuards(VerifyAdminOrEmployeeRoleGuard)
  @ApiBearerAuth()
  async getUserById(@Param('email') email: string): Promise<User> {
    return await this.userService.getUserByEmail(email);
  }
}
