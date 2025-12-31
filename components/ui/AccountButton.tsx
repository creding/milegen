"use client";

import {
  Menu,
  Button,
  Avatar,
  Text,
  rem,
  Badge,
  Group,
  UnstyledButton,
} from "@mantine/core";
import {
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconUser,
  IconCreditCard,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";

export const AccountButton = ({
  subscriptionStatus,
}: {
  subscriptionStatus: "active" | null;
}) => {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Menu shadow="md" width={220} position="bottom-end" radius="md">
      <Menu.Target>
        <Button
          variant="default"
          radius="xl"
          size="sm"
          pr={8}
          rightSection={<IconChevronDown size={14} stroke={1.5} />}
          style={{ transition: "all 0.2s ease" }}
        >
          <Group gap={8}>
            <Avatar size={24} radius="xl" color="blue">
              <IconUser size={14} />
            </Avatar>
            <Text size="sm" fw={500} visibleFrom="sm">
              Account
            </Text>
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <div style={{ padding: "4px 8px 8px" }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
            My Profile
          </Text>
          {subscriptionStatus === "active" ? (
            <Badge color="green" variant="light" fullWidth radius="sm">
              Pro Plan Active
            </Badge>
          ) : (
            <Badge color="gray" variant="light" fullWidth radius="sm">
              Free Plan
            </Badge>
          )}
        </div>

        <Menu.Divider />

        <Menu.Label>Application</Menu.Label>
        <Menu.Item
          leftSection={
            <IconLayoutDashboard style={{ width: rem(14), height: rem(14) }} />
          }
          component={Link}
          href="/saved-logs"
        >
          My Logs
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconCreditCard style={{ width: rem(14), height: rem(14) }} />
          }
          component={Link}
          href="/subscription"
        >
          Subscription
        </Menu.Item>

        <Menu.Label>Settings</Menu.Label>
        <Menu.Item
          leftSection={
            <IconSettings style={{ width: rem(14), height: rem(14) }} />
          }
          component={Link}
          href="/account"
        >
          Account Settings
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={handleSignOut}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
