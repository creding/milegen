import Link from "next/link";
import { Group, Stack, Pill } from "@mantine/core";
import { SignoutButton } from "@/components/ui/SignoutButton";
import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { Logo } from "./Logo";
import { LoginButton } from "@/components/auth/LoginButton";
import { SignupButton } from "@/components/auth/SignupButton";
import { IconUser } from "@tabler/icons-react";
export async function Nav() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscriptionStatus = await checkSubscriptionStatus();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-md no-print">
      <Stack px={20} py={10}>
        <Group justify="space-between">
          <Logo />
          <Group gap={20}>
            {user ? (
              <>
                <Link
                  href="/generator"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  Generate Log
                </Link>
                <Link
                  href="/saved-logs"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  Saved Logs
                </Link>
                <Link
                  href="/account"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  <Group gap={3}>
                    <IconUser size={16} />
                    Account
                    {subscriptionStatus === "active" && (
                      <Pill variant="light" c="green">
                        Subscribed
                      </Pill>
                    )}
                  </Group>
                </Link>
                <SignoutButton />
              </>
            ) : (
              <>
                <LoginButton />
                <SignupButton />
              </>
            )}
          </Group>
        </Group>
      </Stack>
    </nav>
  );
}
