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

    if (subscription.status !== "active") {
      throw new Error("Subscription not active");
    }

    // Update the user's subscription status in your database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_id: subscription.id,
        subscription_status: subscription.status,
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error("Failed to update subscription status");
    }

    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to verify subscription",
    };
  }
}
