import { Suspense } from "react";
import { SubscriptionLoading } from "@/components/subscription/SubscriptionLoading";
import { SubscriptionError } from "@/components/subscription/SubscriptionError";
import { verifySubscriptionAction } from "../actions/verifySubscription";
import { SubscriptionSuccess } from "@/components/subscription/SubscriptionSuccess";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const { session_id } = await searchParams;
  const subscriptionResults = await verifySubscriptionAction(session_id);

  return (
    <Suspense fallback={<SubscriptionLoading />}>
      {(() => {
        if ("error" in subscriptionResults) {
          return <SubscriptionError error={subscriptionResults.error} />;
        }
        return <SubscriptionSuccess />;
      })()}
    </Suspense>
  );
}
