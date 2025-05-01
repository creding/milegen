// /lib/data/subscriptions.ts
import { SupabaseClient } from '@supabase/supabase-js';
import type { SubscriptionData } from '@/types/subscription';

/**
 * Fetches the most recent subscription record for a given user ID.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose subscription is being fetched.
 * @returns A promise resolving to the subscription data and error status.
 */
export async function fetchLatestSubscriptionByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: SubscriptionData | null; error: Error | null }> {
  // Type the return explicitly for clarity
  const result = await supabase
    .from('subscriptions')
    .select('*') // Select all columns defined in SubscriptionData
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<SubscriptionData>(); // Use .single<Type>() for typed result

  return result;
}
