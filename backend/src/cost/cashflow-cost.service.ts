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
    if (!Object.values(CostType).includes(type as CostType)) {
      throw new BadRequestException(
        `type must be one of: ${Object.values(CostType).join(', ')}`,
      );
    }
  }

  private validateAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a finite positive number');
    }

  }

  private validateName(name: string) {
    if (name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }
  }

  private validateDate(date: string) {
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

  async getCostsByType(costType: CostType): Promise<CashflowCost[]> {
    const tableName = process.env.CASHFLOW_COST_TABLE_NAME || '';
    this.logger.log(`Retrieving costs with type ${costType}`);

    if (!tableName) {
      this.logger.error('CASHFLOW_COST_TABLE_NAME is not defined');
      throw new InternalServerErrorException('Server configuration error');
    }

    const validCostTypes = Object.values(CostType) as CostType[];

    if (!validCostTypes.includes(costType)) {
      throw new BadRequestException(
        `costType must be one of: ${Object.values(CostType).join(', ')}`,
      );
    }

    try {
      const result = await this.dynamoDb
        .scan({
          TableName: tableName,
          FilterExpression: '#type = :type',
          ExpressionAttributeNames: {
            '#type': 'type',
          },
          ExpressionAttributeValues: {
            ':type': costType,
          },
        })
        .promise();
      
      this.logger.log(`Retrieved ${result.Items?.length ?? 0} costs with type ${costType}`);
      return (result.Items ?? []) as CashflowCost[];
    } catch (error) {
      this.logger.error(`Failed to retrieve costs with type ${costType}`, error as Error);
      throw new InternalServerErrorException(`Failed to retrieve costs with type ${costType}`);
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

    if (updates.amount !== undefined) {
      this.validateAmount(updates.amount);
    }
    if (updates.type !== undefined) {
      this.validateCostType(updates.type);
    }
    if (updates.name !== undefined) {
      this.validateName(updates.name);
      updates.name = updates.name.trim();
    }
    if (updates.date !== undefined) {
      this.validateDate(updates.date);
    }

    const shouldRename =
      updates.name !== undefined && updates.name.trim() !== normalizedName;

    if (shouldRename) {
      const targetName = updates.name as string;
      this.logger.log(`Renaming cost ${normalizedName} to ${targetName}`);

      try {
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
        const renamedCost: CashflowCost = {
          name: targetName,
          amount: updates.amount ?? existingCost.amount,
          type: updates.type ?? existingCost.type,
          date: updates.date
        };

        await this.dynamoDb
          .transactWrite({
            TransactItems: [
              {
                Put: {
                  TableName: tableName,
                  Item: renamedCost,
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

        return renamedCost;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        const awsError = error as { code?: string };
        if (awsError.code === 'ConditionalCheckFailedException') {
          throw new ConflictException(`Cost with name ${targetName} already exists`);
        }

        this.logger.error(
          `Failed to rename cost ${normalizedName} to ${targetName}`,
          error as Error,
        );
        throw new InternalServerErrorException(
          `Failed to update cost ${normalizedName}`,
        );
      }
    }

    let nonKeyUpdates: Partial<CashflowCost>= {};

    if (updates.amount !== undefined) {
      nonKeyUpdates.amount = updates.amount;
    }

    if (updates.type !== undefined) {
      nonKeyUpdates.type = updates.type;
    }

    const updateKeys = Object.keys(nonKeyUpdates) as Array<keyof CashflowCost>;

    if (updateKeys.length === 0) {
      throw new BadRequestException('At least one field is required for update');
    }

    const updateExpression =
      'SET ' + updateKeys.map((key) => `#${String(key)} = :${String(key)}`).join(', ');
    const expressionAttributeNames = updateKeys.reduce<Record<string, string>>(
      (acc, key) => {
        acc[`#${String(key)}`] = String(key);
        return acc;
      },
      {},
    );
    const expressionAttributeValues = updateKeys.reduce<Record<string, unknown>>(
      (acc, key) => {
        acc[`:${String(key)}`] = nonKeyUpdates[key];
        return acc;
      },
      {},
    );

    this.logger.log(`Updating cost ${normalizedName} with updates: ${JSON.stringify(updates)}`);

    try {
      const result = await this.dynamoDb
        .update({
          TableName: tableName,
          Key: { name: normalizedName },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: {
            ...expressionAttributeNames,
            '#name': 'name',
          },
          ExpressionAttributeValues: expressionAttributeValues,
          ConditionExpression: 'attribute_exists(#name)',
          ReturnValues: 'ALL_NEW',
        })
        .promise();

      return result.Attributes as CashflowCost;
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
