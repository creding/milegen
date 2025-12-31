import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Button,
  SimpleGrid,
} from "@mantine/core";
import { ProCard } from "@/components/ui/ProCard";
import { IconCreditCard, IconCheck, IconCrown } from "@tabler/icons-react";
import { getSubscriptionDetails } from "@/app/actions/getSubscriptionDetails";
import { ManageSubscriptionButton } from "@/components/ui/ManageSubscriptionButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServerClient";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?login=true");
  }

  const subscription = await getSubscriptionDetails();
  const isPro = subscription?.status === "active";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Subscription Management
          </Title>
          <Text c="dimmed">
            Manage your billing information and subscription plan.
          </Text>
        </div>

        <ProCard p="lg" radius="md">
          <Group justify="space-between" align="flex-start" mb="md">
            <Group>
              <ThemeIcon
                size={48}
                radius="md"
                variant="gradient"
                gradient={{
                  from: isPro ? "blue" : "gray",
                  to: isPro ? "cyan" : "gray",
                  deg: 45,
                }}
              >
                {isPro ? <IconCrown size={28} /> : <IconCreditCard size={28} />}
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">
                  {isPro ? "MileGen Pro Plan" : "Free Plan"}
                </Text>
                <Text size="sm" c="dimmed">
                  {isPro
                    ? "Unlimited mileage logs and premium features."
                    : "Basic access to mileage generation."}
                </Text>
              </div>
            </Group>
            <Badge size="lg" variant="light" color={isPro ? "green" : "gray"}>
              {isPro ? "Active" : "Inactive"}
            </Badge>
          </Group>

          {isPro ? (
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Stack gap={4}>
                  <Text size="sm" c="dimmed" fw={600} tt="uppercase">
                    Status
                  </Text>
                  <Text fw={500}>Active Subscription</Text>
                </Stack>
                {subscription?.current_period_end && (
                  <Stack gap={4}>
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">
                      Next Billing Date
                    </Text>
                    <Text fw={500}>
                      {formatDate(subscription.current_period_end)}
                    </Text>
                  </Stack>
                )}
              </SimpleGrid>

              <Group mt="md">
                <ManageSubscriptionButton />
              </Group>
            </Stack>
          ) : (
            <Stack gap="md" mt="md">
              <Text>
                Upgrade to MileGen Pro to unlock unlimited mileage logs,
                audit-ready PDF exports, and more.
              </Text>
              <Group>
                <Link href="/subscribe">
                  <Button
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    leftSection={<IconCrown size="1rem" />}
                    size="md"
                    radius="md"
                  >
                    Upgrade Now
                  </Button>
                </Link>
              </Group>
            </Stack>
          )}
        </ProCard>

        <ProCard title="Plan Features">
          <Stack gap="sm">
            <Group gap="sm">
              <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm">Unlimited Mileage Logs</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm">IRS-Compliant PDF Exports</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm">Secure Cloud Storage</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm">Priority Email Support</Text>
            </Group>
          </Stack>
        </ProCard>
      </Stack>
    </Container>
  );
}
