"use client";

import { Button } from "@mantine/core";
import { IconCreditCard } from "@tabler/icons-react";

export const SubscribeButton = () => {
  return (
    <Button 
      type="submit" 
      fullWidth 
      variant="gradient"
      leftSection={<IconCreditCard size={18} />}
      size="lg"
    >
      Subscribe Now
    </Button>
  );
};
