"use server";

import { createClient } from "@/lib/supabaseServerClient";
import { logger } from "@/lib/logger";

export async function checkSubscriptionStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }) // Replace 'created_at' if needed.
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return subscription?.status || null;
  } catch (error) {
    logger.error({ err: error }, "Error checking subscription status");
    return null;
  }
}
