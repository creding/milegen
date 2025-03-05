"use client";

import { Alert, Button, Group, List, Stack, Text } from "@mantine/core";
import { IconCheck, IconCrown, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

interface SubscriptionAlertProps {
  mb?: string;
}

export function SubscriptionAlert({ mb }: SubscriptionAlertProps) {
  return (
    <Alert
      mb={mb}
      icon={<IconInfoCircle size="1rem" />}
      title="Upgrade to Premium"
      color="blue"
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Unlock Premium Features:
            </Text>
            <List size="sm" spacing="xs">
              <List.Item
                icon={
                  <IconCheck
                    size="1rem"
                    color="var(--mantine-color-blue-filled)"
                  />
                }
              >
                Create unlimited mileage logs
              </List.Item>
              <List.Item
                icon={
                  <IconCheck
                    size="1rem"
                    color="var(--mantine-color-blue-filled)"
                  />
                }
              >
                Export to PDF and Excel formats
              </List.Item>
            </List>
          </Stack>
          <Button
            component={Link}
            href="/subscribe"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            leftSection={<IconCrown size="1rem" />}
          >
            Upgrade Now
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
