"use server";

import { createClient } from "@/lib/supabaseServerClient";

export type SubscriptionDetails = {
  status: string;
  current_period_end: string;
  plan_id: string;
  stripe_customer_id: string;
};

export async function getSubscriptionDetails(): Promise<SubscriptionDetails | null> {
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
      .select("status, current_period_end, plan_id, stripe_customer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase Error fetching subscription details: ", error);
      return null;
    }

    if (!subscription) {
      return null;
    }

    return {
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      plan_id: subscription.plan_id,
      stripe_customer_id: subscription.stripe_customer_id,
    };
  } catch (error) {
    console.error("Error getting subscription details:", error);
    return null;
  }
}
