"use server";

import { createClient } from "@/lib/supabaseServerClient";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export type CheckoutSessionResult =
  | { url: string }
  | {
      error: string;
    }
  | {
      sessionId: string;
    };

export async function createCheckoutSessionAction(): Promise<CheckoutSessionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "User not found" };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email,
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_VERCEL_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_VERCEL_URL}/subscribe`,
      metadata: {
        userId: user.id,
      },
    });

    if (!session.url) {
      return { error: "Failed to create checkout session" };
    }

    return { url: session.url };
  } catch (err) {
    logger.error({ err }, "Error creating checkout session");
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to create checkout session",
    };
  }
}
