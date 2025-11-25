import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import AWS from "aws-sdk";
import { User } from "../../../middle-layer/types/User";
import { UserStatus } from "../../../middle-layer/types/UserStatus";

/**
 * File could use safer 'User' typing after grabbing users, verifying type after the scan.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private dynamoDb = new AWS.DynamoDB.DocumentClient();
  private ses = new AWS.SES({ region: process.env.AWS_REGION });
  private cognito = new AWS.CognitoIdentityServiceProvider();

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

  async addUserToGroup(username: string, groupName: string, requestedBy : string): Promise<void> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (
      groupName !== "Employee" &&
      groupName !== "Admin" &&
      groupName !== "Inactive"
    ) {
      throw new Error(
        "Invalid group name. Must be Employee, Admin, or Inactive."
      );
    }
    try {
      // Check current groups before adding to new group
      const listGroupsParams = {
        UserPoolId: userPoolId || "POOL_FAILURE",
        Username: username,
      };
      const userGroups = await this.cognito.adminListGroupsForUser(listGroupsParams).promise();
      const wasInactive = userGroups.Groups?.some(group => group.GroupName === 'Inactive') ?? false;

      // Remove user from all current groups to ensure single-group membership
      if (userGroups.Groups && userGroups.Groups.length > 0) {
        for (const group of userGroups.Groups) {
          await this.cognito.adminRemoveUserFromGroup({
            UserPoolId: userPoolId || "POOL_FAILURE",
            Username: username,
            GroupName: group.GroupName || '',
          }).promise();
          this.logger.log(`Removed ${username} from group ${group.GroupName}`);
        }
      }

      // Now add user to the new group
      await this.cognito.adminAddUserToGroup({
        GroupName: groupName,
        UserPoolId: userPoolId || "POOL_FAILURE",
        Username: username,
       });

      if (groupName === "Employee" && wasInactive) {
         // Fetch user email from DynamoDB
        const params = {
          TableName: process.env.DYNAMODB_USER_TABLE_NAME || "TABLE_FAILURE",
          Key: {
            userId: username,
          },
        };
        const data = await this.dynamoDb.get(params).promise();
        const userEmail = data.Item?.email;
        if (userEmail) {
          await this.sendVerificationEmail(userEmail);
          this.logger.log(`Verification email sent to ${username} (${userEmail}) after activation from Inactive status`);
        } else {
          this.logger.warn(`Could not send verification email to ${username}: email not found`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
         this.logger.error("Registration failed", error.stack);
         throw new Error(error.message || "Registration failed");
       }
       throw new Error("An unknown error occurred during registration");
     }
   }

  // sends email to user once account is approved, used in method above when a user
  // is added to the Employee or Admin group from Inactive
  async sendVerificationEmail(userEmail: string): Promise<AWS.SES.SendEmailResponse> {
      // may want to have the default be the BCAN email or something else
      const fromEmail = process.env.NOTIFICATION_EMAIL_SENDER ||
      'u&@nveR1ified-failure@dont-send.com';

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
