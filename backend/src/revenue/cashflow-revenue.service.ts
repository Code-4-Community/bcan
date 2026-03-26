import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as AWS from "aws-sdk";
import { CashflowRevenue } from "../types/CashflowRevenue";
import { AWSError } from "aws-sdk";
import { RevenueType } from "../../../middle-layer/types/RevenueType";
import { Installment } from "../../../middle-layer/types/Installment";

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);
  private dynamoDb = new AWS.DynamoDB.DocumentClient();
  private revenueTableName : string = process.env.CASHFLOW_REVENUE_TABLE_NAME || ""
  /**
   * Helper method to check if an error is an AWS error and extract relevant information
   */
  private isAWSError(error: unknown): error is AWSError {
    return (
      typeof error === "object" &&
      error !== null &&
      ("code" in error || "statusCode" in error || "requestId" in error)
    );
  }

  /**
   * Helper method to handle AWS errors and throw appropriate NestJS exceptions
   */
  private handleAWSError(
    error: AWSError,
    operation: string,
    context?: string,
  ): never {
    const errorContext = context ? ` (${context})` : "";
    const errorDetails = {
      code: error.code,
      message: error.message,
      requestId: error.requestId,
      retryable: error.retryable,
    };

    this.logger.error(`AWS Error during ${operation}${errorContext}:`, {
      ...errorDetails,
      stack: error.stack,
    });

    // Handle specific AWS error codes
    switch (error.code) {
      case "ResourceNotFoundException":
        throw new BadRequestException(
          `AWS DynamoDB Error: Table or resource not found. ${error.message}`,
        );
      case "ValidationException":
        throw new BadRequestException(
          `AWS DynamoDB Validation Error: Invalid request parameters. ${error.message}`,
        );
      case "ProvisionedThroughputExceededException":
        throw new InternalServerErrorException(
          `AWS DynamoDB Error: Request rate too high. Please retry later. ${error.message}`,
        );
      case "ThrottlingException":
        throw new InternalServerErrorException(
          `AWS DynamoDB Error: Request throttled. Please retry later. ${error.message}`,
        );
      case "ConditionalCheckFailedException":
        throw new BadRequestException(
          `AWS DynamoDB Error: Conditional check failed. ${error.message}`,
        );
      case "ItemCollectionSizeLimitExceededException":
        throw new BadRequestException(
          `AWS DynamoDB Error: Item collection size limit exceeded. ${error.message}`,
        );
      default:
        throw new InternalServerErrorException(
          `AWS DynamoDB Error during ${operation}: ${error.message || "Unknown AWS error"}`,
        );
    }
  }
  /**
   * Method to validate the money amount of a revenue object is valid
   * @param amount Number amount for a revenue source
   */
  private validateAmount(amount: number): void {
  if (amount === undefined || amount === null) {
    this.logger.error('Validation failed: amount is required');
    throw new BadRequestException('amount is required');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    this.logger.error(`Validation failed: invalid amount value: ${amount}`);
    throw new BadRequestException('amount must be a finite positive number');
  }
}

/**
 * Method to validate a revenue source
 * @param type Type of revenue source
 */
private validateType(type: RevenueType): void {
  if (type === undefined || type === null) {
    this.logger.error('Validation failed: type is required');
    throw new BadRequestException('type is required');
  }
  if (!Object.values(RevenueType).includes(type)) {
    this.logger.error(`Validation failed: invalid type value: ${type}`);
    throw new BadRequestException(
      `type must be one of: ${Object.values(RevenueType).join(', ')}`,
    );
  }
}

/**
 * Method to validate the name of a revenue source
 * @param name Name of a revenue source
 */
private validateName(name: string): void {
  if (name === undefined || name === null) {
    this.logger.error('Validation failed: name is required');
    throw new BadRequestException('name is required');
  }
  if (name.trim().length === 0) {
    this.logger.error('Validation failed: name is empty or whitespace');
    throw new BadRequestException('name must be a non-empty string');
  }
}

/**
 * Method to validate the inputted installments are valid
 * @param installments Installment array to represent when a revenue would be dispersed
 */
private validateInstallments(installments: Installment[], amount: number): void {
  if (installments === undefined || installments === null) {
    this.logger.error('Validation failed: installments is required');
    throw new BadRequestException('installments is required');
  }
  if (!Array.isArray(installments)) {
    this.logger.error(`Validation failed: installments is not an array, received: ${typeof installments}`);
    throw new BadRequestException('installments must be an array');
  }
  let total = 0;
  installments.forEach((installment, index) => {
    if (!Number.isFinite(installment.amount) || installment.amount <= 0) {
      this.logger.error(
        `Validation failed: installments[${index}].amount is invalid: ${installment.amount}`,
      );
      throw new BadRequestException(
        `installments[${index}].amount must be a finite positive number`,
      );
    }
    if (!installment.date) {
      this.logger.error(`Validation failed: installments[${index}].date is required`);
      throw new BadRequestException(`installments[${index}].date is required`);
    }
    const isoFullRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateStr = String(installment.date);
    if (!isoFullRegex.test(dateStr) && !isoDateRegex.test(dateStr)) {
      this.logger.error(`Validation failed: installments[${index}].date is not a valid ISO date: ${installment.date}`);
      throw new BadRequestException(`installments[${index}].date must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.mmmZ)`);
    }
    const parsedDate = new Date(installment.date);
    if (isNaN(parsedDate.getTime())) {
      this.logger.error(`Validation failed: installments[${index}].date is not a valid date: ${installment.date}`);
      throw new BadRequestException(`installments[${index}].date must be a valid date`);
    }
    total += installment.amount;
  });

  if (amount != total) {
    this.logger.error(`Validation failed: installments summed up does not equal total amount`);
    throw new BadRequestException('Installment summed up does not equal total amount');
  }
}

/**
 * Method to validate a revenue object for the cashflow
 * @param revenue Revenue object to represent a cashflow revenue source
 */
private validateRevenueObject(revenue: CashflowRevenue): void {
  if (!revenue) {
    this.logger.error('Validation failed: revenue body is required');
    throw new BadRequestException('revenue body is required');
  }
  this.validateAmount(revenue.amount);
  this.validateType(revenue.type);
  this.validateName(revenue.name);
  this.validateInstallments(revenue.installments,revenue.amount);

  
}

/**
 * Method to validate the dynamo db table name
 * @param tableName name of the revenue dynamo db table
 */
private validateTableName(tableName : string){
    if (
      tableName === "" ||
      tableName === null ||
      tableName === undefined
    ) {
      this.logger.error("Revenue table env variable is not filled in");
      throw new InternalServerErrorException("Server Config Error");
    }
}

  /**
   * Method to retrieve all of the revenue data
   * @returns All the revenue objects in the data base
   */
  async getAllRevenue(): Promise<CashflowRevenue[]> {
    this.logger.log("Retrieving all the cashflow revenue data");


    this.validateTableName(this.revenueTableName)

    const params = { TableName: this.revenueTableName };

    try {
      this.logger.debug(`Scanning Revenue DynamoDB table: ${params.TableName}`);
      const data = await this.dynamoDb.scan(params).promise();
      if (!data || !data.Items) {
        this.logger.error("There has been an error");
        throw new InternalServerErrorException("Internal Server Error");
      }

      if (data.Items?.length === 0) {
        this.logger.warn("There are zero revenue items in the database");
        return [] as CashflowRevenue[];
      }
      const revenue = (data.Items as CashflowRevenue[]) || [];
      this.logger.log(
        `Retrived ${revenue.length} revenue items from the backend`,
      );
      return revenue;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      if(this.isAWSError(error)){
        try{
            this.handleAWSError(error, "getAllRevenue", `table ${params.TableName}`)
        } catch(error){
            throw new InternalServerErrorException("Internal Server Error")
        }
      }

      this.logger.error("Uncaught Error fetching all Revenue data: ", error)
      throw new InternalServerErrorException("Internal Server Error")
    }
    // Call to the database
    // Handle errors based off errors
  }

  /**
   * Method to create a new revenue object
   * @param revenue Revenue object being created
   * @returns Returns the uploaded cashflow revenue
   */
async createRevenue(revenue: CashflowRevenue): Promise<CashflowRevenue> {
  this.validateRevenueObject(revenue);
  this.validateTableName(this.revenueTableName);

  const normalizedRevenue = {
    ...revenue,
    name: revenue.name.trim(),
  };

  // Check if a revenue item with the same name already exists
  const getParams = {
    TableName: this.revenueTableName,
    Key: { name: normalizedRevenue.name },
  };

  try {
    this.logger.log(`Checking if revenue item with name '${normalizedRevenue.name}' already exists`);
    const existing = await this.dynamoDb.get(getParams).promise();
    if (existing.Item) {
      this.logger.error(`Revenue item with name '${normalizedRevenue.name}' already exists`);
      throw new BadRequestException(`A revenue item with the name '${normalizedRevenue.name}' already exists`);
    }
  } catch (error) {
    if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
      throw error;
    }
    if (this.isAWSError(error)) {
      this.logger.error('AWS error during duplicate check for createRevenue: ', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
    this.logger.error('Uncaught error checking for duplicate revenue item: ', error);
    throw new InternalServerErrorException('Internal Server Error');
  }

  const params = {
    TableName: this.revenueTableName,
    Item: normalizedRevenue,
    ConditionExpression: 'attribute_not_exists(#name)',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
  };

  try {
    this.logger.log(`Creating revenue item with name: ${normalizedRevenue.name}`);
    await this.dynamoDb.put(params).promise();
    this.logger.log(`Successfully created revenue item with name: ${normalizedRevenue.name}`);
    return normalizedRevenue;
  } catch (error) {
    if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
      throw error;
    }
    if (this.isAWSError(error)) {
      if (error.code === 'ConditionalCheckFailedException') {
        this.logger.error(`Revenue item with name '${normalizedRevenue.name}' already exists (race condition)`);
        throw new BadRequestException(`A revenue item with the name '${normalizedRevenue.name}' already exists`);
      }
      this.logger.error('AWS error during createRevenue: ', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
    this.logger.error('Uncaught error creating revenue item: ', error);
    throw new InternalServerErrorException('Internal Server Error');
  }
}

async updateRevenue(name: string, revenue: CashflowRevenue): Promise<CashflowRevenue> {
  this.validateRevenueObject(revenue);
  this.validateName(name);
  this.validateTableName(this.revenueTableName);

  const normalizedRevenue = {
    ...revenue,
    name: revenue.name.trim(),
  };

  // Check if the revenue item actually exists before updating
  const getParams = {
    TableName: this.revenueTableName,
    Key: { name: name.trim() },
  };

  try {
    this.logger.log(`Checking if revenue item with name '${name}' exists`);
    const existing = await this.dynamoDb.get(getParams).promise();
    if (!existing.Item) {
      this.logger.error(`Revenue item with name '${name}' does not exist`);
      throw new BadRequestException(`A revenue item with the name '${name}' does not exist`);
    }
  } catch (error) {
    if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
      throw error;
    }
    if (this.isAWSError(error)) {
      this.logger.error('AWS error during existence check for updateRevenue: ', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
    this.logger.error('Uncaught error checking for revenue item existence: ', error);
    throw new InternalServerErrorException('Internal Server Error');
  }

  const params = {
    TableName: this.revenueTableName,
    Item: normalizedRevenue,
    ConditionExpression: 'attribute_exists(#name)',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
  };

  try {
    this.logger.log(`Updating revenue item with name: ${name}`);
    await this.dynamoDb.put(params).promise();
    this.logger.log(`Successfully updated revenue item with name: ${name}`);
    return normalizedRevenue;
  } catch (error) {
    if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
      throw error;
    }
    if (this.isAWSError(error)) {
      if (error.code === 'ConditionalCheckFailedException') {
        this.logger.error(`Revenue item with name '${name}' does not exist (race condition)`);
        throw new BadRequestException(`A revenue item with the name '${name}' does not exist`);
      }
      this.logger.error('AWS error during updateRevenue: ', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
    this.logger.error('Uncaught error updating revenue item: ', error);
    throw new InternalServerErrorException('Internal Server Error');
  }
}

  async deleteRevenue(name: string): Promise<void> {
    this.validateTableName(this.revenueTableName);
    this.validateName(name)

    if (!name || name.trim().length === 0) {
      this.logger.error('Validation failed: name param is required for delete');
      throw new BadRequestException('name is required');
    }

    const params = {
      TableName: this.revenueTableName,
      Key: { name: name.trim() },
      ConditionExpression: 'attribute_exists(#name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
    };

    try {
      this.logger.log(`Deleting revenue item with name: ${name}`);
      await this.dynamoDb.delete(params).promise();
      this.logger.log(`Successfully deleted revenue item with name: ${name}`);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      if (this.isAWSError(error)) {
        try {
          this.handleAWSError(error, 'deleteRevenue', `table ${params.TableName}`);
        } catch (handledError) {
          throw new InternalServerErrorException('Internal Server Error');
        }
      }

      this.logger.error('Uncaught error deleting revenue item: ', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
