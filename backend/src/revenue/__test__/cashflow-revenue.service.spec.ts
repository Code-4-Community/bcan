import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { RevenueService } from '../cashflow-revenue.service';
import { RevenueType } from '../../../../middle-layer/types/RevenueType';
import { CashflowRevenue } from '../../../../middle-layer/types/CashflowRevenue';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// ─── Mock function declarations ───────────────────────────────────────────────
const mockPromise = vi.fn();

const mockScan   = vi.fn(() => ({ promise: mockPromise }));
const mockPut    = vi.fn(() => ({ promise: mockPromise }));
const mockDelete = vi.fn(() => ({ promise: mockPromise }));

// ─── AWS SDK mock ─────────────────────────────────────────────────────────────
vi.mock('aws-sdk', () => {
  const documentClientFactory = vi.fn(function () {
    return { scan: mockScan, put: mockPut, delete: mockDelete };
  });

  const awsMock = {
    DynamoDB: { DocumentClient: documentClientFactory },
  };

  return { ...awsMock, default: awsMock };
});

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockRevenue: CashflowRevenue = {
  name: 'Test Revenue',
  amount: 1000,
  type: RevenueType.Donation,
  installments: [
    { amount: 500, date: new Date('2024-01-01') },
    { amount: 500, date: new Date('2024-06-01') },
  ],
};

const mockDatabase: CashflowRevenue[] = [
  { name: 'Revenue One',   amount: 1000, type: RevenueType.Donation,     installments: [{ amount: 1000, date: new Date('2024-01-01') }] },
  { name: 'Revenue Two',   amount: 2000, type: RevenueType.Grants,       installments: [{ amount: 2000, date: new Date('2024-02-01') }] },
  { name: 'Revenue Three', amount: 3000, type: RevenueType.Sponsorship,  installments: [{ amount: 3000, date: new Date('2024-03-01') }] },
];

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('RevenueService', () => {
  let service: RevenueService;

  beforeAll(() => {
    process.env.CASHFLOW_REVENUE_TABLE_NAME = 'test-revenue-table';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    mockScan.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });
    mockDelete.mockReturnValue({ promise: mockPromise });
    mockPromise.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [RevenueService],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
  });

  // ─── getAllRevenue ───────────────────────────────────────────────────────────

  describe('getAllRevenue', () => {
    it('should return all revenue items', async () => {
      mockPromise.mockResolvedValueOnce({ Items: mockDatabase });
      const result = await service.getAllRevenue();
      expect(result).toHaveLength(3);
      expect(mockScan).toHaveBeenCalledWith({ TableName: 'test-revenue-table' });
    });

    it('should return empty array when no items exist', async () => {
      mockPromise.mockResolvedValueOnce({ Items: [] });
      const result = await service.getAllRevenue();
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when data is null', async () => {
      mockPromise.mockResolvedValueOnce(null);
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when Items is undefined', async () => {
      mockPromise.mockResolvedValueOnce({});
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
      process.env.CASHFLOW_REVENUE_TABLE_NAME = 'test-revenue-table';
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockPromise.mockRejectedValueOnce(new Error('Unexpected error'));
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle ResourceNotFoundException', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Table not found' });
      await expect(service.getAllRevenue()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── createRevenue ──────────────────────────────────────────────────────────

  describe('createRevenue', () => {
    it('should create and return a revenue item', async () => {
      mockPromise.mockResolvedValueOnce({});
      const result = await service.createRevenue(mockRevenue);
      expect(result).toEqual({ ...mockRevenue, name: mockRevenue.name.trim() });
      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'test-revenue-table',
        ConditionExpression: 'attribute_not_exists(#name)',
      }));
    });

    it('should trim the name before saving', async () => {
      mockPromise.mockResolvedValueOnce({});
      const result = await service.createRevenue({ ...mockRevenue, name: '  Padded Name  ' });
      expect(result.name).toBe('Padded Name');
    });

    it('should throw BadRequestException when revenue body is missing', async () => {
      await expect(service.createRevenue(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is null', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is zero', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is negative', async () => {
      await expect(service.createRevenue({ ...mockRevenue, amount: -100 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when type is invalid', async () => {
      await expect(service.createRevenue({ ...mockRevenue, type: 'InvalidType' as RevenueType })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when type is missing', async () => {
      await expect(service.createRevenue({ ...mockRevenue, type: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is missing', async () => {
      await expect(service.createRevenue({ ...mockRevenue, name: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is empty string', async () => {
      await expect(service.createRevenue({ ...mockRevenue, name: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installments is missing', async () => {
      await expect(service.createRevenue({ ...mockRevenue, installments: null as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installments is not an array', async () => {
      await expect(service.createRevenue({ ...mockRevenue, installments: 'bad' as any })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installment amount is invalid', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        installments: [{ amount: -50, date: new Date() }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when installment date is missing', async () => {
      await expect(service.createRevenue({
        ...mockRevenue,
        installments: [{ amount: 500, date: null as any }],
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockPromise.mockRejectedValueOnce(new Error('Unexpected error'));
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle ConditionalCheckFailedException when item already exists', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ConditionalCheckFailedException', message: 'Item already exists' });
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle ThrottlingException', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ThrottlingException', message: 'Request throttled' });
      await expect(service.createRevenue(mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── updateRevenue ──────────────────────────────────────────────────────────

  describe('updateRevenue', () => {
    it('should update and return the revenue item', async () => {
      mockPromise.mockResolvedValueOnce({});
      const result = await service.updateRevenue('Test Revenue', mockRevenue);
      expect(result).toEqual({ ...mockRevenue, name: mockRevenue.name.trim() });
      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'test-revenue-table',
        ConditionExpression: 'attribute_exists(#name)',
      }));
    });

    it('should trim the name before saving', async () => {
      mockPromise.mockResolvedValueOnce({});
      const result = await service.updateRevenue('Padded Name', { ...mockRevenue, name: '  Padded Name  ' });
      expect(result.name).toBe('Padded Name');
    });

    it('should throw BadRequestException when revenue body is null', async () => {
      await expect(service.updateRevenue('Test Revenue', null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is invalid', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, amount: -1 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when type is invalid', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, type: 'bad' as RevenueType })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is empty', async () => {
      await expect(service.updateRevenue('Test Revenue', { ...mockRevenue, name: '  ' })).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when item does not exist', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ConditionalCheckFailedException', message: 'Item does not exist', requestId: '123' });
      await expect(service.updateRevenue('Nonexistent', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
      process.env.CASHFLOW_REVENUE_TABLE_NAME = 'test-revenue-table';
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockPromise.mockRejectedValueOnce(new Error('Unexpected error'));
      await expect(service.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle ProvisionedThroughputExceededException', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ProvisionedThroughputExceededException', message: 'Throughput exceeded', requestId: '123' });
      await expect(service.updateRevenue('Test Revenue', mockRevenue)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── deleteRevenue ──────────────────────────────────────────────────────────

  describe('deleteRevenue', () => {
    it('should delete a revenue item successfully', async () => {
      mockPromise.mockResolvedValueOnce({});
      await expect(service.deleteRevenue('Test Revenue')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({
        TableName: 'test-revenue-table',
        Key: { name: 'Test Revenue' },
        ConditionExpression: 'attribute_exists(#name)',
      }));
    });

    it('should trim name before deleting', async () => {
      mockPromise.mockResolvedValueOnce({});
      await service.deleteRevenue('  Test Revenue  ');
      expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({
        Key: { name: 'Test Revenue' },
      }));
    });

    it('should throw BadRequestException when name is empty', async () => {
      await expect(service.deleteRevenue('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when name is whitespace', async () => {
      await expect(service.deleteRevenue('   ')).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when item does not exist', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ConditionalCheckFailedException', message: 'Item does not exist', requestId: '123' });
      await expect(service.deleteRevenue('Nonexistent')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when table name is not set', async () => {
      delete process.env.CASHFLOW_REVENUE_TABLE_NAME;
      const module = await Test.createTestingModule({ providers: [RevenueService] }).compile();
      const serviceNoTable = module.get<RevenueService>(RevenueService);
      await expect(serviceNoTable.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
      process.env.CASHFLOW_REVENUE_TABLE_NAME = 'test-revenue-table';
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockPromise.mockRejectedValueOnce(new Error('Unexpected error'));
      await expect(service.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle ResourceNotFoundException', async () => {
      mockPromise.mockRejectedValueOnce({ code: 'ResourceNotFoundException', message: 'Table not found', requestId: '123' });
      await expect(service.deleteRevenue('Test Revenue')).rejects.toThrow(InternalServerErrorException);
    });
  });
});