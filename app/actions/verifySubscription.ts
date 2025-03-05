"use server";

import { createClient } from "@/lib/supabaseServerClient";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import type { SubscriptionVerificationResult } from "@/types/subscription";

export async function verifySubscriptionAction(
  sessionId: string
): Promise<SubscriptionVerificationResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not found");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    console.log("Stripe subscription:", {
      id: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      items: subscription.items.data,
    });

    if (subscription.status !== "active") {
      throw new Error("Subscription not active");
    }

    // Update the user's subscription status in your database
    const subscriptionData = {
      user_id: user.id,
      status: subscription.status,
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      stripe_customer_id: subscription.customer,
      plan_id: subscription.items.data[0].price.id,
    };
    console.log("Upserting subscription data:", subscriptionData);

    try {
      const { error: upsertError } = await supabase
        .from("subscriptions")
        .upsert(subscriptionData);

      if (upsertError) {
        console.error("Subscription upsert error:", upsertError);
        throw new Error(
          `Failed to update subscription status: ${upsertError.message}`
        );
      }
    } catch (upsertError) {
      console.error("Subscription upsert error:", upsertError);
      throw new Error(
        `Failed to update subscription status: ${upsertError.message}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying subscription:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to verify subscription",
    };
  }
}
