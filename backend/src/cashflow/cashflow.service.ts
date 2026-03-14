import { Injectable, Logger } from "@nestjs/common";
import * as AWS from 'aws-sdk'; 

@Injectable()
export class CashflowService {
    private readonly logger = new Logger(CashflowService.name);
    private dynamoDb = new AWS.DynamoDB.DocumentClient();
    
}