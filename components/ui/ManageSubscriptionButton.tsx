"use client";

import { Button } from "@mantine/core";

export function ManageSubscriptionButton() {
  const handleManageSubscription = () => {
    window.location.href =
      "https://billing.stripe.com/p/login/7sI8ye2ZW9739skcMM";
  };

  return (
    <Button variant="gradient" onClick={handleManageSubscription} fullWidth>
      Manage Subscription
    </Button>
  );
}
