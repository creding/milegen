import Link from "next/link";
import { Group, Stack, Anchor, Box, Button, Text } from "@mantine/core";
import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { Logo } from "./Logo";
import { LoginButton } from "@/components/auth/LoginButton";
import { AccountButton } from "@/components/ui/AccountButton";
import { SignoutButton } from "@/components/ui/SignoutButton";
import classes from "./nav.module.css";
import { MobileNav } from "@/components/layout/MobileNav"; // Import client component
import {
  IconCrown,
  IconPencilPlus,
  IconListDetails,
} from "@tabler/icons-react";

export async function Nav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscriptionStatus = await checkSubscriptionStatus();

  return (
    <Box component="header" className={classes.header}>
      <Stack px={20} py={10} h={60}>
        <Group justify="space-between">
          <Logo />

          {/* Main Navigation (Server-Rendered) */}
          <Group gap="md" className={classes.mainNav}>
            {user ? (
              <Group justify="flex-end" align="center">
                <Group visibleFrom="sm" gap="md">
                  {/* Fixed JSX for Generate Log link */}
                  <Anchor
                    component={Link}
                    href="/generator"
                    c="gray.7"
                    className={classes.navLink}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <IconPencilPlus size="1rem" />
                      <Text size="sm">Generate Log</Text>
                    </Group>
                  </Anchor>

                  {/* Fixed JSX for Saved Logs link */}
                  {subscriptionStatus === "active" && (
                    <Anchor
                      component={Link}
                      href="/saved-logs"
                      c="gray.7"
                      className={classes.navLink}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <IconListDetails size="1rem" />
                        <Text size="sm">Saved Logs</Text>
                      </Group>
                    </Anchor>
                  )}

                  {/* Account and Signout Buttons */}
                  <AccountButton />
                  <SignoutButton />

                  {/* Subscribe Button */}
                  {subscriptionStatus !== "active" && (
                    <Button
                      component={Link}
                      href="/subscribe"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                      leftSection={<IconCrown size="1rem" />}
                      size="sm"
                    >
                      Subscribe
                    </Button>
                  )}
                </Group>
              </Group>
            ) : (
              <>
                {/* Login/Signup buttons likely don't need the navLink class */}
                <LoginButton />
                {/* <SignupButton /> Removed */}
              </>
            )}
          </Group>
          <MobileNav user={user} subscriptionStatus={subscriptionStatus} />
        </Group>
      </Stack>
    </Box>
  );
}
