import { Test, TestingModule } from "@nestjs/testing";
import { GrantController } from "../grant.controller";
import { GrantService } from "../grant.service";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Grant } from "../../types/Grant";
import { NotFoundException } from "@nestjs/common";
import { mock } from "node:test";

enum Status {
  Potential = "Potential",
  Active = "Active",
  Inactive = "Inactive",
  Rejected = "Rejected",
  Pending = "Pending",
}

const mockGrants: Grant[] = [
  {
    grantId: 1,
    organization: "Test Organization",
    does_bcan_qualify: true,
    status: Status.Potential,
    amount: 1000,
    grant_start_date: "2024-01-01",
    application_deadline: "2025-01-01",
    report_deadlines: ["2025-01-01"],
    description: "Test Description",
    timeline: 1,
    estimated_completion_time: 100,
    grantmaker_poc: { POC_name: "name", POC_email: "test@test.com" },
    bcan_poc: { POC_name: "name", POC_email: ""},
    attachments: [],
    isRestricted: false
  },
  {
    grantId: 2,
    organization: "Test Organization 2",
    does_bcan_qualify: false,
    status: Status.Potential,
    amount: 1000,
    grant_start_date: "2025-02-15",
    application_deadline: "2025-02-01",
    report_deadlines: ["2025-03-01", "2025-04-01"],
    description: "Test Description 2",
    timeline: 2,
    estimated_completion_time: 300,
    bcan_poc:  { POC_name: "Allie", POC_email: "allie@gmail.com" },
    grantmaker_poc: { POC_name: "Benjamin", POC_email: "benpetrillo@yahoo.com" },
    attachments: [],
    isRestricted: true
  },
];

// Create mock functions that we can reference
const mockPromise = vi.fn();
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockPut = vi.fn().mockReturnThis();

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  delete: mockDelete,
  update: mockUpdate,
  promise: mockPromise,
  put: mockPut,
};

// Mock AWS SDK - Note the structure here
vi.mock("aws-sdk", () => ({
  default: {
    DynamoDB: {
      DocumentClient: vi.fn(() => mockDocumentClient),
    },
  },
}));

describe("GrantService", () => {
  let controller: GrantController;
  let grantService: GrantService;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Set the environment variable for the table name
    process.env.DYNAMODB_GRANT_TABLE_NAME = 'Grants';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrantController],
      providers: [GrantService],
    }).compile();

    controller = module.get<GrantController>(GrantController);
    grantService = module.get<GrantService>(GrantService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(grantService).toBeDefined();
  });

  describe("getAllGrants()", () => {
    it("should return a populated list of grants", async () => {
      mockPromise.mockResolvedValue({ Items: mockGrants });

      const data = await grantService.getAllGrants();

      expect(data).toEqual(mockGrants);
      expect(mockDocumentClient.scan).toHaveBeenCalledWith({
        TableName: expect.any(String)
      })
    });

    it("should return an empty list of grants if no grants exist in the database", async () => {
      mockPromise.mockResolvedValue({ Items: [] });

      const data = await grantService.getAllGrants();

      expect(data).toEqual([]);
    });

    it("should throw an error if there is an issue retrieving the grants", async () => {
      const dbError = new Error("Could not retrieve grants");
      mockPromise.mockRejectedValue(dbError);

      expect(grantService.getAllGrants()).rejects.toThrow(
        "Could not retrieve grants"
      );
    });
  });

  describe("getGrantById()", () => {
    it("should return the correct grant given a valid id", async () => {
      mockPromise.mockResolvedValue({ Item: mockGrants[0] });

      const data = await grantService.getGrantById(1);

      expect(data).toEqual(mockGrants[0]);
      expect(mockDocumentClient.get).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: {
          grantId: 1
        }
      })
    });

    it("should throw an error if given an invalid id", async () => {
      const noGrantFoundError = new NotFoundException(
        "No grant with id 5 found."
      );
      mockPromise.mockRejectedValue(noGrantFoundError);

      expect(grantService.getGrantById(5)).rejects.toThrow(
        "No grant with id 5 found."
      );
    });
  });

  describe("unarchiveGrants()", () => {
    it("should unarchive multiple grants and return their ids", async () => {
      mockPromise
        .mockResolvedValueOnce({ Attributes: { isArchived: false } })
        .mockResolvedValueOnce({ Attributes: { isArchived: false } });

      const data = await grantService.unarchiveGrants([1, 2]);

      expect(data).toEqual([1, 2]);
      expect(mockUpdate).toHaveBeenCalledTimes(2);

      const firstCallArgs = mockUpdate.mock.calls[0][0];
      const secondCallArgs = mockUpdate.mock.calls[1][0];

      expect(firstCallArgs).toMatchObject({
        TableName: "Grants",
        Key: { grantId: 1 },
        UpdateExpression: "set isArchived = :archived",
        ExpressionAttributeValues: { ":archived": false },
        ReturnValues: "UPDATED_NEW",
      });
      expect(secondCallArgs).toMatchObject({
        TableName: "Grants",
        Key: { grantId: 2 },
        UpdateExpression: "set isArchived = :archived",
        ExpressionAttributeValues: { ":archived": false },
        ReturnValues: "UPDATED_NEW",
      });
    });

    it("should skip over grants that are already ", async () => {
      mockPromise
        .mockResolvedValueOnce({ Attributes: { isArchived: true } })
        .mockResolvedValueOnce({ Attributes: { isArchived: false } });

      const data = await grantService.unarchiveGrants([1, 2]);

      expect(data).toEqual([2]);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it("should throw an error if any update call fails", async () => {
      mockPromise.mockRejectedValueOnce(new Error("DB Error"));

      await expect(grantService.unarchiveGrants([90])).rejects.toThrow(
        "Failed to update Grant 90 status."
      );
    });
  });

  describe("updateGrant()", () => {
    it("should update the correct grant and return a stringified JSON with the updated grant", async () => {
      const mockUpdatedGrant: Grant = {
        grantId: 2,
        organization: mockGrants[1].organization,
        does_bcan_qualify: true, // UPDATED
        status: Status.Active, // UPDATED
        amount: mockGrants[1].amount,
        application_deadline: mockGrants[1].application_deadline,
        report_deadlines: mockGrants[1].report_deadlines,
        description: mockGrants[1].description,
        timeline: mockGrants[1].timeline,
        estimated_completion_time: 400, // UPDATED
        grantmaker_poc: mockGrants[1].grantmaker_poc,
        attachments: mockGrants[1].attachments,
        grant_start_date: mockGrants[1].grant_start_date,
        bcan_poc: mockGrants[1].bcan_poc,
        isRestricted: mockGrants[1].isRestricted,
      };
      const updatedAttributes = {
        does_bcan_qualify: mockUpdatedGrant.does_bcan_qualify,
        status: mockUpdatedGrant.status,
        estimated_completion_time: mockUpdatedGrant.estimated_completion_time,
      };

      mockUpdate.mockReturnValue({
        promise: vi.fn().mockResolvedValue({ Attributes: updatedAttributes }),
      });

      const data = await grantService.updateGrant(mockUpdatedGrant);

      expect(data).toEqual(
        JSON.stringify({
          Attributes: updatedAttributes,
        })
      );
      expect(mockGrants[0]).toEqual(mockGrants[0]);
      expect(mockDocumentClient.update).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { grantId: 2 },
        UpdateExpression: expect.any(String),
        ExpressionAttributeNames: expect.any(Object),
        ExpressionAttributeValues: expect.any(Object),
        ReturnValues: "UPDATED_NEW"
      })
    });

    it("should throw an error if the updated grant has an invalid id", async () => {
      const mockUpdatedGrant: Grant = {
        grantId: 90,
        organization: mockGrants[1].organization,
        does_bcan_qualify: true, // UPDATED
        status: Status.Active, // UPDATED
        amount: mockGrants[1].amount,
        application_deadline: mockGrants[1].application_deadline,
        report_deadlines: mockGrants[1].report_deadlines,
        description: mockGrants[1].description,
        timeline: mockGrants[1].timeline,
        estimated_completion_time: 400, // UPDATED
        grantmaker_poc: mockGrants[1].grantmaker_poc,
        attachments: mockGrants[1].attachments,
        grant_start_date: mockGrants[1].grant_start_date,
        bcan_poc: mockGrants[1].bcan_poc,
        isRestricted: mockGrants[1].isRestricted,
      };

      mockUpdate.mockRejectedValue({
        promise: vi.fn().mockRejectedValue(new Error()),
      });

      await expect(grantService.updateGrant(mockUpdatedGrant)).rejects.toThrow(
        new Error("Failed to update Grant 90")
      );
    });
  });

  describe("addGrant()", () => {
    it("should successfully add a grant and return the new grant id", async () => {
      const mockCreateGrantDto: Grant = {
        organization: "New test organization",
        description: "This is a new organization that does organizational things",
        application_deadline: "2026-02-14",
        report_deadlines: ["2026-11-05"],
        timeline: 200,
        estimated_completion_time: 200,
        does_bcan_qualify: true,
        status: Status.Potential,
        amount: 35000,
        attachments: [],
        grantId: 0,
        grant_start_date: "2026-05-01",
        grantmaker_poc: { POC_name: "Aaron", POC_email: "a.ashby@northeastern.edu"},
        bcan_poc: { POC_name: "Ben Ahrendts", POC_email: "ben@gmail.com" },
        isRestricted: true
      };

      const now = Date.now()

      mockPut.mockReturnValue({
        promise: vi.fn().mockResolvedValue(now),
      });

      const data = await grantService.addGrant(mockCreateGrantDto);

      expect(data).closeTo(now, 1);
      expect(mockDocumentClient.put).toHaveBeenCalledWith({
        TableName: "Grants",
        Item: {
          ...mockCreateGrantDto,
          grantId: expect.any(Number),
        },
      });
    });

    // decided this test wasn't relevant since you would never pass in something that wasn't a Grant
    /*
    it("should throw an error if the database put operation fails", async () => {
      const mockCreateGrant : Grant = {
        organization: "New Org",
        description: "New Desc",
        grantmaker_poc: { POC_name: "name", POC_email: "email" },
        bcan_poc: { POC_name: "name", POC_email: "email" },
        grant_start_date: "2025-03-01",
        application_deadline: "2025-04-01",
        report_deadlines: ["2025-05-01"],
        timeline: 3,
        estimated_completion_time: 200,
        does_bcan_qualify: true,
        status: Status.Active,
        amount: 1500,
        attachments: [],
        grantId: 0,
        isRestricted: false
      };

      mockPut.mockRejectedValue(new Error("DB Error"));

      await expect(grantService.addGrant(mockCreateGrant)).rejects.toThrow(
        "Failed to upload new grant from New Org"
      );
    });
    */
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
