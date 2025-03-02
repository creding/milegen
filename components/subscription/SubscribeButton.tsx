"use client";

import { Button } from "@mantine/core";
import { useFormStatus } from "react-dom";

export const SubscribeButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} loading={pending} fullWidth>
      {pending ? "Processing..." : "Subscribe Now"}
    </Button>
  );
};
