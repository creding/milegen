// /types/subscription.d.ts

/**
 * Represents the structure of subscription data stored in the database.
 */
export type SubscriptionData = {
  id: string; // Assuming there's an ID
  user_id: string;
  status: string; // e.g., 'active', 'canceled', 'past_due'
  // Add other relevant fields from your 'subscriptions' table
  current_period_end: string; // ISO date string
  created_at: string; // ISO date string
  // price_id?: string; // Example optional field
};

export type SubscriptionVerificationResult =
  | {
      success: true;
    }
  | {
      error: string;
    };
