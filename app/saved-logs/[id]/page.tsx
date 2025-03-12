import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { createClient } from "@/lib/supabaseServerClient";
import { Card, Container, Title, Text, Group } from "@mantine/core";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";

type SSRParams = {
  id: string;
};

type SearchParams = {
  page?: string;
  pageSize?: string;
};

export default async function Page({ 
  params,
  searchParams,
}: { 
  params: Promise<SSRParams>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const page = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.pageSize || '25');
  const supabase = await createClient();
  let log: MileageLog | null = null;
  const subscriptionStatus = await checkSubscriptionStatus();
  try {
    // First get the main log data
    const { data: logData, error: logError } = await supabase
      .from("mileage_logs")
      .select()
      .eq("id", id)
      .single();

    if (logError) throw logError;

    // Get total count of entries
    const { count: totalEntries, error: countError } = await supabase
      .from("mileage_log_entries")
      .select("*", { count: "exact", head: true })
      .eq("log_id", id);

    if (countError) throw countError;

    // Then get paginated entries for this log
    const { data: entriesData, error: entriesError } = await supabase
      .from("mileage_log_entries")
      .select()
      .eq("log_id", id)
      .order("date")
      .order("start_mileage")
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (entriesError) throw entriesError;

    // Combine the log data with its entries and pagination info
    log = {
      ...logData,
      log_entries: entriesData || [],
      pagination: {
        currentPage: page,
        pageSize,
        totalEntries: totalEntries || 0,
        totalPages: Math.ceil((totalEntries || 0) / pageSize),
      },
    };
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
        <MileageLogDisplay subscriptionStatus={subscriptionStatus} log={log} />
      </Card>
    </Container>
  );
}
