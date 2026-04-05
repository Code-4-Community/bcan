import { Test, TestingModule } from '@nestjs/testing';
import { DefaultValuesService } from '../default-values.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { start } from 'repl';

const mockDefaultValues = [
  { name: 'startingCash', value: 10000 },
  { name: 'benefitsIncrease', value: 3.5 },
  { name: 'salaryIncrease', value: 2.0 },
  { name: 'startDate', value: '2023-01-01' },
];

const mockPromise = vi.fn();
const mockScan = vi.fn();
const mockPut = vi.fn();

const mockDocumentClient = {
  scan: mockScan,
  put: mockPut,
};

vi.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: vi.fn(function () {
      return mockDocumentClient;
    }),
  },
}));

describe('DefaultValuesService', () => {
  let service: DefaultValuesService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup DynamoDB mocks to return chainable objects with .promise()
    mockScan.mockReturnValue({ promise: mockPromise });
    mockPut.mockReturnValue({ promise: mockPromise });

    // Set the environment variable for the table name
    process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME = 'DefaultValues';

    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultValuesService],
    }).compile();

    service = module.get<DefaultValuesService>(DefaultValuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDefaultValues()', () => {
    it('should return default values when all three values exist in the database', async () => {
      mockPromise.mockResolvedValue({ Items: mockDefaultValues });

      const result = await service.getDefaultValues();

      expect(result).toEqual({
        startingCash: 10000,
        benefitsIncrease: 3.5,
        salaryIncrease: 2.0,
        startDate: '2023-01-01',
      });
      expect(mockDocumentClient.scan).toHaveBeenCalledWith({
        TableName: 'DefaultValues',
        ConsistentRead: true,
      });
    });

    it('should throw NotFoundException if startingCash is missing', async () => {
      const incompleteValues = [
        { name: 'benefitsIncrease', value: 3.5 },
        { name: 'salaryIncrease', value: 2.0 },
        { name: 'startDate', value: '2023-01-01' },
      ];
      mockPromise.mockResolvedValue({ Items: incompleteValues });

      await expect(service.getDefaultValues()).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getDefaultValues()).rejects.toThrow(
        'Default values not found',
      );
    });

    it('should throw NotFoundException if benefitsIncrease is missing', async () => {
      const incompleteValues = [
        { name: 'startingCash', value: 10000 },
        { name: 'salaryIncrease', value: 2.0 },
        { name: 'startDate', value: '2023-01-01' },
      ];
      mockPromise.mockResolvedValue({ Items: incompleteValues });

      await expect(service.getDefaultValues()).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if salaryIncrease is missing', async () => {
      const incompleteValues = [
        { name: 'startingCash', value: 10000 },
        { name: 'benefitsIncrease', value: 3.5 },
        { name: 'startDate', value: '2023-01-01' },
      ];
      mockPromise.mockResolvedValue({ Items: incompleteValues });

      await expect(service.getDefaultValues()).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if all values are missing', async () => {
      mockPromise.mockResolvedValue({ Items: [] });

      await expect(service.getDefaultValues()).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if table name is not configured', async () => {
      delete process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME;

      await expect(service.getDefaultValues()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getDefaultValues()).rejects.toThrow(
        'Server configuration error',
      );

      // Restore for other tests
      process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME = 'DefaultValues';
    });

    it('should throw InternalServerErrorException on general DynamoDB error', async () => {
      const dbError = new Error('DynamoDB connection failed');
      mockPromise.mockRejectedValue(dbError);

      await expect(service.getDefaultValues()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getDefaultValues()).rejects.toThrow(
        'Failed to retrieve default values',
      );
    });

    it('should allow negative values', async () => {
      const negativeValues = [
        { name: 'startingCash', value: -5000 },
        { name: 'benefitsIncrease', value: -1.5 },
        { name: 'salaryIncrease', value: -0.5 },
        { name: 'startDate', value: '2023-01-01' },
      ];
      mockPromise.mockResolvedValue({ Items: negativeValues });

      const result = await service.getDefaultValues();

      expect(result).toEqual({
        startingCash: -5000,
        benefitsIncrease: -1.5,
        salaryIncrease: -0.5,
        startDate: '2023-01-01',
      });
    });
  });

  describe('updateDefaultValue()', () => {
    it('should successfully update startingCash', async () => {
      mockPromise
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          Items: [
            { name: 'startingCash', value: 15000 },
            { name: 'benefitsIncrease', value: 3.5 },
            { name: 'salaryIncrease', value: 2.0 },
            { name: 'startDate', value: '2023-01-01' },
          ],
        });

      const result = await service.updateDefaultValue('startingCash', 15000);

      expect(result).toEqual({
        startingCash: 15000,
        benefitsIncrease: 3.5,
        salaryIncrease: 2.0,
        startDate: '2023-01-01',
      });
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: 'DefaultValues',
        Item: {
          name: 'startingCash',
          value: 15000,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('should successfully update benefitsIncrease', async () => {
      mockPromise
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          Items: [
            { name: 'startingCash', value: 10000 },
            { name: 'benefitsIncrease', value: 5.0 },
            { name: 'salaryIncrease', value: 2.0 },
            { name: 'startDate', value: '2023-01-01' },
          ],
        });

      const result = await service.updateDefaultValue('benefitsIncrease', 5.0);

      expect(result).toEqual({
        startingCash: 10000,
        benefitsIncrease: 5.0,
        salaryIncrease: 2.0,
        startDate: '2023-01-01',
      });
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: 'DefaultValues',
        Item: {
          name: 'benefitsIncrease',
          value: 5.0,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('should successfully update startDate', async () => {
      mockPromise
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          Items: [
            { name: 'startingCash', value: 15000 },
            { name: 'benefitsIncrease', value: 3.5 },
            { name: 'salaryIncrease', value: 2.0 },
            { name: 'startDate', value: '2023-02-01' },
          ],
        });

      const result = await service.updateDefaultValue('startDate', '2023-02-01');

      expect(result).toEqual({
        startingCash: 15000,
        benefitsIncrease: 3.5,
        salaryIncrease: 2.0,
        startDate: '2023-02-01',
      });
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: 'DefaultValues',
        Item: {
          name: 'startDate',
          value: '2023-02-01',
        },
        ConditionExpression: 'attribute_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('should successfully update salaryIncrease', async () => {
      mockPromise
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          Items: [
            { name: 'startingCash', value: 10000 },
            { name: 'benefitsIncrease', value: 3.5 },
            { name: 'salaryIncrease', value: 3.0 },
            { name: 'startDate', value: '2023-01-01' },
          ],
        });

      const result = await service.updateDefaultValue('salaryIncrease', 3.0);

      expect(result).toEqual({
        startingCash: 10000,
        benefitsIncrease: 3.5,
        salaryIncrease: 3.0,
        startDate: '2023-01-01',
      });
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: 'DefaultValues',
        Item: {
          name: 'salaryIncrease',
          value: 3.0,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('should throw BadRequestException for non-numeric values', async () => {
      await expect(
        service.updateDefaultValue('startingCash', Number.NaN),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateDefaultValue('startingCash', Number.NaN),
      ).rejects.toThrow('Value must be a valid number');
    });

    it('should throw BadRequestException for Infinity', async () => {
      await expect(
        service.updateDefaultValue('startingCash', Infinity),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateDefaultValue('startingCash', Infinity),
      ).rejects.toThrow('Value must be a valid number');
    });

    it('should throw BadRequestException for invalid keys', async () => {
      await expect(
        service.updateDefaultValue('invalidKey' as any, 100),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateDefaultValue('invalidKey' as any, 100),
      ).rejects.toThrow('Default value must be one of');
    });

    it('should throw InternalServerErrorException if table name is not configured', async () => {
      delete process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME;

      await expect(
        service.updateDefaultValue('startingCash', 5000),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.updateDefaultValue('startingCash', 5000),
      ).rejects.toThrow('Server configuration error');

      // Restore for other tests
      process.env.CASHFLOW_DEFAULT_VALUE_TABLE_NAME = 'DefaultValues';
    });

    it('should successfully update with negative value', async () => {
      mockPromise
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          Items: [
            { name: 'startingCash', value: -1000 },
            { name: 'benefitsIncrease', value: 3.5 },
            { name: 'salaryIncrease', value: 2.0 },
            { name: 'startDate', value: '2023-01-01' },
          ],
        });

      const result = await service.updateDefaultValue('startingCash', -1000);

      expect(result).toEqual({
        startingCash: -1000,
        benefitsIncrease: 3.5,
        salaryIncrease: 2.0,
        startDate: '2023-01-01',
      });
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: 'DefaultValues',
        Item: {
          name: 'startingCash',
          value: -1000,
        },
        ConditionExpression: 'attribute_exists(#name)',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
      });
    });

    it('should throw InternalServerErrorException on DynamoDB put error', async () => {
      const dbError = new Error('DynamoDB write failed');
      mockPut.mockReturnValue({ promise: vi.fn().mockRejectedValue(dbError) });

      await expect(
        service.updateDefaultValue('startingCash', 5000),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.updateDefaultValue('startingCash', 5000),
      ).rejects.toThrow('Failed to update default value');
    });

    it('should throw InternalServerErrorException if getDefaultValues fails after update', async () => {
      const dbError = new Error('DynamoDB read failed');
      mockPromise.mockRejectedValue(dbError);

      await expect(
        service.updateDefaultValue('startingCash', 5000),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
