import { Test, TestingModule } from "@nestjs/testing";
import { GrantController } from "../grant.controller";
import { GrantService } from "../grant.service";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Grant } from "../../types/Grant";

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

const mockDocumentClient = {
  scan: mockScan,
  get: mockGet,
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

  it("Test", async () => {
    expect(true).toBe(true);
  });
});
