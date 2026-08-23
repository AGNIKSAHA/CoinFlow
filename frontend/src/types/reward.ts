export interface Reward {
  id: string;
  name: string;
  description: string;
  coin_cost: number;
  category: string;
  image_url: string;
  is_active: boolean;
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
}

export interface RedeemRewardResponse {
  redemption_id: string;
  reward_id: string;
  reward_name: string;
  coins_deducted: number;
  remaining_balance: number;
  redeemed_at: string;
}
