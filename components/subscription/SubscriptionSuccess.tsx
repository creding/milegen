"use client";

import { Card, Stack, Title, Text, Center, Button } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function SubscriptionSuccess() {
  const router = useRouter();

  return (
    <Center mih="100vh">
      <Card w={420} withBorder>
        <Stack gap="md">
          <Stack gap={2}>
            <Title order={2}>
              <Center inline>
                <IconCheck size={24} color="var(--mantine-color-green-6)" />
                <Text ml="xs">Subscription Activated!</Text>
              </Center>
            </Title>
            <Text size="sm" c="dimmed">
              Thank you for subscribing. You now have access to all premium features.
            </Text>
          </Stack>
          <Button onClick={() => router.push("/generator")} fullWidth>
            Start Using Premium Features
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
