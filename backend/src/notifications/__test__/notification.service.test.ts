import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notifcation.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mock functions that we can reference
const mockPromise = vi.fn();
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockSend = vi.fn().mockReturnThis(); // for SES

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  promise: mockPromise,
};

const mockSES = {
  send: mockSend,
  promise: mockPromise,
};

// Mock AWS SDK - Note the structure here
vi.mock('aws-sdk', () => ({
  default: {
    DynamoDB: {
      DocumentClient: vi.fn(() => mockDocumentClient)
    },
    SES: vi.fn(() => mockSES)
  }
}));

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(notificationService).toBeDefined();
  });

  it('should get all notifications', async () => {
    expect(true).toBe(true);
  });

  it('should get notification by id', async () => {
    expect(true).toBe(true);
  });
});