import { Test, TestingModule } from "@nestjs/testing";
import { GrantController } from "../grant.controller";
import { GrantService } from "../grant.service";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Grant } from "../../types/Grant";
import { NotFoundException } from "@nestjs/common";

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
    application_deadline: "2025-01-01",
    report_deadline: "2025-01-01",
    notification_date: "2025-01-01",
    description: "Test Description",
    application_requirements: "Test Application Requirements",
    additional_notes: "Test Additional Notes",
    timeline: 1,
    estimated_completion_time: 100,
    grantmaker_poc: ["test@test.com"],
    attachments: [],
  },
  {
    grantId: 2,
    organization: "Test Organization 2",
    does_bcan_qualify: false,
    status: Status.Potential,
    amount: 1000,
    application_deadline: "2025-02-01",
    report_deadline: "2025-03-01",
    notification_date: "2025-03-10",
    description: "Test Description 2",
    application_requirements: "More application requirements",
    additional_notes: "More notes",
    timeline: 2,
    estimated_completion_time: 300,
    grantmaker_poc: ["test2@test.com"],
    attachments: [],
  },
];

// Create mock functions that we can reference
const mockPromise = vi.fn();
const mockScan = vi.fn().mockReturnThis();
const mockGet = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
  update: mockUpdate,
  promise: mockPromise,
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
        report_deadline: mockGrants[1].report_deadline,
        notification_date: mockGrants[1].notification_date,
        description: mockGrants[1].description,
        application_requirements: mockGrants[1].application_requirements,
        additional_notes: "Even MORE notes", // UPDATED
        timeline: mockGrants[1].timeline,
        estimated_completion_time: 400, // UPDATED
        grantmaker_poc: mockGrants[1].grantmaker_poc,
        attachments: mockGrants[1].attachments,
      };
      const updatedAttributes = {
        does_bcan_qualify: mockUpdatedGrant.does_bcan_qualify,
        status: mockUpdatedGrant.status,
        additional_notes: mockUpdatedGrant.additional_notes,
        estimated_completion_time: mockUpdatedGrant.estimated_completion_time,
      };

      mockUpdate.mockReturnValue({
        promise: vi.fn().mockResolvedValue({ Attributes: updatedAttributes })
      });

      const data = await grantService.updateGrant(mockUpdatedGrant);

      expect(data).toEqual(JSON.stringify({
        Attributes: updatedAttributes
      }));
      expect(mockGrants[0]).toEqual(mockGrants[0]);
    });

    it("should throw an error if the updated grant has an invalid id", async () => {
      const mockUpdatedGrant: Grant = {
        grantId: 90,
        organization: mockGrants[1].organization,
        does_bcan_qualify: true, // UPDATED
        status: Status.Active, // UPDATED
        amount: mockGrants[1].amount,
        application_deadline: mockGrants[1].application_deadline,
        report_deadline: mockGrants[1].report_deadline,
        notification_date: mockGrants[1].notification_date,
        description: mockGrants[1].description,
        application_requirements: mockGrants[1].application_requirements,
        additional_notes: "Even MORE notes", // UPDATED
        timeline: mockGrants[1].timeline,
        estimated_completion_time: 400, // UPDATED
        grantmaker_poc: mockGrants[1].grantmaker_poc,
        attachments: mockGrants[1].attachments,
      };

      mockUpdate.mockRejectedValue({
        promise: vi.fn().mockRejectedValue(new Error())
      });

      await expect(grantService.updateGrant(mockUpdatedGrant)).rejects.toThrow(new Error("Failed to update Grant 90"))
    })
  });
});
