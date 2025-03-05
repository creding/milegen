import Link from "next/link";
import { Group, Stack, Anchor, Box, Button } from "@mantine/core";
import { SignoutButton } from "@/components/ui/SignoutButton";
import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { Logo } from "./Logo";
import { LoginButton } from "@/components/auth/LoginButton";
import { SignupButton } from "@/components/auth/SignupButton";
import { AccountButton } from "@/components/ui/AccountButton";
import classes from "./nav.module.css";
import { MobileNav } from "@/components/layout/MobileNav"; // Import client component
import { IconCrown } from "@tabler/icons-react";

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
          <Group gap={20} className={classes.mainNav}>
            {user ? (
              <>
                <Anchor component={Link} href="/generator">
                  Generate Log
                </Anchor>
                {subscriptionStatus === "active" && (
                  <Anchor component={Link} href="/saved-logs">
                    Saved Logs
                  </Anchor>
                )}

                <AccountButton subscriptionStatus={subscriptionStatus} />
                <SignoutButton />
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
              </>
            ) : (
              <>
                <LoginButton />
                <SignupButton />
              </>
            )}
          </Group>
          <MobileNav user={user} subscriptionStatus={subscriptionStatus} />
        </Group>
      </Stack>
    </Box>
  );
}
