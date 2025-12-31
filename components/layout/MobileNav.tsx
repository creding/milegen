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
import { User } from "@supabase/supabase-js";

interface MobileNavProps {
  user: User | null;
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
    <Box className={classes.mobileNavContainer}>
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
        offset={5}
        radius="sm"
      >
        <Stack gap={0} p="md">
          {user ? (
            <>
              <Link href="/generator">
                <NavLink
                  component="div"
                  label="Generate Log"
                  onClick={() => close()}
                  leftSection={<IconPlus size={16} />}
                />
              </Link>
              <Link href="/saved-logs">
                <NavLink
                  component="div"
                  onClick={() => close()}
                  label="Saved Logs"
                  leftSection={<IconNotes size={16} />}
                />
              </Link>

              <Divider my="sm" />

              <Box py="xs">
                <Text size="sm" fw={700} c="dimmed" mb="xs">
                  Account
                </Text>
                <Link href="/account">
                  <NavLink
                    component="div"
                    onClick={() => close()}
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
                </Link>
                <Link href="/">
                  <NavLink
                    component="div"
                    label="Sign Out"
                    onClick={() => handleSignOut()}
                    leftSection={<IconLogout size={16} />}
                  />
                </Link>
              </Box>
            </>
          ) : (
            <>
              <Link href="/">
                <NavLink
                  component="div"
                  label="Home"
                  leftSection={<IconHome size={16} />}
                />
              </Link>
              <Link href="/?login=true">
                <NavLink
                  component="div"
                  onClick={() => close()}
                  label="Login"
                  leftSection={<IconLogin size={16} />}
                />
              </Link>
              <Link href="/?signup=true">
                <NavLink
                  component="div"
                  onClick={() => close()}
                  label="Signup"
                  leftSection={<IconUserPlus size={16} />}
                />
              </Link>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
