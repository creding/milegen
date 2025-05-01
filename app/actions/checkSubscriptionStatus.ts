"use server";

import { createClient } from "@/lib/supabaseServerClient";
import { logger } from "@/lib/logger";
import { fetchLatestSubscriptionByUserId } from "@/lib/data/subscriptions";

export async function checkSubscriptionStatus(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!user) {
      logger.info('checkSubscriptionStatus: No authenticated user found.');
      return null;
    }

    const { data: subscription, error: dbError } = await fetchLatestSubscriptionByUserId(supabase, user.id);

    if (dbError) {
      logger.warn({ err: dbError, userId: user.id }, 'Database error fetching subscription');
      return null;
    }

    return subscription?.status || null;
  } catch (error) {
    logger.error({ err: error }, 'Error checking subscription status');
    return null;
  }
}
