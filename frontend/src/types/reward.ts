export interface Reward {
  id: string;
  name: string;
  description: string;
  coin_cost: number;
  category: string;
  image_url: string;
  is_active: boolean;
  redeemed_quantity?: number;
  is_redeemed?: boolean;
  created_at: string;
}

export interface CoinBalance {
  balance: number;
  total_earned: number;
  total_redeemed: number;
  updated_at: string;
}

export interface RedeemRewardRequest {
  reward_id: string;
  quantity?: number;
}

export interface RedeemRewardResponse {
  redemption_id: string;
  reward_id: string;
  reward_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  remaining_balance: number;
  redeemed_at: string;
}
