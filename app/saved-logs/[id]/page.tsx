import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { createClient } from "@/lib/supabaseServerClient";
import { Card, Container, Title, Text, Group } from "@mantine/core";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";

type SSRParams = {
  id: string;
};
export default async function Page({ params }: { params: Promise<SSRParams> }) {
  const { id } = await params;
  const supabase = await createClient();
  let log: MileageLog | null = null;
  const subscriptionStatus = await checkSubscriptionStatus();
  try {
    const { data, error } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    log = data;
  } catch (error) {
    console.error("Error fetching saved log:", error);
  }

  if (!log) {
    return (
      <Container size="md" py="xl">
        <Text>No log found.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Mileage Log Details</Title>
        </Group>
        <MileageLogDisplay log={log} subscriptionStatus={subscriptionStatus} />
      </Card>
    </Container>
  );
}
