import { describe, it, assert } from "vitest";
import { Grant } from "../../middle-layer/types/Grant";
import {
  aggregateCountGrantsByYear,
  aggregateMoneyGrantsByYear,
} from "../src/main-page/dashboard/grantCalculations";

describe("Grant Calculations", () => {
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
      application_deadline: "2024-01-01",
      report_deadlines: ["2025-01-01"],
      description: "Test Description",
      timeline: 1,
      estimated_completion_time: 100,
      grantmaker_poc: { POC_name: "name", POC_email: "test@test.com" },
      bcan_poc: { POC_name: "name", POC_email: "" },
      attachments: [],
      isRestricted: false,
    },
    {
      grantId: 2,
      organization: "Test Organization 2",
      does_bcan_qualify: false,
      status: Status.Active,
      amount: 2000,
      grant_start_date: "2025-02-15",
      application_deadline: "2025-02-01",
      report_deadlines: ["2025-03-01", "2025-04-01"],
      description: "Test Description 2",
      timeline: 2,
      estimated_completion_time: 300,
      bcan_poc: { POC_name: "Allie", POC_email: "allie@gmail.com" },
      grantmaker_poc: {
        POC_name: "Benjamin",
        POC_email: "benpetrillo@yahoo.com",
      },
      attachments: [],
      isRestricted: true,
    },
    {
      grantId: 3,
      organization: "Test Organization 2",
      does_bcan_qualify: false,
      status: Status.Potential,
      amount: 2000,
      grant_start_date: "2025-02-15",
      application_deadline: "2025-02-01",
      report_deadlines: ["2025-03-01", "2025-04-01"],
      description: "Test Description 2",
      timeline: 2,
      estimated_completion_time: 300,
      bcan_poc: { POC_name: "Allie", POC_email: "allie@gmail.com" },
      grantmaker_poc: {
        POC_name: "Benjamin",
        POC_email: "benpetrillo@yahoo.com",
      },
      attachments: [],
      isRestricted: true,
    },
    {
      grantId: 4,
      organization: "Test Organization 2",
      does_bcan_qualify: false,
      status: Status.Potential,
      amount: 2000,
      grant_start_date: "2025-02-15",
      application_deadline: "2025-02-01",
      report_deadlines: ["2025-03-01", "2025-04-01"],
      description: "Test Description 2",
      timeline: 2,
      estimated_completion_time: 300,
      bcan_poc: { POC_name: "Allie", POC_email: "allie@gmail.com" },
      grantmaker_poc: {
        POC_name: "Benjamin",
        POC_email: "benpetrillo@yahoo.com",
      },
      attachments: [],
      isRestricted: true,
    },
  ];

  it("should aggregate money by year without grouping", () => {
    const result = aggregateMoneyGrantsByYear(mockGrants);
    assert.deepEqual(result, [
      { year: 2024, All: 1000 },
      { year: 2025, All: 6000 },
    ]);
  });

  it("should aggregate money by year by status", () => {
    const result = aggregateMoneyGrantsByYear(mockGrants, "status");
    assert.deepEqual(result, [
      { year: 2024, Potential: 1000 },
      { year: 2025, Active: 2000, Potential: 4000 },
    ]);
  });

  it("should return empty when there is nothing to sum", () => {
    const result = aggregateMoneyGrantsByYear([]);
    assert.deepEqual(result, []);
  });

  it("should count by year without grouping", () => {
    const result = aggregateCountGrantsByYear(mockGrants);
    assert.deepEqual(result, [
      { year: 2024, All: 1 },
      { year: 2025, All: 3 },
    ]);
  });

  it("should count by year by status", () => {
    const result = aggregateCountGrantsByYear(mockGrants, "status");
    assert.deepEqual(result, [
      { year: 2024, Potential: 1 },
      { year: 2025, Active: 1, Potential: 2 },
    ]);
  });

  it("should return empty when there is nothing to count", () => {
    const result = aggregateCountGrantsByYear([]);
    assert.deepEqual(result, []);
  });
});
