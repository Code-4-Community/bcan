import { Test, TestingModule } from '@nestjs/testing';
import { GrantController } from '../grant.controller';
import { GrantService } from '../grant.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mock functions that we can reference
const mockPromise = vi.fn();
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  delete: mockDelete,
  promise: mockPromise,
};



// Mock AWS SDK - Note the structure here
vi.mock('aws-sdk', () => ({
  default: {
    DynamoDB: {
      DocumentClient: vi.fn(() => mockDocumentClient)
    }
  }
}));

describe('NotificationController', () => {
  let controller: GrantController;
  let grantService: GrantService;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrantController],
      providers: [GrantService],
    }).compile();

    controller = module.get<GrantController>(GrantController);
    grantService = module.get<GrantService>(GrantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(grantService).toBeDefined();
  });

  it('Test', async () => {
    expect(true).toBe(true);
  });

  it('Test', async () => {
    expect(true).toBe(true);
  });

  // Tests for deleteGrantById method
describe('deleteGrantById', () => {
  it('should call DynamoDB delete with the correct params and return success message', async () => {
    mockPromise.mockResolvedValueOnce({});

    const result = await grantService.deleteGrantById('123');

    expect(mockDelete).toHaveBeenCalledTimes(1); //ensures delete() was called once

    //ensures delete() received an object containing the expected key and condition
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: expect.any(String),
        Key: {grantId: '123'},
        ConditionExpression: 'attribute_exists(grantId)'
      }),
    );

    expect(result).toEqual(expect.stringContaining('deleted successfully')); //service returns a string, checks it mentions success
  });

  it('should throw "does not exist" when DynamoDB returns ConditionalCheckFailedException', async () => {
    //create an Error object and attach DynamoDB-style code
    const conditionalError = new Error('Conditional check failed');
    (conditionalError as any).code = 'ConditionalCheckFailedException';

    mockPromise.mockRejectedValueOnce(conditionalError);

    await expect(grantService.deleteGrantById('999'))
    .rejects.toThrow(/does not exist/);
  });

  it('should throw a generic failure when DynamoDB fails for other reasons', async () => {
    mockPromise.mockRejectedValueOnce(new Error('Some other DynamoDB error'));

    await expect(grantService.deleteGrantById('123'))
    .rejects.toThrow(/Failed to delete/);
  });
});
});