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
      throw new Error("Could not retrieve user.");
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
}
