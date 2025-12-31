import Link from "next/link";
import { Group, Box, Button, Container } from "@mantine/core";
import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { Logo } from "./Logo";
import { LoginButton } from "@/components/auth/LoginButton";
import { SignupButton } from "@/components/auth/SignupButton";
import { AccountButton } from "@/components/ui/AccountButton";
import { MobileNav } from "@/components/layout/MobileNav"; // Import client component
import { IconCrown } from "@tabler/icons-react";

export async function Nav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscriptionStatus = await checkSubscriptionStatus();

  return (
    <Box
      component="header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Container size="xl" h={70} px="md">
        <Group justify="space-between" h="100%" align="center">
          <Logo />

          {/* Main Navigation (Desktop) */}
          <Group gap={8} visibleFrom="sm">
            {user ? (
              <>
                <Link href="/generator">
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    radius="xl"
                    fw={600}
                  >
                    Generate Log
                  </Button>
                </Link>
                {subscriptionStatus === "active" && (
                  <Link href="/saved-logs">
                    <Button
                      variant="subtle"
                      color="gray"
                      size="sm"
                      radius="xl"
                      fw={600}
                    >
                      Saved Logs
                    </Button>
                  </Link>
                )}
              </>
            ) : null}
          </Group>

          {/* Auth Actions (Desktop) */}
          <Group gap="xs" visibleFrom="sm">
            {user ? (
              <>
                {subscriptionStatus !== "active" && (
                  <Link href="/subscribe">
                    <Button
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                      leftSection={<IconCrown size="1rem" />}
                      size="sm"
                      radius="xl"
                      fw={600}
                      style={{
                        boxShadow: "0 4px 12px rgba(34, 139, 230, 0.2)",
                        transition:
                          "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      }}
                    >
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
                <AccountButton subscriptionStatus={subscriptionStatus} />
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
      </Container>
    </Box>
  );
}
