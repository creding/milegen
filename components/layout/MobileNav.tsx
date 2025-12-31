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
import { Button } from "@mantine/core";
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
  IconCrown,
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
    <Box hiddenFrom="sm">
      <Burger
        opened={opened}
        onClick={toggle}
        aria-label="Toggle navigation"
        size="sm"
        color="gray"
      />

      <Drawer
        opened={opened}
        onClose={close}
        title={
          <Text fw={700} size="lg">
            Menu
          </Text>
        }
        position="right"
        size="xs"
        padding="md"
        overlayProps={{ opacity: 0.5, blur: 4 }}
        withCloseButton
        radius={0}
      >
        <Stack gap={10}>
          {user ? (
            <>
              {subscriptionStatus !== "active" && (
                <Link href="/subscribe" onClick={() => close()}>
                  <Button
                    fullWidth
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    leftSection={<IconCrown size="1rem" />}
                    radius="xl"
                    fw={600}
                  >
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
              <Link href="/generator">
                <NavLink
                  component="div"
                  label="Generate Log"
                  onClick={() => close()}
                  leftSection={<IconPlus size={16} />}
                  variant="subtle"
                  active
                  color="gray"
                  className="mobile-nav-item"
                />
              </Link>
              <Link href="/saved-logs">
                <NavLink
                  component="div"
                  onClick={() => close()}
                  label="Saved Logs"
                  leftSection={<IconNotes size={16} />}
                  variant="subtle"
                  color="gray"
                />
              </Link>

              <Divider my="sm" />

              <Box>
                <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">
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
                        <Chip checked size="xs" color="green" variant="light">
                          Pro
                        </Chip>
                      )
                    }
                  />
                </Link>
                <NavLink
                  component="div"
                  label="Sign Out"
                  onClick={() => handleSignOut()}
                  leftSection={<IconLogout size={16} />}
                  c="red"
                />
              </Box>
            </>
          ) : (
            <>
              <Link href="/">
                <NavLink
                  component="div"
                  label="Home"
                  onClick={() => close()}
                  leftSection={<IconHome size={16} />}
                />
              </Link>
              <Link href="/?login=true">
                <NavLink
                  component="div"
                  onClick={() => close()}
                  label="Log In"
                  leftSection={<IconLogin size={16} />}
                />
              </Link>
              <Link href="/?signup=true">
                <NavLink
                  component="div"
                  onClick={() => close()}
                  label="Get Started"
                  leftSection={<IconUserPlus size={16} />}
                  variant="filled"
                  color="blue"
                  active
                />
              </Link>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
