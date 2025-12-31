"use client";

import { Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCrown } from "@tabler/icons-react";
import { ProCard } from "@/components/ui/ProCard";
import Link from "next/link";

interface SubscriptionAlertProps {
  mb?: string;
}

export function SubscriptionAlert({ mb }: SubscriptionAlertProps) {
  return (
    <ProCard
      p="lg"
      radius="md"
      withBorder
      mb={mb}
      style={{
        background: "linear-gradient(to right, #f8fcff, #fff)",
        borderColor: "var(--mantine-color-blue-2)",
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group>
          <ThemeIcon
            size={42}
            variant="gradient"
            gradient={{ from: "blue.6", to: "cyan.6" }}
            radius="md"
          >
            <IconCrown size={24} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700} size="md" c="blue.8">
              Unlock Premium Features
            </Text>
            <Text size="sm" c="dimmed" maw={300} lh={1.4}>
              Generate unlimited IRS-compliant logs and export to PDF/Excel
              instantly.
            </Text>
          </Stack>
        </Group>

        <Group visibleFrom="sm">
          <Button
            component={Link}
            href="/subscribe"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="md"
            radius="md"
            rightSection={<IconCrown size={16} />}
          >
            Upgrade Now
          </Button>
        </Group>
      </Group>

      {/* Mobile-only CTA */}
      <Button
        component={Link}
        href="/subscribe"
        hiddenFrom="sm"
        fullWidth
        mt="md"
        variant="gradient"
        gradient={{ from: "blue", to: "cyan" }}
        radius="md"
      >
        Upgrade Now
      </Button>
    </ProCard>
  );
}
