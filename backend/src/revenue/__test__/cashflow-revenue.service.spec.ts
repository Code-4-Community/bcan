import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { RevenueService } from '../cashflow-revenue.service';
import { RevenueType } from '../../../../middle-layer/types/RevenueType';
import { CashflowRevenue } from '../../../../middle-layer/types/CashflowRevenue';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';

// ─── Mock function declarations ───────────────────────────────────────────────
const mockGet    = vi.fn();
const mockScan   = vi.fn();
const mockPut    = vi.fn();
const mockDelete = vi.fn();

// ─── AWS SDK mock ─────────────────────────────────────────────────────────────
vi.mock('aws-sdk', () => {
  const documentClientFactory = vi.fn(function () {
    return { scan: mockScan, get: mockGet, put: mockPut, delete: mockDelete };
  });
  const awsMock = { DynamoDB: { DocumentClient: documentClientFactory } };
  return { ...awsMock, default: awsMock };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolved = (value: unknown) => ({ promise: vi.fn().mockResolvedValue(value) });
const rejected = (error: unknown) => ({ promise: vi.fn().mockRejectedValue(error) });
const awsError = (code: string, message = 'AWS error') => ({ code, message, requestId: 'mock-request-id' });

// ─── Mock data ────────────────────────────────────────────────────────────────
// IMPORTANT: installment dates must be ISO strings — the validator rejects Date objects
const mockRevenue: CashflowRevenue = {
  name: 'Test Revenue',
  amount: 1000,
  type: RevenueType.Donation,
  installments: [
    { amount: 500, date: '2024-01-01' as any },
    { amount: 500, date: '2024-06-01' as any },
  ],
};

const mockDatabase: CashflowRevenue[] = [
  { name: 'Revenue One',   amount: 1000, type: RevenueType.Donation,    installments: [{ amount: 1000, date: '2024-01-01' as any }] },
  { name: 'Revenue Two',   amount: 2000, type: RevenueType.Grants,      installments: [{ amount: 2000, date: '2024-02-01' as any }] },
  { name: 'Revenue Three', amount: 3000, type: RevenueType.Sponsorship, installments: [{ amount: 3000, date: '2024-03-01' as any }] },
];

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('RevenueService', () => {
  let service: RevenueService;

  beforeAll(() => {
    process.env.CASHFLOW_REVENUE_TABLE_NAME = 'test-revenue-table';
  });

  // Guarantee env var is restored after every test, even if the test throws
  afterEach(() => {
    process.env.CASHFLOW_REVENUE_TABLE_NAME = 'test-revenue-table';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    mockScan.mockReturnValue(resolved({}));
    mockGet.mockReturnValue(resolved({}));
    mockPut.mockReturnValue(resolved({}));
    mockDelete.mockReturnValue(resolved({}));

    const module: TestingModule = await Test.createTestingModule({
      providers: [RevenueService],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
  });

  // ─── getAllRevenue ───────────────────────────────────────────────────────────

  describe('getAllRevenue', () => {
    it('should return all revenue items', async () => {
      mockScan.mockReturnValue(resolved({ Items: mockDatabase }));
      const result = await service.getAllRevenue();
      expect(result).toHaveLength(3);
      expect(mockScan).toHaveBeenCalledWith({ TableName: 'test-revenue-table' });
    });

    it('should return an empty array when no items exist', async () => {
      mockScan.mockReturnValue(resolved({ Items: [] }));
      const result = await service.getAllRevenue();
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when response is null', async () => {
      mockScan.mockReturnValue(resolved(null));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when Items is undefined', async () => {
      mockScan.mockReturnValue(resolved({}));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name env var is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on generic unexpected error', async () => {
      mockScan.mockReturnValue(rejected(new Error('Unexpected error')));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on ResourceNotFoundException', async () => {
      mockScan.mockReturnValue(rejected(awsError('ResourceNotFoundException', 'Table not found')));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on ThrottlingException', async () => {
      mockScan.mockReturnValue(rejected(awsError('ThrottlingException')));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on ProvisionedThroughputExceededException', async () => {
      mockScan.mockReturnValue(rejected(awsError('ProvisionedThroughputExceededException')));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── createRevenue ──────────────────────────────────────────────────────────

  describe('createRevenue', () => {
    it('should create and return a revenue item', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      mockPut.mockReturnValue(resolved({}));
      const result = await service.createRevenue(mockRevenue);
      expect(result).toEqual({ ...mockRevenue, name: mockRevenue.name.trim() });
      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'test-revenue-table',
        ConditionExpression: 'attribute_not_exists(#name)',
      }));
    });

    it('should trim the name before saving', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      mockPut.mockReturnValue(resolved({}));
      const result = await service.createRevenue({ ...mockRevenue, name: '  Padded Name  ' });
      expect(result.name).toBe('Padded Name');
    });

    it('should use trimmed name as the DynamoDB key', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      mockPut.mockReturnValue(resolved({}));
      await service.createRevenue({ ...mockRevenue, name: '  Padded Name  ' });
      expect(mockGet).toHaveBeenCalledWith(expect.objectContaining({
        Key: { name: 'Padded Name' },
      }));
    });

    // Duplicate detection
    it('should throw BadRequestException when item with same name already exists', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(BadRequestException);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on ConditionalCheckFailedException race condition', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      mockPut.mockReturnValue(rejected(awsError('ConditionalCheckFailedException', 'Item already exists')));
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(BadRequestException);
    });

    // Validation — body
    it('should throw BadRequestException when revenue body is null', async () => {
      await expect(service.createRevenue(null as any)).rejects.toThrow(BadRequestException);
    });

    // Validation — amount
    it('should throw BadRequestException when amount is null', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is undefined', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: undefined as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is zero', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is negative', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: -100 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is Infinity', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: Infinity })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is NaN', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: NaN })).rejects.toThrow(BadRequestException);
    });

    // Validation — type
    it('should throw BadRequestException when type is invalid', async () => {
      await expect(service.createRevenue({ ...mockRevenue, type: 'InvalidType' as RevenueType })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when type is null', async () => {
      await expect(service.createRevenue({ ...mockRevenue, type: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when type is undefined', async () => {
      await expect(service.createRevenue({ ...mockRevenue, type: undefined as any })).rejects.toThrow(BadRequestException);
    });

    // Validation — name
    it('should throw BadRequestException when name is null', async () => {
      await expect(service.createRevenue({ ...mockRevenue, name: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is undefined', async () => {
      await expect(service.createRevenue({ ...mockRevenue, name: undefined as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is an empty string', async () => {
      await expect(service.createRevenue({ ...mockRevenue, name: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is only whitespace', async () => {
      await expect(service.createRevenue({ ...mockRevenue, name: '   ' })).rejects.toThrow(BadRequestException);
    });

    // Validation — installments
    it('should throw BadRequestException when installments is null', async () => {
      await expect(service.createRevenue({ ...mockRevenue, installments: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installments is undefined', async () => {
      await expect(service.createRevenue({ ...mockRevenue, installments: undefined as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installments is not an array', async () => {
      await expect(service.createRevenue({ ...mockRevenue, installments: 'bad' as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when an installment amount is negative', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        installments: [{ amount: -50, date: '2024-01-01' as any }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when an installment amount is zero', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        installments: [{ amount: 0, date: '2024-01-01' as any }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installment date is null', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        installments: [{ amount: 1000, date: null as any }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installment date is an invalid format', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        installments: [{ amount: 1000, date: 'not-a-date' as any }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installments do not sum to the total amount', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        amount: 1000,
        installments: [
          { amount: 400, date: '2024-01-01' as any },
          { amount: 400, date: '2024-06-01' as any },
        ],
      })).rejects.toThrow(BadRequestException);
    });

    // AWS errors
    it('should throw InternalServerErrorException when get check throws an AWS error', async () => {
      mockGet.mockReturnValue(rejected(awsError('ResourceNotFoundException')));
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on ThrottlingException during put', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      mockPut.mockReturnValue(rejected(awsError('ThrottlingException')));
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on generic unexpected error during put', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      mockPut.mockReturnValue(rejected(new Error('Unexpected error')));
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── updateRevenue ──────────────────────────────────────────────────────────

  describe('updateRevenue', () => {
    it('should update and return the revenue item when name is unchanged', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(resolved({}));
      const result = await service.updateRevenue('Test Revenue', mockRevenue);
      expect(result).toEqual({ ...mockRevenue, name: 'Test Revenue' });
      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'test-revenue-table',
        Item: expect.objectContaining({ name: 'Test Revenue' }),
      }));
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should trim both the route param and body name before comparing', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(resolved({}));
      const result = await service.updateRevenue('  Test Revenue  ', { ...mockRevenue, name: '  Test Revenue  ' });
      expect(result.name).toBe('Test Revenue');
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should put the new item and delete the old one when name changes', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(resolved({}));
      mockDelete.mockReturnValue(resolved({}));

      const renamed = { ...mockRevenue, name: 'New Name' };
      const result = await service.updateRevenue('Test Revenue', renamed);

      expect(result.name).toBe('New Name');
      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        Item: expect.objectContaining({ name: 'New Name' }),
      }));
      expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({
        Key: { name: 'Test Revenue' },
      }));
    });

    it('should not call delete when trimmed names are equal despite different surrounding whitespace', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(resolved({}));
      await service.updateRevenue('Test Revenue', { ...mockRevenue, name: '  Test Revenue  ' });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should use the route param name as the DynamoDB get key, not the body name', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(resolved({}));
      await service.updateRevenue('Test Revenue', { ...mockRevenue, name: 'Different Name' });
      expect(mockGet).toHaveBeenCalledWith(expect.objectContaining({
        Key: { name: 'Test Revenue' },
      }));
    });

    it('should throw InternalServerErrorException when delete fails after successful put during rename', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(resolved({}));
      mockDelete.mockReturnValue(rejected(awsError('InternalServerError')));
      await expect(
        service.updateRevenue('Test Revenue', { ...mockRevenue, name: 'New Name' })
      ).rejects.toThrow(InternalServerErrorException);
    });

    // Existence check
    it('should throw BadRequestException when item does not exist', async () => {
      mockGet.mockReturnValue(resolved({ Item: undefined }));
      await expect(service.updateRevenue('Nonexistent', mockRevenue)).rejects.toThrow(BadRequestException);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when get check throws an AWS error', async () => {
      mockGet.mockReturnValue(rejected(awsError('ProvisionedThroughputExceededException')));
      await expect(service.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when get check throws an unexpected error', async () => {
      mockGet.mockReturnValue(rejected(new Error('Network failure')));
      await expect(service.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    // Validation — body
    it('should throw BadRequestException when revenue body is null', async () => {
      await expect(service.updateRevenue('Test Revenue', null as any)).rejects.toThrow(BadRequestException);
    });

    // Validation — route name
    it('should throw BadRequestException when route name is null', async () => {
      await expect(service.updateRevenue(null as any, mockRevenue)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when route name is empty', async () => {
      await expect(service.updateRevenue('', mockRevenue)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when route name is only whitespace', async () => {
      await expect(service.updateRevenue('   ', mockRevenue)).rejects.toThrow(BadRequestException);
    });

    // Validation — amount
    it('should throw BadRequestException when amount is invalid', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, amount: -1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is NaN', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, amount: NaN })).rejects.toThrow(BadRequestException);
    });

    // Validation — type
    it('should throw BadRequestException when type is invalid', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, type: 'bad' as RevenueType })).rejects.toThrow(BadRequestException);
    });

    // Validation — body name
    it('should throw BadRequestException when body name is empty', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, name: '  ' })).rejects.toThrow(BadRequestException);
    });

    // Validation — installments
    it('should throw BadRequestException when installments do not sum to amount', async () => {
      await expect(service.updateRevenue('Test Revenue', {
        ...mockRevenue,
        amount: 1000,
        installments: [{ amount: 300, date: '2024-01-01' as any }],
      })).rejects.toThrow(BadRequestException);
    });

    // AWS errors on put
    it('should throw InternalServerErrorException on ThrottlingException during put', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(rejected(awsError('ThrottlingException')));
      await expect(service.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on generic unexpected error during put', async () => {
      mockGet.mockReturnValue(resolved({ Item: mockRevenue }));
      mockPut.mockReturnValue(rejected(new Error('Unexpected error')));
      await expect(service.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── deleteRevenue ──────────────────────────────────────────────────────────

  describe('deleteRevenue', () => {
    it('should delete a revenue item successfully', async () => {
      mockDelete.mockReturnValue(resolved({}));
      await expect(service.deleteRevenue('Test Revenue')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'test-revenue-table',
        Key: { name: 'Test Revenue' },
        ConditionExpression: 'attribute_exists(#name)',
      }));
    });

    it('should trim the name before deleting', async () => {
      mockDelete.mockReturnValue(resolved({}));
      await service.deleteRevenue('  Test Revenue  ');
      expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({
        Key: { name: 'Test Revenue' },
      }));
    });

    it('should throw BadRequestException when name is an empty string', async () => {
      await expect(service.deleteRevenue('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is only whitespace', async () => {
      await expect(service.deleteRevenue('   ')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is null', async () => {
      await expect(service.deleteRevenue(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is undefined', async () => {
      await expect(service.deleteRevenue(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when item does not exist (ConditionalCheckFailedException)', async () => {
      mockDelete.mockReturnValue(rejected(awsError('ConditionalCheckFailedException', 'Item does not exist')));
      await expect(service.deleteRevenue('Nonexistent')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on ResourceNotFoundException', async () => {
      mockDelete.mockReturnValue(rejected(awsError('ResourceNotFoundException', 'Table not found')));
      await expect(service.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on ThrottlingException', async () => {
      mockDelete.mockReturnValue(rejected(awsError('ThrottlingException')));
      await expect(service.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on generic unexpected error', async () => {
      mockDelete.mockReturnValue(rejected(new Error('Unexpected error')));
      await expect(service.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
    });
  });
});