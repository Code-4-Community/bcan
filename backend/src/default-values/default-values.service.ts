import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { DefaultValuesResponse } from './types/default-values.types';

@Injectable()
export class DefaultValuesService {
  private readonly logger = new Logger(DefaultValuesService.name);
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  async getDefaultValues(): Promise<DefaultValuesResponse> {
    const tableName = process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME;

    if (!tableName) {
      this.logger.error('CASHFLOW_DEFAULT_VALUE_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    try {
      const result = await this.dynamoDb
        .scan({
          TableName: tableName,
          // Ensure update responses do not return stale values.
          ConsistentRead: true,
        })
        .promise();

      const items = (result.Items ?? []);

      const startingCash = items.find((item) => item.name === 'startingCash')?.value ?? null;
      const benefitsIncrease = items.find((item) => item.name === 'benefitsIncrease')?.value ?? null;
      const salaryIncrease = items.find((item) => item.name === 'salaryIncrease')?.value ?? null;

      if (startingCash === null || benefitsIncrease === null || salaryIncrease === null) {
        this.logger.error('Default values table is missing required fields');
        throw new NotFoundException('Default values not found');
      }

      const defaultValues: DefaultValuesResponse = {
        startingCash,
        benefitsIncrease,
        salaryIncrease,
      };

      return defaultValues;

    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error('Failed to retrieve default values', error as Error);
      throw new InternalServerErrorException('Failed to retrieve default values');
    }
  }

  async updateDefaultValue(
    key: string,
    value: number,
  ): Promise<DefaultValuesResponse> {
    const tableName = process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME;

    if (!tableName) {
      this.logger.error('CASHFLOW_DEFAULT_VALUE_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    if (!Number.isFinite(value)) {
      throw new BadRequestException('Value must be a valid number');
    }

    if (!(key === 'startingCash' || key === 'benefitsIncrease' || key === 'salaryIncrease')) {
      throw new BadRequestException(
        'Default value must be one of: startingCash, benefitsIncrease, salaryIncrease',
      );
    }

    try {
      await this.dynamoDb
        .put({
          TableName: tableName,
          Item: {
            name: key,
            value,
          },
          ConditionExpression: 'attribute_exists(#name)',  
          ExpressionAttributeNames: {  
            '#name': 'name',  
          }, 
        })
        .promise();

      return await this.getDefaultValues();  
    } catch (error) {  
      const awsError = error as AWS.AWSError;  

      if (awsError && awsError.code === 'ConditionalCheckFailedException') {  
        this.logger.warn(  
          `Attempted to update non-existent default value '${key}'`,  
        );  
        throw new NotFoundException(  
          `Default value '${key}' does not exist`,  
        );  
      }  
      
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(`Failed to update default value '${key}'`, error as Error);
      throw new InternalServerErrorException('Failed to update default value');
    }
  }
}