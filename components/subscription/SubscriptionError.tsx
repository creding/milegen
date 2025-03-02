"use client";

import { Card, Stack, Title, Text, Center, Button } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface SubscriptionErrorProps {
  error: string;
}

export function SubscriptionError({ error }: SubscriptionErrorProps) {
  const router = useRouter();

  return (
    <Center mih="100vh">
      <Card w={420} withBorder>
        <Stack gap="md">
          <Stack gap={2}>
            <Title order={2}>
              <Center inline>
                <IconX size={24} color="var(--mantine-color-red-6)" />
                <Text ml="xs">Subscription Error</Text>
              </Center>
            </Title>
            <Text size="sm" c="dimmed">
              {error}
            </Text>
          </Stack>
          <Button onClick={() => router.push("/account")} fullWidth>
            Return to Account
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
