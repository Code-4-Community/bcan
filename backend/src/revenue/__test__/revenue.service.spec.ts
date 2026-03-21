import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RevenueTypeValue } from '../types/revenue.types';
import { RevenueService } from '../revenue.service';

const mockPromise = vi.fn();
const mockScan = vi.fn(() => ({ promise: mockPromise }));
const mockGet = vi.fn(() => ({ promise: mockPromise }));
const mockDelete = vi.fn(() => ({ promise: mockPromise }));
const mockUpdate = vi.fn(() => ({ promise: mockPromise }));
const mockPut = vi.fn(() => ({ promise: mockPromise }));

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  delete: mockDelete,
  update: mockUpdate,
  put: mockPut,
};

vi.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: vi.fn(function () {
      return mockDocumentClient;
    }),
  },
}));

describe('RevenueService', () => {
  let service: RevenueService;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.DYNAMODB_REVENUE_TYPE_TABLE_NAME = 'RevenueTypes';

    const module: TestingModule = await Test.createTestingModule({
      providers: [RevenueService],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a revenue type', async () => {
    mockPromise.mockResolvedValueOnce({});

    const result = await service.createRevenueType({
      name: RevenueTypeValue.Grants,
      description: 'Test description',
    });

    expect(result.name).toBe(RevenueTypeValue.Grants);
    expect(result.isActive).toBe(true);
    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'RevenueTypes',
      }),
    );
  });

  it('gets all revenue types', async () => {
    mockPromise.mockResolvedValueOnce({
      Items: [
        {
          revenueTypeId: 1,
          name: RevenueTypeValue.Donation,
          isActive: true,
          createdAt: '2026-03-19T00:00:00.000Z',
          updatedAt: '2026-03-19T00:00:00.000Z',
        },
      ],
    });

    const result = await service.getAllRevenueTypes();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(RevenueTypeValue.Donation);
  });

  it('gets one revenue type by id', async () => {
    mockPromise.mockResolvedValueOnce({
      Item: {
        revenueTypeId: 10,
        name: RevenueTypeValue.Fundraising,
        isActive: true,
        createdAt: '2026-03-19T00:00:00.000Z',
        updatedAt: '2026-03-19T00:00:00.000Z',
      },
    });

    const result = await service.getRevenueTypeById(10);

    expect(result.revenueTypeId).toBe(10);
    expect(result.name).toBe(RevenueTypeValue.Fundraising);
  });

  it('throws not found when revenue type is missing', async () => {
    mockPromise.mockResolvedValueOnce({ Item: undefined });

    await expect(service.getRevenueTypeById(404)).rejects.toThrow(NotFoundException);
  });

  it('throws bad request for invalid id input', async () => {
    await expect(service.getRevenueTypeById(0)).rejects.toThrow(BadRequestException);
  });

  it('updates revenue type', async () => {
    mockPromise.mockResolvedValueOnce({
      Attributes: {
        revenueTypeId: 1,
        name: RevenueTypeValue.Sponsorship,
        isActive: false,
        createdAt: '2026-03-19T00:00:00.000Z',
        updatedAt: '2026-03-19T01:00:00.000Z',
      },
    });

    const result = await service.updateRevenueType(1, { isActive: false });

    expect(result.isActive).toBe(false);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('deletes revenue type', async () => {
    mockPromise.mockResolvedValueOnce({});

    const result = await service.deleteRevenueTypeById(5);

    expect(result.message).toContain('deleted successfully');
    expect(mockDelete).toHaveBeenCalled();
  });

  it('maps aws validation exception to bad request', async () => {
    const awsError = new Error('bad params');
    (awsError as any).code = 'ValidationException';
    mockPromise.mockRejectedValueOnce(awsError);

    await expect(service.getAllRevenueTypes()).rejects.toThrow(BadRequestException);
  });

  it('throws internal server error for unexpected errors', async () => {
    mockPromise.mockRejectedValueOnce(new Error('unexpected'));

    await expect(service.getAllRevenueTypes()).rejects.toThrow(InternalServerErrorException);
  });
});
