"use client";

import { Card, Stack, Title, Text, Center, Loader } from "@mantine/core";

export function SubscriptionLoading() {
  return (
    <Center mih="100vh">
      <Card w={420} withBorder>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Title order={2}>Processing your subscription...</Title>
          <Text size="sm" c="dimmed" ta="center">
            Please wait while we verify your payment.
          </Text>
        </Stack>
      </Card>
    </Center>
  );
}
