import { Test, TestingModule } from '@nestjs/testing';
import { GrantController } from '../grant.controller';
import { GrantService } from '../grant.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mock functions that we can reference
const mockPromise = vi.fn();
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
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
});