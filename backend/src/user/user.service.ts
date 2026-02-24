import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  HttpException,
} from "@nestjs/common";
import * as AWS from "aws-sdk";
import { User } from "../../../middle-layer/types/User";
import { UserStatus } from "../../../middle-layer/types/UserStatus";

/**
 * File could use safer 'User' typing after grabbing users, verifying type after the scan.
 */
@Injectable()
export class UserService {
  private cognito = new AWS.CognitoIdentityServiceProvider();

  private readonly logger = new Logger(UserService.name);
  private dynamoDb = new AWS.DynamoDB.DocumentClient();
  private ses = new AWS.SES({ region: process.env.AWS_REGION });
  private s3 = new AWS.S3();
  private profilePicBucket : string = process.env.PROFILE_PICTURE_BUCKET!;

async uploadProfilePic(user: User, pic: Express.Multer.File): Promise<String> {
  const tableName = process.env.DYNAMODB_USER_TABLE_NAME;

  // 1. Validate all inputs
  this.validateUploadInputs(user, pic, tableName);

  // 2. Generate filename: firstName-lastName-profilepic.ext
  const fileExtension = pic.originalname.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${user.firstName}-${user.lastName}-${user.email.slice(0,3)}-profilepic.${fileExtension}`;

  this.logger.log(`Uploading profile picture for user ${user.firstName} ${user.lastName} with key: ${key}`);

  try {
    // 3. Upload to S3
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.profilePicBucket,
      Key: key,
      Body: pic.buffer,
      ContentType: pic.mimetype,
    };

    const uploadResult = await this.s3.upload(uploadParams).promise();
    this.logger.log(`✓ Profile picture uploaded to S3: ${uploadResult.Location}`);

    // 4. Update user's profile picture URL in DynamoDB
    const updateParams = {
      TableName: tableName!,
      Key: { email: user.email },
      UpdateExpression: "SET profilePicUrl = :url",
      ExpressionAttributeValues: {
        ":url": uploadResult.Location,
      },
      ReturnValues: "ALL_NEW" as const,
    };

    const updateResult = await this.dynamoDb.update(updateParams).promise();

    if (!updateResult.Attributes) {
      this.logger.error(`DynamoDB update did not return updated attributes for ${user.email}`);
      throw new InternalServerErrorException("Failed to retrieve updated user data");
    }

    this.logger.log(`✅ Profile picture uploaded successfully for user ${user.email}`);
    return updateResult.Attributes.profilePicUrl;

  } catch (error: any) {
    this.logger.error(`Failed to upload profile picture for ${user.email}:`, error);

    // Handle S3 errors
    if (error.code === 'NoSuchBucket') {
      this.logger.error(`S3 bucket does not exist: ${this.profilePicBucket}`);
      throw new InternalServerErrorException('Storage bucket not found');
    } else if (error.code === 'AccessDenied') {
      this.logger.error('Access denied to S3 bucket');
      throw new InternalServerErrorException('Insufficient permissions to upload file');
    }

    // Handle DynamoDB errors
    if (error.code === 'ResourceNotFoundException') {
      this.logger.error('DynamoDB table does not exist');
      throw new InternalServerErrorException('Database table not found');
    } else if (error.code === 'ValidationException') {
      this.logger.error(`Invalid DynamoDB update parameters`);
      throw new BadRequestException(`Invalid update parameters`);
    }

    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error(`Failed to upload profile pic error: ${error}`)
    throw new InternalServerErrorException('Failed to upload profile picture');
  }
}

// Validation helper method for profile picture uploads
private validateUploadInputs(user: User, pic: Express.Multer.File, tableName: string | undefined): void {
  // Validate environment variables
  if (!this.profilePicBucket) {
    this.logger.error("Profile Picture Bucket is not defined in environment variables");
    throw new InternalServerErrorException("Server configuration error");
  }

  if (!user || !user.firstName || !user.lastName || !user.email) {
    this.logger.error("Invalid user object provided for upload");
    throw new BadRequestException("Valid user object is required");
  }

  if (!tableName) {
    this.logger.error("DynamoDB User Table Name is not defined in environment variables");
    throw new InternalServerErrorException("Server configuration error");
  }

  // Validate file exists
  if (!pic || !pic.buffer) {
    this.logger.error("Invalid file provided for upload");
    throw new BadRequestException("Valid image file is required");
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(pic.mimetype)) {
    this.logger.error(`Invalid file type: ${pic.mimetype}`);
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
    );
  }

  // Validate file size (5MB max)
  const maxSizeInBytes = 5 * 1024 * 1024;
  if (pic.size > maxSizeInBytes) {
    this.logger.error(`File too large: ${pic.size} bytes`);
    throw new BadRequestException(
      `File too large. Maximum size: ${maxSizeInBytes / (1024 * 1024)}MB`
    );
  }
}
  // purpose statement: deletes user from database; only admin can delete users
  // use case: employee is no longer with BCAN
 async deleteUser(user: User, requestedBy: User): Promise<User> {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const tableName = process.env.DYNAMODB_USER_TABLE_NAME;

  // 1. Validate environment variables
  if (!userPoolId) {
    this.logger.error("Cognito User Pool ID is not defined in environment variables");
    throw new InternalServerErrorException("Server configuration error");
  }

  if (!tableName) {
    this.logger.error("DynamoDB User Table Name is not defined in environment variables");
    throw new InternalServerErrorException("Server configuration error");
  }

  // 2. Validate input
  if (!user || !user.email) {
    this.logger.error("Invalid user object provided for deletion");
    throw new BadRequestException("Valid user object is required");
  }

  if (!requestedBy || !requestedBy.email) {
    this.logger.error("Invalid requesting user object provided for deletion");
    throw new BadRequestException("Valid requesting user is required");
  }

  const email = user.email; // now access userEmail after validating

  // 3. Authorization check
  if (requestedBy.position !== UserStatus.Admin) {
    this.logger.warn(
      `Unauthorized deletion attempt: ${requestedBy.email} tried to delete ${email}`
    );
    throw new UnauthorizedException("Only administrators can delete users");
  }

  // 4. Prevent self-deletion
  if (requestedBy.email === email) {
    this.logger.warn(`Administrator ${requestedBy.email} attempted to delete their own account`);
    throw new BadRequestException("Administrators cannot delete their own account");
  }

  // 5. Verify user exists in DynamoDB (data might be stale)
  let userToDelete: User;
  try {
    const params = {
      TableName: tableName,
      Key: { email: email },
    };

    const result = await this.dynamoDb.get(params).promise();

    if (!result.Item) {
      this.logger.warn(`User ${email} not found in database`);
      throw new NotFoundException(`User '${email}' does not exist`);
    }

    userToDelete = result.Item as User;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    this.logger.error(`Error checking user existence: ${email}`, error);
    throw new InternalServerErrorException("Failed to verify user existence");
  }

  // 6. Delete from DynamoDB first (easier to rollback Cognito than DynamoDB)
  let dynamoDeleted = false;
  try {
    const deleteParams = {
      TableName: tableName,
      Key: { email: email },
      ReturnValues: "ALL_OLD" as const,
    };

    const deleteResult = await this.dynamoDb.delete(deleteParams).promise();

    if (!deleteResult.Attributes) {
      this.logger.error(`DynamoDB delete did not return deleted attributes for ${email}`);
      throw new InternalServerErrorException(
        "Failed to delete user from database"
      );
    }

    dynamoDeleted = true;
    this.logger.log(`✓ User ${email} deleted from DynamoDB`);
  } catch (error: any) {
    this.logger.error(`Failed to delete ${email} from DynamoDB:`, error);

    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      "Failed to delete user from database"
    );
  }

  // 7. Delete from Cognito
  try {
    await this.cognito
      .adminDeleteUser({
        UserPoolId: userPoolId,
        Username: email,
      })
      .promise();

    this.logger.log(`✓ User ${email} deleted from Cognito`);
  } catch (cognitoError: any) {
    this.logger.error(
      `Failed to delete ${email} from Cognito:`,
      cognitoError
    );

    // Rollback: Restore user in DynamoDB
    if (dynamoDeleted) {
      this.logger.warn(
        `Attempting rollback: restoring ${email} to DynamoDB...`
      );

      try {
        await this.dynamoDb
          .put({
            TableName: tableName,
            Item: userToDelete,
          })
          .promise();

        this.logger.log(`✓ Rollback successful: User ${email} restored`);
      } catch (rollbackError) {
        this.logger.error(
          `Rollback failed: Could not restore ${email}`,
          rollbackError
        );
        this.logger.error(
          `CRITICAL: User ${email} deleted from DynamoDB but not from Cognito - manual sync required`
        );
      }
    }

    // Handle specific Cognito errors
    if (cognitoError.code === "UserNotFoundException") {
      this.logger.error(`User not found in Cognito: ${email}`);
      throw new NotFoundException(
        `User '${email}' not found in authentication system`
      );
    } else if (cognitoError.code === "InvalidParameterException") {
      this.logger.error(`Invalid Cognito parameters`);
      throw new BadRequestException(`Invalid parameters`);
    } else if (cognitoError.code === "TooManyRequestsException") {
      this.logger.error('Cognito rate limit exceeded');
      throw new InternalServerErrorException('Too many requests, please try again later');
    } else if (cognitoError.code === "NotAuthorizedException") {
      this.logger.error('Not authorized to delete user from Cognito');
      throw new UnauthorizedException('Insufficient permissions to delete user');
    }

    throw new InternalServerErrorException(
      "Failed to delete user from authentication system"
    );
  }

  this.logger.log(
    `✅ User ${email} deleted successfully by ${requestedBy.email}`
  );

  return userToDelete;
}

// purpose statement: retrieves all users from the database
// use case: admin wants to see all users on user management page
async getAllUsers(): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
    };

    try {
      this.logger.log('Executing DynamoDB scan to retrieve all users...');
      const data = await this.dynamoDb.scan(params).promise();
      
      const userCount = data.Items?.length || 0;
      this.logger.log(`✅ Successfully retrieved ${userCount} users from database`);
      
      return data.Items;
    } catch (error: any) {
      this.logger.error('Failed to retrieve users from DynamoDB:', error);
            
      // Handle specific AWS DynamoDB errors
      if (error.code === 'ResourceNotFoundException') {
        this.logger.error('DynamoDB table does not exist');
        throw new InternalServerErrorException('Database table not found');
      } else if (error.code === 'ProvisionedThroughputExceededException') {
        this.logger.error('DynamoDB throughput limit exceeded');
        throw new InternalServerErrorException('Database is temporarily unavailable, please try again');
      } else if (error.code === 'ValidationException') {
        this.logger.error(`Invalid DynamoDB request`);
        throw new BadRequestException(`Invalid request parameters`);
      }
      
      throw new InternalServerErrorException(`Could not retrieve users`);
    }
  }

  // purpose statement: adds user to a group/changes their role; only admin can do this
  // use case: admin wants to promote an employee to admin or activate an inactive user
async addUserToGroup(
    user: User,
    groupName: UserStatus,
    requestedBy: User
  ): Promise<User> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const tableName = process.env.DYNAMODB_USER_TABLE_NAME;

    // 1. Validate environment variables
    if (!userPoolId) {
      this.logger.error(
        "Cognito User Pool ID is not defined in environment variables"
      );
      throw new InternalServerErrorException("Server configuration error");
    }

    if (!tableName) {
      this.logger.error(
        "DynamoDB User Table Name is not defined in environment variables"
      );
      throw new InternalServerErrorException("Server configuration error");
    }

    // 2. Validate input FIRST before accessing any properties
    if (!user || !user.email) {
      this.logger.error("Invalid user object provided for role change");
      throw new BadRequestException("Valid user object is required");
    }

    if (!requestedBy || !requestedBy.email) {
      this.logger.error("Invalid requesting user object provided for role change");
      throw new BadRequestException("Valid requesting user is required");
    }

    if (!groupName) {
      this.logger.error("Group name is required for role change");
      throw new BadRequestException("Group name is required");
    }

    // Now safe to access user properties
    const email = user.email;
    const previousGroup = user.position; // Store the old group for rollback

    // Validate group name is a valid UserStatus
    const validStatuses = Object.values(UserStatus);
    if (!validStatuses.includes(groupName)) {
      this.logger.error(`Invalid group name: ${groupName}`);
      throw new BadRequestException(
        `Invalid group name. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // 3. Authorization check
    if (requestedBy.position !== UserStatus.Admin) {
      this.logger.warn(
        `Unauthorized access attempt: ${requestedBy.email} tried to add ${email} to ${groupName}`
      );
      throw new UnauthorizedException(
        "Only administrators can modify user groups"
      );
    }

    // 4. Check if user exists in DynamoDB first
    try {
      const userCheckParams = {
        TableName: tableName,
        Key: { email: email },
      };

      const existingUser = await this.dynamoDb.get(userCheckParams).promise();

      if (!existingUser.Item) {
        this.logger.warn(`User ${email} not found in database`);
        throw new NotFoundException(`User '${email}' does not exist`);
      }

      // 5. Check if user is already in the requested group
      const currentUser = existingUser.Item as User;
      if (currentUser.position === groupName) {
        this.logger.log(`User ${email} is already in group ${groupName}`);
        return currentUser; // No change needed
      }

      // 6. Prevent self-demotion for admins
      if (
        requestedBy.email === email &&
        requestedBy.position === UserStatus.Admin &&
        groupName !== UserStatus.Admin
      ) {
        this.logger.warn(
          `Administrator ${requestedBy.email} attempted to demote themselves`
        );
        throw new BadRequestException(
          "Administrators cannot demote themselves"
        );
      }
    } catch (error: any) {
      // Re-throw known exceptions
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error checking user existence: ${email}`, error);
      
      // Handle specific AWS DynamoDB errors
      if (error.code === 'ResourceNotFoundException') {
        this.logger.error('DynamoDB table does not exist');
        throw new InternalServerErrorException('Database table not found');
      } else if (error.code === 'ValidationException') {
        this.logger.error(`Invalid DynamoDB parameters`);
        throw new BadRequestException(`Invalid user data`);
      }
      
      throw new InternalServerErrorException(`Failed to verify user existence`);
    }

    try {
      // 7. Remove user from old Cognito group
      if (previousGroup) {
        try {
          await this.cognito
            .adminRemoveUserFromGroup({
              GroupName: previousGroup as string,
              UserPoolId: userPoolId,
              Username: email,
            })
            .promise();

          this.logger.log(
            `✓ User ${email} removed from Cognito group ${previousGroup}`
          );
        } catch (removeError: any) {
          // Log but don't fail if user wasn't in the old group
          this.logger.warn(
            `Could not remove ${email} from old group ${previousGroup}: ${removeError.message}`
          );
        }
      }

      // 8. Add user to new Cognito group
      await this.cognito
        .adminAddUserToGroup({
          GroupName: groupName as string,
          UserPoolId: userPoolId,
          Username: email,
        })
        .promise();

      this.logger.log(`✓ User ${email} added to Cognito group ${groupName}`);

      // Send verification email if moving from Inactive to employee group
      if (
        previousGroup === UserStatus.Inactive &&
        groupName === UserStatus.Employee
      ) {
        try {
          await this.sendVerificationEmail(user.email);
          this.logger.log(
            `✓ Verification email sent to ${user.email} upon group change to ${groupName}`
          );
        } catch (emailError) {
          this.logger.error(
            `Failed to send verification email to ${email}:`,
            emailError
          );
        }
      }
      else {
        this.logger.log(
          `No verification email sent to ${email}. Previous group: ${previousGroup}, New group: ${groupName}`
        );
      }
    } catch (cognitoError: any) {
      this.logger.error(
        `Failed to add ${email} to Cognito group ${groupName}:`,
        cognitoError
      );

      // Handle specific Cognito errors
      if (cognitoError.code === "UserNotFoundException") {
        this.logger.error(`User not found in Cognito: ${email}`);
        throw new NotFoundException(
          `User '${email}' not found in authentication system`
        );
      } else if (cognitoError.code === "ResourceNotFoundException") {
        this.logger.error(`Group not found in Cognito: ${groupName}`);
        throw new InternalServerErrorException(
          `Group '${groupName}' does not exist in the system`
        );
      } else if (cognitoError.code === "InvalidParameterException") {
        this.logger.error(
          `Invalid parameters provided for Cognito operation: ${cognitoError.message}`
        );
        throw new BadRequestException(
          `Invalid parameters: ${cognitoError.message}`
        );
      } else if (cognitoError.code === "TooManyRequestsException") {
        this.logger.error('Cognito rate limit exceeded');
        throw new InternalServerErrorException(
          'Too many requests, please try again later'
        );
      } else if (cognitoError.code === "NotAuthorizedException") {
        this.logger.error('Not authorized to perform this Cognito operation');
        throw new UnauthorizedException(
          'Insufficient permissions to modify user groups'
        );
      }

      throw new InternalServerErrorException(
        "Failed to update user group in authentication system"
      );
    }

    try {
      // 9. Update user's position in DynamoDB
      const params = {
        TableName: tableName,
        Key: { email: email },
        UpdateExpression: "SET #position = :position",
        ExpressionAttributeNames: {
          "#position": "position", // Add this to handle reserved keyword
        },
        ExpressionAttributeValues: {
          ":position": groupName as string,
        },
        ReturnValues: "ALL_NEW" as const,
      };

      const result = await this.dynamoDb.update(params).promise();

      if (!result.Attributes) {
        this.logger.error(
          `DynamoDB update did not return updated attributes for ${email}`
        );
        throw new InternalServerErrorException(
          "Failed to retrieve updated user data"
        );
      }

      this.logger.log(
        `✅ User ${email} successfully moved from ${previousGroup} to ${groupName} by ${requestedBy.firstName} ${requestedBy.lastName}`
      );

      return result.Attributes as User;
    } catch (dynamoError: any) {
      this.logger.error(
        `Failed to update ${email} in DynamoDB:`,
        dynamoError
      );

      // Attempt rollback: revert Cognito group change
      this.logger.warn(
        `Attempting rollback: reverting Cognito group for ${email} back to ${previousGroup}...`
      );

      try {
        // Remove from new group
        await this.cognito
          .adminRemoveUserFromGroup({
            GroupName: groupName as string,
            UserPoolId: userPoolId,
            Username: email,
          })
          .promise();

        // Add back to old group
        if (previousGroup) {
          await this.cognito
            .adminAddUserToGroup({
              GroupName: previousGroup as string,
              UserPoolId: userPoolId,
              Username: email,
            })
            .promise();

          this.logger.log(
            `✓ Rollback successful: User ${email} restored to group ${previousGroup}`
          );
        }
      } catch (rollbackError: any) {
        this.logger.error(
          `Rollback failed: Could not restore ${email} to group ${previousGroup}`,
          rollbackError
        );
        this.logger.error(
          `CRITICAL: User ${email} group updated in Cognito to ${groupName} but not in DynamoDB - manual sync required`
        );
      }

      // Handle specific DynamoDB errors
      if (dynamoError.code === "ConditionalCheckFailedException") {
        this.logger.error(
          `Conditional check failed while updating user ${email} in DynamoDB`
        );
        throw new ConflictException(
          "User data was modified by another process"
        );
      } else if (dynamoError.code === "ResourceNotFoundException") {
        this.logger.error('DynamoDB table does not exist');
        throw new InternalServerErrorException('Database table not found');
      } else if (dynamoError.code === "ValidationException") {
        this.logger.error(`Invalid DynamoDB update parameters`);
        throw new BadRequestException(`Invalid update parameters`);
      } else if (dynamoError.code === "ProvisionedThroughputExceededException") {
        this.logger.error('DynamoDB throughput limit exceeded');
        throw new InternalServerErrorException('Database is temporarily unavailable, please try again');
      }

      throw new InternalServerErrorException(
        "Failed to update user data in database"
      );
    }
  }

  // purpose statement: retrieves user by their email
  // use case: not actually sure right now, maybe is there is an option for admin to click on a specific user to see details?
  async getUserByEmail(email: string): Promise<User> {

    // Validate input
    if (!email || typeof email !== 'string' || email.trim() === '') {
      this.logger.error(`Invalid user email provided: ${email}`);
      throw new BadRequestException("Valid user email is required");
    }

    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
      Key: {
        email: email,
      },
    };

    try {
      this.logger.log(`Fetching user ${email} from DynamoDB...`);
      const data = await this.dynamoDb.get(params).promise();
      
      // Check if user exists
      if (!data.Item) {
        this.logger.warn(`User ${email} not found in database`);
        throw new NotFoundException(`User '${email}' does not exist`);
      }

      this.logger.log(`✅ Successfully retrieved user ${email}`);
      return data.Item as User;
    } catch (error: any) {
      // Re-throw known exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Failed to retrieve user ${email} from DynamoDB:`, error);
      
      // Handle specific AWS errors
      if (error.code === 'ResourceNotFoundException') {
        this.logger.error(`DynamoDB table not found`);
        throw new InternalServerErrorException("Database table not found");
      } else if (error.code === 'ValidationException') {
        this.logger.error(`Invalid DynamoDB request: ${error.message}`);
        throw new BadRequestException(`Invalid request: ${error.message}`);
      }
      
      throw new InternalServerErrorException('Could not retrieve user');
    }
  }

  // purpose statement: retrieves all inactive users
  // use case: for admin to see all users that need account approval on user management page (pending users tab)
  async getAllInactiveUsers(): Promise<User[]> {
    this.logger.log("Fetching all inactive users in service");

    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
      FilterExpression: "#pos IN (:inactive)",
      ExpressionAttributeNames: {
        "#pos": "position",
      },
      ExpressionAttributeValues: {
        ":inactive": "Inactive",
      },
    };

    try {
      this.logger.log('Executing DynamoDB scan with filter for Inactive users...');
      const result = await this.dynamoDb.scan(params).promise();
      
      const users: User[] = (result.Items || []).map((item) => ({
        position: item.position as UserStatus,
        email: item.email,
        firstName: item.firstName,
        lastName: item.lastName
      }));

      this.logger.log(`✅ Successfully retrieved ${users.length} inactive users`);
      return users;
    } catch (error: any) {
      this.logger.error("Error scanning DynamoDB:", error);
      if (error instanceof NotFoundException) throw error;
      
      // Handle specific AWS DynamoDB errors
      if (error.code === 'ResourceNotFoundException') {
        this.logger.error('DynamoDB table does not exist');
        throw new InternalServerErrorException('Database table not found');
      } else if (error.code === 'ProvisionedThroughputExceededException') {
        this.logger.error('DynamoDB throughput limit exceeded');
        throw new InternalServerErrorException('Database is temporarily unavailable, please try again');
      } else if (error.code === 'ValidationException') {
        this.logger.error(`Invalid scan parameters`);
        throw new BadRequestException(`Invalid filter expression`);
      }
      
      throw new InternalServerErrorException(
        "Failed to retrieve inactive users."
      );
    }
  }

  // purpose statement: retrieves all active users (Admins and Employees)
  // use case: for admin to see all current users on user management page (current users tab)
async getAllActiveUsers(): Promise<User[]> {
    this.logger.log('Starting getAllActiveUsers - Fetching all active users (Admin and Employee)');
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
      FilterExpression: "#pos IN (:admin, :employee)",
      ExpressionAttributeNames: {
        "#pos": "position",
      },
      ExpressionAttributeValues: {
        ":admin": "Admin",
        ":employee": "Employee",
      },
    };

    try {
      this.logger.log('Executing DynamoDB scan with filter for Admin and Employee users...');
      const result = await this.dynamoDb.scan(params).promise();
      if (!result.Items) {
        this.logger.error("No active users found.");
        this.logger.error("DynamoDB scan result:", result);
        throw new NotFoundException("No active users found.");
      }
      const users: User[] = (result.Items || []).map((item) => ({
        position: item.position as UserStatus,
        email: item.email,
        firstName: item.firstName,
        lastName: item.lastName
      }));
      
      this.logger.debug(`Fetched ${users.length} active users.`);

      return users;
    } catch (error: any) {
      this.logger.error("Error scanning DynamoDB:", error);
      if (error instanceof NotFoundException) throw error;
      
      // Handle specific AWS DynamoDB errors
      if (error.code === 'ResourceNotFoundException') {
        this.logger.error('DynamoDB table does not exist');
        throw new InternalServerErrorException('Database table not found');
      } else if (error.code === 'ProvisionedThroughputExceededException') {
        this.logger.error('DynamoDB throughput limit exceeded');
        throw new InternalServerErrorException('Database is temporarily unavailable, please try again');
      } else if (error.code === 'ValidationException') {
        this.logger.error(`Invalid scan parameters`);
        throw new BadRequestException(`Invalid filter expression`);
      }
      
      throw new InternalServerErrorException(
        "Failed to retrieve active users."
      );
    }
  }



  // purpose statement: sends email to user once account is approved, used in method above when a user
  // is added to the Employee or Admin group from Inactive
  async sendVerificationEmail(userEmail: string): Promise<AWS.SES.SendEmailResponse> {
      this.logger.log(`Starting sendVerificationEmail for email: ${userEmail}`);
      
      if (!userEmail || !this.isValidEmail(userEmail)) {
        this.logger.error(`Invalid email address provided: ${userEmail}`);
        throw new BadRequestException("Valid email address is required");
      }

      // remove actual email and add to env later!!
      const fromEmail = process.env.NOTIFICATION_EMAIL_SENDER || 'c4cneu.bcan@gmail.com';

      const params: AWS.SES.SendEmailRequest = {
        Source: fromEmail,
        Destination: {
          ToAddresses: [userEmail],
        },
        Message: {
          // UTF-8 is a top reliable way to define special characters and symbols in emails
          Subject: { Charset: 'UTF-8', Data: "BCAN Account Approval" },
          Body: {
            Text: { Charset: 'UTF-8', Data: "Your account has been approved; Try using your login credentials now!" },
          },
        },
      };

      try {
        this.logger.log(`Calling AWS SES to send email to ${userEmail}...`);
        const result = await this.ses.sendEmail(params).promise();
        this.logger.log(`✅ Verification email sent successfully to ${userEmail}. MessageId: ${result.MessageId}`);
        return result;
      } catch (err: unknown) {
        this.logger.error('Error sending email: ', err);
        const errMessage = (err instanceof Error) ? err.message : 'Unknown error'; 
        throw new InternalServerErrorException(`Failed to send email: ${errMessage}`);
      }
  }

  // Helper method for email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
