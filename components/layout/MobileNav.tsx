"use client";

import Link from "next/link";
import {
  Burger,
  Drawer,
  Stack,
  Divider,
  Text,
  Box,
  NavLink,
  Chip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./nav.module.css";
import { createClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";
import {
  IconHome,
  IconLogin,
  IconUserPlus,
  IconLogout,
  IconSettings,
  IconPlus,
  IconNotes,
} from "@tabler/icons-react";

interface MobileNavProps {
  user: any;
  subscriptionStatus: string;
}

export function MobileNav({ user, subscriptionStatus }: MobileNavProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    close();
  };
  return (
    <div className={classes.mobileNavContainer}>
      <Burger
        opened={opened}
        onClick={toggle}
        aria-label="Toggle navigation"
        size="sm"
      />

      <Drawer
        opened={opened}
        onClose={close}
        title="Menu"
        position="right"
        overlayProps={{ opacity: 0.5, blur: 4 }}
        withCloseButton
        size="100%"
      >
        <Stack gap={0} p="md">
          {user ? (
            <>
              <NavLink
                component={Link}
                href="/generator"
                label="Generate Log"
                onClick={() => close()}
                leftSection={<IconPlus size={16} />}
              />
              <NavLink
                onClick={() => close()}
                component={Link}
                href="/saved-logs"
                label="Saved Logs"
                leftSection={<IconNotes size={16} />}
              />

              <Divider my="sm" />

              <Box py="xs">
                <Text size="sm" fw={700} c="dimmed" mb="xs">
                  Account
                </Text>
                <NavLink
                  onClick={() => close()}
                  component={Link}
                  href="/account"
                  label="Account Settings"
                  leftSection={<IconSettings size={16} />}
                  rightSection={
                    subscriptionStatus === "active" && (
                      <Chip
                        defaultChecked
                        size="xs"
                        color="green"
                        variant="light"
                      >
                        Subscribed
                      </Chip>
                    )
                  }
                />
                <NavLink
                  component={Link}
                  href="/"
                  label="Sign Out"
                  onClick={() => handleSignOut()}
                  leftSection={<IconLogout size={16} />}
                />
              </Box>
            </>
          ) : (
            <>
              <NavLink
                component={Link}
                href="/"
                label="Home"
                leftSection={<IconHome size={16} />}
              />
              <NavLink
                onClick={() => close()}
                component={Link}
                href="/?login=true"
                label="Login"
                leftSection={<IconLogin size={16} />}
              />
              <NavLink
                onClick={() => close()}
                component={Link}
                href="/?signup=true"
                label="Signup"
                leftSection={<IconUserPlus size={16} />}
              />
            </>
          )}
        </Stack>
      </Drawer>
    </div>
  );
}
