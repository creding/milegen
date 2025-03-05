"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Alert,
  Group,
  List,
  ListItem,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { createCheckoutSessionAction } from "@/app/actions/createCheckoutSession";
import { SubscribeButton } from "@/components/subscription/SubscribeButton";
import { redirect } from "next/navigation";

export const SubscribePage = () => {
  const [error, setError] = useState("");

  return (
    <Container size="sm" mt={20} py="xl">
      <Card withBorder>
        <Stack gap={2} mb="md">
          <Title order={2}>Subscribe to Milegen</Title>
          <Text size="sm" c="dimmed">
            Unlock unlimited mileage log entries
          </Text>
        </Stack>

        <Stack>
          <Card withBorder p="md" radius="md">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <Title order={3}>Annual Plan</Title>
                <Text size="xl" fw={700}>
                  $9.99/year
                </Text>
              </Group>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <IconCheck
                    size={16}
                    color="var(--mantine-color-green-filled)"
                  />
                }
              >
                <ListItem>Unlimited mileage logs</ListItem>
                <ListItem>PDF and spreadsheet exports</ListItem>
                <ListItem>IRS-compliant reports</ListItem>
                <ListItem>Priority support</ListItem>
              </List>
            </Stack>
          </Card>

          {error && (
            <Alert
              variant="light"
              color="red"
              title="Error"
              icon={<IconAlertCircle />}
            >
              {error}
            </Alert>
          )}

          <form
            action={async () => {
              const result = await createCheckoutSessionAction();
              if ("error" in result) {
                setError(result.error);
              }
              if ("url" in result) {
                redirect(result.url);
              }
            }}
          >
            <SubscribeButton />
          </form>
        </Stack>
      </Card>
    </Container>
  );
};
