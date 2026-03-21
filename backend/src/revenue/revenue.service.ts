import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { CreateRevenueTypeBody, RevenueTypeValue, UpdateRevenueTypeBody } from './types/revenue.types';

interface RevenueTypeRecord {
  revenueTypeId: number;
  name: RevenueTypeValue;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AWSError extends Error {
  code?: string;
  statusCode?: number;
  requestId?: string;
  retryable?: boolean;
}

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);
  private readonly dynamoDb = new AWS.DynamoDB.DocumentClient();

  private get tableName(): string {
    return (
      process.env.DYNAMODB_REVENUE_TYPE_TABLE_NAME ||
      process.env.DYNAMODB_REVENUE_TABLE_NAME ||
      process.env.DYNAMODB_GRANT_TABLE_NAME ||
      'TABLE_FAILURE'
    );
  }

  private assertTableConfigured(): void {
    if (this.tableName === 'TABLE_FAILURE') {
      this.logger.error('Revenue type table environment variable is not set');
      throw new InternalServerErrorException(
        'Server configuration error: Revenue type DynamoDB table name not configured',
      );
    }
  }

  private isAWSError(error: unknown): error is AWSError {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('code' in error || 'statusCode' in error || 'requestId' in error)
    );
  }

  private handleAWSError(error: AWSError, operation: string): never {
    const message = error.message || 'Unknown AWS error';
    this.logger.error(`AWS error during ${operation}: ${message}`);

    switch (error.code) {
      case 'ResourceNotFoundException':
        throw new BadRequestException(`AWS DynamoDB Error: Table or resource not found. ${message}`);
      case 'ValidationException':
        throw new BadRequestException(`AWS DynamoDB Validation Error: Invalid request parameters. ${message}`);
      case 'ConditionalCheckFailedException':
        throw new BadRequestException(`AWS DynamoDB Error: Conditional check failed. ${message}`);
      case 'ProvisionedThroughputExceededException':
      case 'ThrottlingException':
        throw new InternalServerErrorException(`AWS DynamoDB Error: Request throttled, please retry. ${message}`);
      default:
        throw new InternalServerErrorException(`AWS DynamoDB Error during ${operation}: ${message}`);
    }
  }

  private validateRevenueTypeId(revenueTypeId: number): void {
    if (!Number.isInteger(revenueTypeId) || revenueTypeId <= 0) {
      throw new BadRequestException(
        `Invalid revenue type ID: ${revenueTypeId}. ID must be a positive integer.`,
      );
    }
  }

  async createRevenueType(body: CreateRevenueTypeBody): Promise<RevenueTypeRecord> {
    this.assertTableConfigured();

    const now = new Date().toISOString();
    const revenueTypeId = Date.now();
    const item: RevenueTypeRecord = {
      revenueTypeId,
      name: body.name,
      description: body.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(revenueTypeId)',
    };

    try {
      await this.dynamoDb.put(params).promise();
      return item;
    } catch (error) {
      if (this.isAWSError(error)) {
        this.handleAWSError(error, 'createRevenueType');
      }
      throw new InternalServerErrorException('Failed to create revenue type.');
    }
  }

  async getAllRevenueTypes(): Promise<RevenueTypeRecord[]> {
    this.assertTableConfigured();

    try {
      const data = await this.dynamoDb.scan({ TableName: this.tableName }).promise();
      return (data.Items as RevenueTypeRecord[]) || [];
    } catch (error) {
      if (this.isAWSError(error)) {
        this.handleAWSError(error, 'getAllRevenueTypes');
      }
      throw new InternalServerErrorException('Failed to retrieve revenue types.');
    }
  }

  async getRevenueTypeById(revenueTypeId: number): Promise<RevenueTypeRecord> {
    this.assertTableConfigured();
    this.validateRevenueTypeId(revenueTypeId);

    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: { revenueTypeId },
    };

    try {
      const data = await this.dynamoDb.get(params).promise();
      if (!data.Item) {
        throw new NotFoundException(`Revenue type ${revenueTypeId} not found.`);
      }
      return data.Item as RevenueTypeRecord;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (this.isAWSError(error)) {
        this.handleAWSError(error, 'getRevenueTypeById');
      }
      throw new InternalServerErrorException(`Failed to retrieve revenue type ${revenueTypeId}.`);
    }
  }

  async updateRevenueType(
    revenueTypeId: number,
    body: UpdateRevenueTypeBody,
  ): Promise<RevenueTypeRecord> {
    this.assertTableConfigured();
    this.validateRevenueTypeId(revenueTypeId);

    const entries = Object.entries(body).filter(([, value]) => value !== undefined);
    if (entries.length === 0) {
      throw new BadRequestException('No fields provided to update.');
    }

    const UpdateExpression =
      'SET ' +
      entries
        .map(([_, __], idx) => `#k${idx} = :v${idx}`)
        .concat('#updatedAt = :updatedAt')
        .join(', ');

    const ExpressionAttributeNames = entries.reduce<Record<string, string>>(
      (acc, [key], idx) => {
        acc[`#k${idx}`] = key;
        return acc;
      },
      { '#updatedAt': 'updatedAt' },
    );

    const ExpressionAttributeValues = entries.reduce<Record<string, unknown>>(
      (acc, [_, value], idx) => {
        acc[`:v${idx}`] = value;
        return acc;
      },
      { ':updatedAt': new Date().toISOString() },
    );

    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      Key: { revenueTypeId },
      ConditionExpression: 'attribute_exists(revenueTypeId)',
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    try {
      const data = await this.dynamoDb.update(params).promise();
      if (!data.Attributes) {
        throw new NotFoundException(`Revenue type ${revenueTypeId} not found.`);
      }
      return data.Attributes as RevenueTypeRecord;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (this.isAWSError(error) && error.code === 'ConditionalCheckFailedException') {
        throw new NotFoundException(`Revenue type ${revenueTypeId} not found.`);
      }
      if (this.isAWSError(error)) {
        this.handleAWSError(error, 'updateRevenueType');
      }
      throw new InternalServerErrorException(`Failed to update revenue type ${revenueTypeId}.`);
    }
  }

  async deleteRevenueTypeById(revenueTypeId: number): Promise<{ message: string }> {
    this.assertTableConfigured();
    this.validateRevenueTypeId(revenueTypeId);

    const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      Key: { revenueTypeId },
      ConditionExpression: 'attribute_exists(revenueTypeId)',
    };

    try {
      await this.dynamoDb.delete(params).promise();
      return { message: `Revenue type ${revenueTypeId} deleted successfully` };
    } catch (error) {
      if (this.isAWSError(error) && error.code === 'ConditionalCheckFailedException') {
        throw new NotFoundException(`Revenue type ${revenueTypeId} not found.`);
      }
      if (this.isAWSError(error)) {
        this.handleAWSError(error, 'deleteRevenueTypeById');
      }
      throw new InternalServerErrorException(`Failed to delete revenue type ${revenueTypeId}.`);
    }
  }
}