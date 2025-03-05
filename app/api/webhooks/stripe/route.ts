import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabaseServerClient";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = await createClient();

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (!session?.customer || typeof session.customer !== 'string') {
            throw new Error('Missing customer ID');
          }

          if (!session?.subscription || typeof session.subscription !== 'string') {
            throw new Error('Missing subscription ID');
          }

          // Get subscription details to get current period
          const subscription = await stripe.subscriptions.retrieve(session.subscription);

          // Create or update subscription record
          const { error: upsertError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: session.client_reference_id,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: subscription.status,
              plan_id: subscription.items.data[0]?.price.id,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (upsertError) throw upsertError;
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;

          if (!subscription?.id) {
            throw new Error('Missing subscription ID');
          }

          // Update subscription record
          const { error: subUpdateError } = await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              plan_id: subscription.items.data[0]?.price.id,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);

          if (subUpdateError) throw subUpdateError;
          break;
        }

        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
