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
  @Delete("delete-user/:userId")
  @ApiParam({
    name: 'userId',
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
    @Param('userId') userId: string,
    @Req() req: any
  ): Promise<User> {
    // Get the requesting admin from the authenticated session (attached by guard)
    const requestedBy: User = req.user;
    
    // Fetch the user to delete from the database
    const userToDelete: User = await this.userService.getUserById(userId);
    
    return await this.userService.deleteUser(userToDelete, requestedBy);
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
  async getUserById(@Param('id') userId: string): Promise<User> {
    return await this.userService.getUserById(userId);
  }

  @Post('upload-pfp')
@ApiOperation({ 
  summary: 'Upload profile picture',
  description: 'Uploads a profile picture for a user to S3 and updates the user record in DynamoDB'
})
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'Profile picture upload with user information',
  schema: {
    type: 'object',
    required: ['profilePic', 'user'],
    properties: {
      profilePic: {
        type: 'string',
        format: 'binary',
        description: 'Image file (jpg, jpeg, png, gif, webp). Max size: 5MB'
      },
      user: {
        type: 'string',
        description: 'User object as JSON string',
        example: '{"userId":"user-123","position":"Employee","email":"john@example.com"}'
      }
    }
  }
})
@ApiResponse({
  status: 200,
  description: 'Profile picture uploaded successfully',
})
@ApiResponse({
  status: 400,
  description: 'Bad Request - Invalid file type, file too large, or invalid user data',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiResponse({
  status: 403,
  description: 'Forbidden',
})
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
@UseGuards(VerifyAdminOrEmployeeRoleGuard)
@ApiBearerAuth()
@UseInterceptors(FileInterceptor('profilePic'))
async uploadProfilePic(
  @UploadedFile() file: Express.Multer.File,
  @Body('user') userJson: string, // ✅ Comes as JSON string
) : Promise<String> {
  try {
    // Parse the JSON string to User object
    const user: User = JSON.parse(userJson);
    
    return await this.userService.uploadProfilePic(user, file);
  } catch (error) {
    throw new BadRequestException('Invalid user data format');
  }
}
}
