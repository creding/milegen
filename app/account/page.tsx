import { redirect } from "next/navigation";
import {
  Container,
  Card,
  Title,
  Text,
  Stack,
  Group,
  Badge,
} from "@mantine/core";
import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { ManageSubscriptionButton } from "@/components/ui/ManageSubscriptionButton";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscriptionStatus = await checkSubscriptionStatus();

  if (!user) {
    redirect("/?login=true&redirect=/account");
  }

  return (
    <Container size="sm" mt={80} py="xl">
      <Card withBorder>
        <Stack gap={2}>
          <Title order={2}>Account</Title>
          <Text size="sm" c="dimmed">
            Manage your account and subscription
          </Text>

          <Stack gap="md" mt="md">
            <Group>
              <Text fw={500}>Email:</Text>
              <Text>{user.email}</Text>
            </Group>

            <Group>
              <Text fw={500}>Subscription Status:</Text>
              <Badge
                variant="light"
                color={subscriptionStatus === "active" ? "green" : "red"}
              >
                {subscriptionStatus === "active" ? "Subscribed" : "Inactive"}
              </Badge>
            </Group>
            <ManageSubscriptionButton />
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
}
