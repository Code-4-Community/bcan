import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostService } from '../cashflow-cost.service';
import { CostType } from '../../../../middle-layer/types/CostType';
import { CashflowCost } from '../../../../middle-layer/types/CashflowCost';
import { TDateISO } from '../../utils/date';

const mockScanPromise = vi.fn();
const mockGetPromise = vi.fn();
const mockPutPromise = vi.fn();
const mockUpdatePromise = vi.fn();
const mockDeletePromise = vi.fn();
const mockTransactWritePromise = vi.fn();

const mockScan = vi.fn(() => ({ promise: mockScanPromise }));
const mockGet = vi.fn(() => ({ promise: mockGetPromise }));
const mockPut = vi.fn(() => ({ promise: mockPutPromise }));
const mockUpdate = vi.fn(() => ({ promise: mockUpdatePromise }));
const mockDelete = vi.fn(() => ({ promise: mockDeletePromise }));
const mockTransactWrite = vi.fn(() => ({ promise: mockTransactWritePromise }));

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  put: mockPut,
  update: mockUpdate,
  delete: mockDelete,
  transactWrite: mockTransactWrite,
};

vi.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: vi.fn(function () {
      return mockDocumentClient;
    }),
  },
}));

describe('CostService', () => {
  let service: CostService;

  beforeEach(async () => {
    vi.clearAllMocks();

    process.env.CASHFLOW_COST_TABLE_NAME = 'Costs';

    const module: TestingModule = await Test.createTestingModule({
      providers: [CostService],
    }).compile();

    service = module.get<CostService>(CostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCosts()', () => {
    it('returns all costs', async () => {
      const items = [
        { name: 'Food', amount: 200, type: CostType.MealsFood },
        { name: 'Rent', amount: 500, type: CostType.RentAndSpace },
      ];
      mockScanPromise.mockResolvedValue({ Items: items });

      const result = await service.getAllCosts();

      expect(result).toEqual(items);
      expect(mockScan).toHaveBeenCalledWith({ TableName: 'Costs' });
    });

    it('returns empty list when no costs exist', async () => {
      mockScanPromise.mockResolvedValue({ Items: [] });

      const result = await service.getAllCosts();

      expect(result).toEqual([]);
    });

    it('throws InternalServerErrorException when table name is missing', async () => {
      delete process.env.CASHFLOW_COST_TABLE_NAME;

      await expect(service.getAllCosts()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getAllCosts()).rejects.toThrow(
        'Server configuration error',
      );
    });

    it('throws InternalServerErrorException on DynamoDB error', async () => {
      mockScanPromise.mockRejectedValue(new Error('scan failed'));

      await expect(service.getAllCosts()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getAllCosts()).rejects.toThrow(
        'Failed to retrieve costs',
      );
    });
  });

  describe('getCostByName()', () => {
    it('returns a cost by name and trims whitespace', async () => {
      const item = { name: 'Food', amount: 200, type: CostType.MealsFood };
      mockGetPromise.mockResolvedValue({ Item: item });

      const result = await service.getCostByName('  Food  ');

      expect(result).toEqual(item);
      expect(mockGet).toHaveBeenCalledWith({
        TableName: 'Costs',
        Key: { name: 'Food' },
      });
    });

    it('throws BadRequestException for empty name', async () => {
      await expect(service.getCostByName('   ')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getCostByName('   ')).rejects.toThrow(
        'name must be a non-empty string',
      );
    });

    it('throws NotFoundException when cost does not exist', async () => {
      mockGetPromise.mockResolvedValue({ Item: undefined });

      await expect(service.getCostByName('Food')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCostByName('Food')).rejects.toThrow(
        'Cost with name Food not found',
      );
    });

    it('throws InternalServerErrorException when table name is missing', async () => {
      delete process.env.CASHFLOW_COST_TABLE_NAME;

      await expect(service.getCostByName('Food')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getCostByName('Food')).rejects.toThrow(
        'Server configuration error',
      );
    });

    it('throws InternalServerErrorException on DynamoDB error', async () => {
      mockGetPromise.mockRejectedValue(new Error('get failed'));

      await expect(service.getCostByName('Food')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getCostByName('Food')).rejects.toThrow(
        'Failed to retrieve cost Food',
      );
    });
  });

  describe('getCostsByType()', () => {
    it('returns costs filtered by type', async () => {
      const items = [{ name: 'Food', amount: 200, type: CostType.MealsFood }];
      mockScanPromise.mockResolvedValue({ Items: items });

      const result = await service.getCostsByType(CostType.MealsFood);

      expect(result).toEqual(items);
      expect(mockScan).toHaveBeenCalledWith({
        TableName: 'Costs',
        FilterExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':type': CostType.MealsFood,
        },
      });
    });

    it('throws InternalServerErrorException when table name is missing', async () => {
      delete process.env.CASHFLOW_COST_TABLE_NAME;

      await expect(service.getCostsByType(CostType.MealsFood)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException on DynamoDB error', async () => {
      mockScanPromise.mockRejectedValue(new Error('scan failed'));

      await expect(service.getCostsByType(CostType.MealsFood)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getCostsByType(CostType.MealsFood)).rejects.toThrow(
        `Failed to retrieve costs with type ${CostType.MealsFood}`,
      );
    });
  });

  describe('createCost()', () => {
    it('creates a cost and trims the name', async () => {
      mockPutPromise.mockResolvedValue({});
      const payload = {
        name: '  Food  ',
        amount: 200,
        type: CostType.MealsFood,
        date: '2026-03-22' as TDateISO,
      };

      const result = await service.createCost(payload);

      expect(result).toEqual({
        name: 'Food',
        amount: 200,
        type: CostType.MealsFood,
        date: '2026-03-22',
      });
      expect(mockPut).toHaveBeenCalledWith({
        TableName: 'Costs',
        Item: {
          name: 'Food',
          amount: 200,
          type: CostType.MealsFood,
          date: '2026-03-22',
        },
        ConditionExpression: 'attribute_not_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('throws BadRequestException for invalid amount', async () => {
      await expect(
        service.createCost({
          name: 'Food',
          amount: 0,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createCost({
          name: 'Food',
          amount: 0,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow('amount must be a finite positive number');
    });

    it('throws BadRequestException for invalid type', async () => {
      await expect(
        service.createCost({
          name: 'Food',
          amount: 100,
          type: 'INVALID' as unknown as CostType,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid name', async () => {
      await expect(
        service.createCost({
          name: '   ',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createCost({
          name: '   ',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow('name must be a non-empty string');
    });

    it('throws ConflictException when cost already exists', async () => {
      mockPutPromise.mockRejectedValue({ code: 'ConditionalCheckFailedException' });

      await expect(
        service.createCost({
          name: 'Food',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createCost({
          name: 'Food',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow('Cost with name Food already exists');
    });

    it('throws InternalServerErrorException when table name is missing', async () => {
      delete process.env.CASHFLOW_COST_TABLE_NAME;

      await expect(
        service.createCost({
          name: 'Food',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException on DynamoDB error', async () => {
      mockPutPromise.mockRejectedValue(new Error('put failed'));

      await expect(
        service.createCost({
          name: 'Food',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.createCost({
          name: 'Food',
          amount: 100,
          type: CostType.MealsFood,
          date: '2026-03-22' as TDateISO,
        }),
      ).rejects.toThrow('Failed to create cost');
    });
  });

  describe('updateCost()', () => {
    it('updates non-key fields for an existing cost', async () => {
      const updatedItem = {
        name: 'Food',
        amount: 300,
        type: CostType.Services,
      };
      mockUpdatePromise.mockResolvedValue({ Attributes: updatedItem });

      const result = await service.updateCost('Food', {
        amount: 300,
        type: CostType.Services,
      });

      expect(result).toEqual(updatedItem);
      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: 'Costs',
        Key: { name: 'Food' },
        UpdateExpression: 'SET #amount = :amount, #type = :type',
        ExpressionAttributeNames: {
          '#amount': 'amount',
          '#type': 'type',
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':amount': 300,
          ':type': CostType.Services,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ReturnValues: 'ALL_NEW',
      });
    });

    it('updates only amount when type is not provided', async () => {
      const updatedItem = {
        name: 'Food',
        amount: 275,
        type: CostType.MealsFood,
      };
      mockUpdatePromise.mockResolvedValue({ Attributes: updatedItem });

      const result = await service.updateCost('Food', { amount: 275 });

      expect(result).toEqual(updatedItem);
      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: 'Costs',
        Key: { name: 'Food' },
        UpdateExpression: 'SET #amount = :amount',
        ExpressionAttributeNames: {
          '#amount': 'amount',
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':amount': 275,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ReturnValues: 'ALL_NEW',
      });
    });

    it('updates only type when amount is not provided', async () => {
      const updatedItem = {
        name: 'Food',
        amount: 200,
        type: CostType.Services,
      };
      mockUpdatePromise.mockResolvedValue({ Attributes: updatedItem });

      const result = await service.updateCost('Food', {
        type: CostType.Services,
      });

      expect(result).toEqual(updatedItem);
      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: 'Costs',
        Key: { name: 'Food' },
        UpdateExpression: 'SET #type = :type',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':type': CostType.Services,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ReturnValues: 'ALL_NEW',
      });
    });

    it('throws BadRequestException when update payload is empty', async () => {
      await expect(service.updateCost('Food', {})).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateCost('Food', {})).rejects.toThrow(
        'At least one field is required for update',
      );
    });

    it('throws BadRequestException for invalid amount', async () => {
      await expect(
        service.updateCost('Food', { amount: Number.NaN }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid type', async () => {
      await expect(
        service.updateCost('Food', { type: 'INVALID' as unknown as CostType }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid date format', async () => {
      await expect(
        service.updateCost('Food', { date: 'not-a-date' as unknown as TDateISO }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateCost('Food', { date: 'not-a-date' as unknown as TDateISO }),
      ).rejects.toThrow('date must be a valid ISO 8601 format string');
    });

    it('throws NotFoundException when non-rename update target does not exist', async () => {
      const err = { code: 'ConditionalCheckFailedException' };
      mockUpdatePromise.mockRejectedValue(err);

      await expect(
        service.updateCost('Food', { amount: 250 }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateCost('Food', { amount: 250 }),
      ).rejects.toThrow('Cost with name Food not found');
    });

    it('throws InternalServerErrorException on non-rename DynamoDB error', async () => {
      mockUpdatePromise.mockRejectedValue(new Error('update failed'));

      await expect(
        service.updateCost('Food', { amount: 250 }),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.updateCost('Food', { amount: 250 }),
      ).rejects.toThrow('Failed to update cost Food');
    });

    it('renames a cost safely using transaction', async () => {
      mockGetPromise.mockResolvedValue({
        Item: { name: 'Food', amount: 200, type: CostType.MealsFood },
      });
      mockTransactWritePromise.mockResolvedValue({});

      const result = await service.updateCost('Food', {
        name: 'Meals',
        amount: 300,
      });

      expect(result).toEqual({
        name: 'Meals',
        amount: 300,
        type: CostType.MealsFood,
        date: undefined,
      });
      expect(mockGet).toHaveBeenCalledWith({
        TableName: 'Costs',
        Key: { name: 'Food' },
      });
      expect(mockTransactWrite).toHaveBeenCalledWith({
        TransactItems: [
          {
            Put: {
              TableName: 'Costs',
              Item: {
                name: 'Meals',
                amount: 300,
                type: CostType.MealsFood,
                date: undefined,
              },
              ConditionExpression: 'attribute_not_exists(#name)',
              ExpressionAttributeNames: {
                '#name': 'name',
              },
            },
          },
          {
            Delete: {
              TableName: 'Costs',
              Key: { name: 'Food' },
              ConditionExpression: 'attribute_exists(#name)',
              ExpressionAttributeNames: {
                '#name': 'name',
              },
            },
          },
        ],
      });
    });

    it('renames a cost with a valid date', async () => {
      mockGetPromise.mockResolvedValue({
        Item: { name: 'Food', amount: 200, type: CostType.MealsFood },
      });
      mockTransactWritePromise.mockResolvedValue({});

      const result = await service.updateCost('Food', {
        name: 'Meals',
        amount: 300,
        date: '2026-03-22' as TDateISO,
      });

      expect(result).toEqual({
        name: 'Meals',
        amount: 300,
        type: CostType.MealsFood,
        date: '2026-03-22',
      });
    });

    it('throws NotFoundException when rename source does not exist', async () => {
      mockGetPromise.mockResolvedValue({ Item: undefined });

      await expect(
        service.updateCost('Food', { name: 'Meals' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateCost('Food', { name: 'Meals' }),
      ).rejects.toThrow('Cost with name Food not found');
    });

    it('throws ConflictException when rename target already exists', async () => {
      mockGetPromise.mockResolvedValue({
        Item: { name: 'Food', amount: 200, type: CostType.MealsFood },
      });
      mockTransactWritePromise.mockRejectedValue({
        code: 'ConditionalCheckFailedException',
      });

      await expect(
        service.updateCost('Food', { name: 'Meals' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.updateCost('Food', { name: 'Meals' }),
      ).rejects.toThrow('Cost with name Meals already exists');
    });

    it('throws InternalServerErrorException on rename transaction error', async () => {
      mockGetPromise.mockResolvedValue({
        Item: { name: 'Food', amount: 200, type: CostType.MealsFood },
      });
      mockTransactWritePromise.mockRejectedValue(new Error('txn failed'));

      await expect(
        service.updateCost('Food', { name: 'Meals' }),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.updateCost('Food', { name: 'Meals' }),
      ).rejects.toThrow('Failed to update cost Food');
    });

    it('throws InternalServerErrorException when table name is missing', async () => {
      delete process.env.CASHFLOW_COST_TABLE_NAME;

      await expect(service.updateCost('Food', { amount: 200 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteCost()', () => {
    it('deletes a cost by name and trims whitespace', async () => {
      mockDeletePromise.mockResolvedValue({});

      const result = await service.deleteCost('  Food  ');

      expect(result).toBe('Cost Food deleted successfully');
      expect(mockDelete).toHaveBeenCalledWith({
        TableName: 'Costs',
        Key: { name: 'Food' },
        ConditionExpression: 'attribute_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('throws BadRequestException for invalid name', async () => {
      await expect(service.deleteCost('   ')).rejects.toThrow(BadRequestException);
      await expect(service.deleteCost('   ')).rejects.toThrow(
        'name must be a non-empty string',
      );
    });

    it('throws NotFoundException when cost does not exist', async () => {
      mockDeletePromise.mockRejectedValue({
        code: 'ConditionalCheckFailedException',
      });

      await expect(service.deleteCost('Food')).rejects.toThrow(NotFoundException);
      await expect(service.deleteCost('Food')).rejects.toThrow(
        'Cost with name Food not found',
      );
    });

    it('throws InternalServerErrorException on DynamoDB error', async () => {
      mockDeletePromise.mockRejectedValue(new Error('delete failed'));

      await expect(service.deleteCost('Food')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.deleteCost('Food')).rejects.toThrow(
        'Failed to delete cost Food',
      );
    });

    it('throws InternalServerErrorException when table name is missing', async () => {
      delete process.env.CASHFLOW_COST_TABLE_NAME;

      await expect(service.deleteCost('Food')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.deleteCost('Food')).rejects.toThrow(
        'Server configuration error',
      );
    });
  });
});