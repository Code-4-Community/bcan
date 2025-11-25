import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AWS, { DynamoDB } from 'aws-sdk';

// Mock AWS SDK
vi.mock('aws-sdk', async () => {
  const mockDocumentClient = {
    scan: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    promise: vi.fn(),
  };
  
  const mockDynamoDB = {
    DocumentClient: vi.fn(() => mockDocumentClient)
  };

  const mockSES = vi.fn(() => ({
    // SES methods can be mocked here if needed
  }));

  return {
    default: {
      DynamoDB: mockDynamoDB,
      SES: mockSES
    },
    DynamoDB: mockDynamoDB,
    SES: mockSES
  };
});

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let mockDynamoDb: any;

  beforeEach(async () => {
    // Get the mocked DynamoDB instance
    mockDynamoDb = new AWS.DynamoDB.DocumentClient();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should get all users', async () => {
    const mockUsers = [
      { userId: '1', email: 'user1@example.com' },
      { userId: '2', email: 'user2@example.com' }
    ];

    // Setup the mock response
    mockDynamoDb.promise.mockResolvedValueOnce({ Items: mockUsers });

    const result = await userService.getAllUsers();
    expect(result).toEqual(mockUsers);
    expect(mockDynamoDb.scan).toHaveBeenCalledWith({
      TableName: expect.any(String)
    });
  });

  it('should get user by id', async () => {
    const mockUser = { userId: '1', email: 'user1@example.com' };
    
    // Setup the mock response
    mockDynamoDb.promise.mockResolvedValueOnce({ Item: mockUser });

    const result = await userService.getUserById('1');
    expect(result).toEqual(mockUser);
    expect(mockDynamoDb.get).toHaveBeenCalledWith({
      TableName: expect.any(String),
      Key: { userId: '1' }
    });
  });
});