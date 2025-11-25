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

  async sendVerificationEmail(userEmail: string): Promise<AWS.SES.SendEmailResponse> {
      // may want to have the default be the BCAN email
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
