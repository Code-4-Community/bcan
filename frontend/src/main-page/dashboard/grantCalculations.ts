import { Grant } from "../../../../middle-layer/types/Grant";

export const calculateTotalFunding = (grants: Grant[]) =>
  grants.reduce((sum, g) => sum + g.amount, 0);