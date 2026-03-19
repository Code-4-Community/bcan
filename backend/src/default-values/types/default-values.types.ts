export interface DefaultValuesResponse {
  startingCash: number;
  benefitsIncrease: number;
  salaryIncrease: number;
}

export interface UpdateDefaultValueBody {
  key: string;
  value: number;
}
