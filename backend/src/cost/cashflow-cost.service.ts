import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { CashflowCost } from '../../../middle-layer/types/CashflowCost';
import { CostType } from '../../../middle-layer/types/CostType';

interface UpdateCostBody {
  amount?: number;
  type?: CostType;
  name?: string;
}

@Injectable()
export class CostService {
  private readonly logger = new Logger(CostService.name);
  private dynamoDb = new AWS.DynamoDB.DocumentClient();

  // Validation helper methods
  private validateCostType(type: string) {
    if (!Object.values(CostType).includes(type as CostType) || type === null) {
      throw new BadRequestException(
        `type must be one of: ${Object.values(CostType).join(', ')}`,
      );
    }
  }

  private validateAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0 || amount === null) {
      throw new BadRequestException('amount must be a finite positive number');
    }

  }

  private validateName(name: string) {
    if (name === null || name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }
  }

  private validateDate(date: string) {
    if (date === null) {
      throw new BadRequestException('date is required and must be a non-null string');
    }
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
    if (!iso8601Regex.test(date)) {
      throw new BadRequestException('date must be a valid ISO 8601 format string (e.g., "2026-03-22" or "2026-03-22T16:09:52Z")');
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('date must be a valid ISO 8601 date');
    }
  }

  // get all costs for cash flow
  async getAllCosts(): Promise<CashflowCost[]> {
    const tableName = process.env.CASHFLOW_COST_TABLE_NAME || '';
    this.logger.log('Retrieving all costs');

    if (!tableName) {
      this.logger.error('CASHFLOW_COST_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    try {
      const result = await this.dynamoDb
        .scan({
          TableName: tableName,
        })
        .promise();

      return (result.Items ?? []) as CashflowCost[];
    } catch (error) {
      this.logger.error('Failed to retrieve costs', error as Error);
      throw new InternalServerErrorException('Failed to retrieve costs');
    }
  }

  // gets a specific cost by its name, the key
  async getCostByName(costName: string): Promise<CashflowCost> {
    const tableName = process.env.CASHFLOW_COST_TABLE_NAME || '';
    this.validateName(costName);
    const normalizedName = costName.trim();
    this.logger.log(`Retrieving cost with name ${normalizedName}`);

    if (!tableName) {
      this.logger.error('CASHFLOW_COST_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    try {
      const result = await this.dynamoDb
        .get({
          TableName: tableName,
          Key: { name: normalizedName },
        })
        .promise();

      if (!result.Item) {
        this.logger.error(`Cost with name ${normalizedName} not found`);
        throw new NotFoundException(`Cost with name ${normalizedName} not found`);
      }

      return result.Item as CashflowCost;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to retrieve cost ${normalizedName}`, error as Error);
      throw new InternalServerErrorException(`Failed to retrieve cost ${normalizedName}`);
    }
  }

  async createCost(cost: CashflowCost): Promise<CashflowCost> {
    const tableName = process.env.CASHFLOW_COST_TABLE_NAME || '';
    this.validateAmount(cost.amount);
    this.validateCostType(cost.type);
    this.validateName(cost.name);
    const normalizedName = cost.name.trim();

    if (!tableName) {
      this.logger.error('CASHFLOW_COST_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    this.logger.log(`Creating cost with name ${normalizedName}`);
    
    try {
      await this.dynamoDb
        .put({
          TableName: tableName,
          Item: {
            ...cost,
            name: normalizedName,
          },
          ConditionExpression: 'attribute_not_exists(#name)',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
        })
        .promise();

      return {
        ...cost,
        name: normalizedName,
      };
    } catch (error) {
      const awsError = error as { code?: string };

      if (awsError.code === 'ConditionalCheckFailedException') {
        throw new ConflictException(`Cost with name ${normalizedName} already exists`);
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Failed to create cost', error as Error);
      throw new InternalServerErrorException('Failed to create cost');
    }
  }

  async updateCost(costName: string, updates: CashflowCost): Promise<CashflowCost> {
    const tableName = process.env.CASHFLOW_COST_TABLE_NAME || '';
    this.validateName(costName);
    const normalizedName = costName.trim();

    if (!tableName) {
      this.logger.error('CASHFLOW_COST_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    this.validateAmount(updates.amount);
    this.validateCostType(updates.type);

    if (updates.name !== undefined) {
      this.validateName(updates.name);
      updates.name = updates.name.trim();
    }

    this.validateDate(updates.date);

    const existingResult = await this.dynamoDb
      .get({
        TableName: tableName,
        Key: { name: normalizedName },
      })
      .promise();

    if (!existingResult.Item) {
      throw new NotFoundException(`Cost with name ${normalizedName} not found`);
    }

    const existingCost = existingResult.Item as CashflowCost;
    const existingDateTime = new Date(existingCost.date).getTime();
    const updatesDateTime = new Date(updates.date).getTime();
    const datesAreEqual =
      !Number.isNaN(existingDateTime) &&
      !Number.isNaN(updatesDateTime) &&
      existingDateTime === updatesDateTime;

    const isUnchanged =
      existingCost.name === updates.name &&
      existingCost.amount === updates.amount &&
      existingCost.type === updates.type &&
      datesAreEqual;

    if (isUnchanged) {
      this.logger.log(`No changes detected for cost ${normalizedName}; skipping update`);
      return existingCost;
    }

    const shouldRename = updates.name.trim() !== normalizedName;

    if (shouldRename) {
      this.logger.log(`Renaming cost ${normalizedName} to ${updates.name.trim()}`);

      try {
        await this.dynamoDb
          .transactWrite({
            TransactItems: [
              {
                Put: {
                  TableName: tableName,
                  Item: updates,
                  ConditionExpression: 'attribute_not_exists(#name)',
                  ExpressionAttributeNames: {
                    '#name': 'name',
                  },
                },
              },
              {
                Delete: {
                  TableName: tableName,
                  Key: { name: normalizedName },
                  ConditionExpression: 'attribute_exists(#name)',
                  ExpressionAttributeNames: {
                    '#name': 'name',
                  },
                },
              },
            ],
          })
          .promise();

        this.logger.log(`Successfully renamed cost ${normalizedName} to ${updates.name.trim()}`);
        return updates;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        const awsError = error as { code?: string };
        if (awsError.code === 'ConditionalCheckFailedException') {
          throw new ConflictException(`Cost with name ${updates.name.trim()} already exists`);
        }

        this.logger.error(
          `Failed to rename cost ${normalizedName} to ${updates.name.trim()}`,
          error as Error,
        );
        throw new InternalServerErrorException(
          `Failed to update cost ${normalizedName}`,
        );
      }
    }

    this.logger.log(`Replacing cost ${normalizedName} with payload: ${JSON.stringify(updates)}`);

    try {
      await this.dynamoDb
        .put({
          TableName: tableName,
          Item: updates,
          ConditionExpression: 'attribute_exists(#name)',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
        })
        .promise();

      return updates;
    } catch (error) {
      const awsError = error as { code?: string };
      if (awsError.code === 'ConditionalCheckFailedException') {
        throw new NotFoundException(`Cost with name ${normalizedName} not found`);
      }

      this.logger.error(`Failed to update cost ${normalizedName}`, error as Error);
      throw new InternalServerErrorException(`Failed to update cost ${normalizedName}`);
    }
  }

  async deleteCost(costName: string): Promise<string> {
    const tableName = process.env.CASHFLOW_COST_TABLE_NAME || '';
    this.validateName(costName);
    const normalizedName = costName.trim();

    if (!tableName) {
      this.logger.error('CASHFLOW_COST_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    this.logger.log(`Deleting cost ${normalizedName}`);

    try {
      await this.dynamoDb
        .delete({
          TableName: tableName,
          Key: { name: normalizedName },
          ConditionExpression: 'attribute_exists(#name)',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
        })
        .promise();

      return `Cost ${normalizedName} deleted successfully`;
    } catch (error) {
      const awsError = error as { code?: string };
      if (awsError.code === 'ConditionalCheckFailedException') {
        throw new NotFoundException(`Cost with name ${normalizedName} not found`);
      }

      this.logger.error(`Failed to delete cost ${normalizedName}`, error as Error);
      throw new InternalServerErrorException(`Failed to delete cost ${normalizedName}`);
    }
  }
}
