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

 async deleteUser(user: User, requestedBy: User): Promise<User> {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const tableName = process.env.DYNAMODB_USER_TABLE_NAME;
  const username = user.userId;

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
  if (!user || !user.userId) {
    this.logger.error("Invalid user object provided for deletion");
    throw new BadRequestException("Valid user object is required");
  }

  if (!requestedBy || !requestedBy.userId) {
    this.logger.error("Invalid requesting user object provided for deletion");
    throw new BadRequestException("Valid requesting user is required");
  }

  // 3. Authorization check
  if (requestedBy.position !== UserStatus.Admin) {
    this.logger.warn(
      `Unauthorized deletion attempt: ${requestedBy.userId} tried to delete ${username}`
    );
    throw new UnauthorizedException("Only administrators can delete users");
  }

  // 4. Prevent self-deletion
  if (requestedBy.userId === username) {
    throw new BadRequestException("Administrators cannot delete their own account");
  }

  // 5. Verify user exists in DynamoDB (data might be stale)
  let userToDelete: User;
  try {
    const params = {
      TableName: tableName,
      Key: { userId: username },
    };

    const result = await this.dynamoDb.get(params).promise();

    if (!result.Item) {
      this.logger.warn(`User ${username} not found in database`);
      throw new NotFoundException(`User '${username}' does not exist`);
    }

    userToDelete = result.Item as User;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    this.logger.error(`Error checking user existence: ${username}`, error);
    throw new InternalServerErrorException("Failed to verify user existence");
  }

  // 6. Delete from DynamoDB first (easier to rollback Cognito than DynamoDB)
  let dynamoDeleted = false;
  try {
    const deleteParams = {
      TableName: tableName,
      Key: { userId: username },
      ReturnValues: "ALL_OLD" as const,
    };

    const deleteResult = await this.dynamoDb.delete(deleteParams).promise();

    if (!deleteResult.Attributes) {
      throw new InternalServerErrorException(
        "Failed to delete user from database"
      );
    }

    dynamoDeleted = true;
    this.logger.log(`✓ User ${username} deleted from DynamoDB`);
  } catch (error: any) {
    this.logger.error(`Failed to delete ${username} from DynamoDB:`, error);

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
        Username: username,
      })
      .promise();

    this.logger.log(`✓ User ${username} deleted from Cognito`);
  } catch (cognitoError: any) {
    this.logger.error(
      `Failed to delete ${username} from Cognito:`,
      cognitoError
    );

    // Rollback: Restore user in DynamoDB
    if (dynamoDeleted) {
      this.logger.warn(
        `Attempting rollback: restoring ${username} to DynamoDB...`
      );

      try {
        await this.dynamoDb
          .put({
            TableName: tableName,
            Item: userToDelete,
          })
          .promise();

        this.logger.log(`✓ Rollback successful: User ${username} restored`);
      } catch (rollbackError) {
        this.logger.error(
          `Rollback failed: Could not restore ${username}`,
          rollbackError
        );
        this.logger.error(
          `CRITICAL: User ${username} deleted from DynamoDB but not from Cognito - manual sync required`
        );
      }
    }

    // Handle specific Cognito errors
    if (cognitoError.code === "UserNotFoundException") {
      throw new NotFoundException(
        `User '${username}' not found in authentication system`
      );
    }

    throw new InternalServerErrorException(
      "Failed to delete user from authentication system"
    );
  }

  this.logger.log(
    `✅ User ${username} deleted successfully by ${requestedBy.userId}`
  );

  return userToDelete;
}

  async getAllUsers(): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
    };

    try {
      const data = await this.dynamoDb.scan(params).promise();
      return data.Items;
    } catch (error) {
      throw new Error("Could not retrieve users.");
    }
  }
  async addUserToGroup(
    user: User,
    groupName: UserStatus,
    requestedBy: User
  ): Promise<User> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const tableName = process.env.DYNAMODB_USER_TABLE_NAME;
    const username = user.userId;
    const previousGroup = user.position; // Store the old group for rollback

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

    // 2. Authorization check
    if (requestedBy.position !== UserStatus.Admin) {
      this.logger.warn(
        `Unauthorized access attempt: ${requestedBy.userId} tried to add ${username} to ${groupName}`
      );
      throw new UnauthorizedException(
        "Only administrators can modify user groups"
      );
    }

    // 3. Validate group name is a valid UserStatus
    const validStatuses = Object.values(UserStatus);
    if (!validStatuses.includes(groupName)) {
      throw new BadRequestException(
        `Invalid group name. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // 4. Check if user exists in DynamoDB first
    try {
      const userCheckParams = {
        TableName: tableName,
        Key: { userId: username },
      };

      const existingUser = await this.dynamoDb.get(userCheckParams).promise();

      if (!existingUser.Item) {
        this.logger.warn(`User ${username} not found in database`);
        throw new NotFoundException(`User '${username}' does not exist`);
      }

      // 5. Check if user is already in the requested group
      const currentUser = existingUser.Item as User;
      if (currentUser.position === groupName) {
        this.logger.log(`User ${username} is already in group ${groupName}`);
        return currentUser; // No change needed
      }

      // 6. Prevent self-demotion for admins
      if (
        requestedBy.userId === username &&
        requestedBy.position === UserStatus.Admin &&
        groupName !== UserStatus.Admin
      ) {
        throw new BadRequestException(
          "Administrators cannot demote themselves"
        );
      }
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error checking user existence: ${username}`, error);
      throw new InternalServerErrorException("Failed to verify user existence");
    }

    try {
      // 7. Remove user from old Cognito group
      if (previousGroup) {
        try {
          await this.cognito
            .adminRemoveUserFromGroup({
              GroupName: previousGroup as string,
              UserPoolId: userPoolId,
              Username: username,
            })
            .promise();

          this.logger.log(
            `✓ User ${username} removed from Cognito group ${previousGroup}`
          );
        } catch (removeError: any) {
          // Log but don't fail if user wasn't in the old group
          this.logger.warn(
            `Could not remove ${username} from old group ${previousGroup}: ${removeError.message}`
          );
        }
      }

      // 8. Add user to new Cognito group
      await this.cognito
        .adminAddUserToGroup({
          GroupName: groupName as string,
          UserPoolId: userPoolId,
          Username: username,
        })
        .promise();

      this.logger.log(`✓ User ${username} added to Cognito group ${groupName}`);

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
            `Failed to send verification email to ${username}:`,
            emailError
          );
        }
      }
      else {
        this.logger.log(
          `No verification email sent to ${username}. Previous group: ${previousGroup}, New group: ${groupName}`
        );
      }
    } catch (cognitoError: any) {
      this.logger.error(
        `Failed to add ${username} to Cognito group ${groupName}:`,
        cognitoError
      );

      // Handle specific Cognito errors
      if (cognitoError.code === "UserNotFoundException") {
        throw new NotFoundException(
          `User '${username}' not found in authentication system`
        );
      } else if (cognitoError.code === "ResourceNotFoundException") {
        throw new InternalServerErrorException(
          `Group '${groupName}' does not exist in the system`
        );
      } else if (cognitoError.code === "InvalidParameterException") {
        throw new BadRequestException(
          `Invalid parameters: ${cognitoError.message}`
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
        Key: { userId: username },
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
        throw new InternalServerErrorException(
          "Failed to retrieve updated user data"
        );
      }

      this.logger.log(
        `✅ User ${username} successfully moved from ${previousGroup} to ${groupName} by ${requestedBy.userId}`
      );

      return result.Attributes as User;
    } catch (dynamoError: any) {
      this.logger.error(
        `Failed to update ${username} in DynamoDB:`,
        dynamoError
      );

      // Attempt rollback: revert Cognito group change
      this.logger.warn(
        `Attempting rollback: reverting Cognito group for ${username} back to ${previousGroup}...`
      );

      try {
        // Remove from new group
        await this.cognito
          .adminRemoveUserFromGroup({
            GroupName: groupName as string,
            UserPoolId: userPoolId,
            Username: username,
          })
          .promise();

        // Add back to old group
        if (previousGroup) {
          await this.cognito
            .adminAddUserToGroup({
              GroupName: previousGroup as string,
              UserPoolId: userPoolId,
              Username: username,
            })
            .promise();

          this.logger.log(
            `✓ Rollback successful: User ${username} restored to group ${previousGroup}`
          );
        }
      } catch (rollbackError: any) {
        this.logger.error(
          `Rollback failed: Could not restore ${username} to group ${previousGroup}`,
          rollbackError
        );
        this.logger.error(
          `CRITICAL: User ${username} group updated in Cognito to ${groupName} but not in DynamoDB - manual sync required`
        );
      }

      if (dynamoError.code === "ConditionalCheckFailedException") {
        throw new ConflictException(
          "User data was modified by another process"
        );
      }

      throw new InternalServerErrorException(
        "Failed to update user data in database"
      );
    }
  }

  async getUserById(userId: string): Promise<any> {
    const params = {
      TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
      Key: {
        userId,
      },
    };

    try {
      const data = await this.dynamoDb.get(params).promise();
      return data.Item;
    } catch (error) {
      throw new Error('Could not retrieve user.');
    }
  }

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
      const result = await this.dynamoDb.scan(params).promise();
      const users: User[] = (result.Items || []).map((item) => ({
        userId: item.userId, // Assign name to userId
        position: item.position as UserStatus,
        email: item.email,
        name: item.userId, // Keep name as name
      }));

      return users;
    } catch (error) {
      this.logger.error("Error scanning DynamoDB:", error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        "Failed to retrieve inactive users."
      );
    }
  }

  async getAllActiveUsers(): Promise<User[]> {
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
      const result = await this.dynamoDb.scan(params).promise();
      if (!result.Items) {
        this.logger.error("No active users found.");
        this.logger.error("DynamoDB scan result:", result);
        throw new NotFoundException("No active users found.");
      }
      const users: User[] = (result.Items || []).map((item) => ({
        userId: item.userId, // Assign name to userId
        position: item.position as UserStatus,
        email: item.email,
        name: item.userId, // Keep name as name
      }));
      this.logger.debug(`Fetched ${users.length} active users.`);

      return users;
    } catch (error) {
      this.logger.error("Error scanning DynamoDB:", error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        "Failed to retrieve inactive users."
      );
    }
  }



  // sends email to user once account is approved, used in method above when a user
  // is added to the Employee or Admin group from Inactive
  async sendVerificationEmail(userEmail: string): Promise<AWS.SES.SendEmailResponse> {
      // remove actual email and add to env later!!
      const fromEmail = process.env.NOTIFICATION_EMAIL_SENDER ||
      'c4cneu.bcan@gmail.com';

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
        const result = await this.ses.sendEmail(params).promise();
        this.logger.log(`Verification email sent to ${userEmail}`);
        return result;
      } catch (err: unknown) {
        this.logger.error('Error sending email: ', err);
        const errMessage = (err instanceof Error) ? err.message : 'Generic'; 
        throw new Error(`Failed to send email: ${errMessage}`);
      }
  }
}
