export interface RedemptionRequest {
  customerId: string;
  rewardId: string;
}

export interface RedemptionResponse {
  redemptionId: string;
  pointsDeducted: number;
  newBalance: number;
}
