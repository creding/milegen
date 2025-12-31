import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { createClient } from "@/lib/supabaseServerClient";
import { Title, Text, Group } from "@mantine/core";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { PageLayout } from "@/components/ui/PageLayout";
import { ProCard } from "@/components/ui/ProCard";

type SSRParams = {
  id: string;
};

export default async function Page({ params }: { params: Promise<SSRParams> }) {
  const { id } = await params;
  const supabase = await createClient();
  let log: MileageLog | null = null;

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

  const subscriptionStatus = await checkSubscriptionStatus();

  if (!log) {
    return (
      <PageLayout title="Log Not Found">
        <ProCard>
          <Text>We could not find the mileage log you requested.</Text>
        </ProCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Generated Mileage Log"
      subtitle={`Reviewing log #${log.id?.slice(0, 8)}`}
    >
      <ProCard maw={1000} mx="auto">
        <Group justify="space-between" mb="md">
          <Title order={3}>Mileage Log Details</Title>
        </Group>
        <MileageLogDisplay
          log={log}
          subscriptionStatus={subscriptionStatus || "inactive"}
        />
      </ProCard>
    </PageLayout>
  );
}
