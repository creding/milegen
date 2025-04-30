import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import { getSavedMileageLog, PaginatedMileageLog } from "@/lib/data/mileageLogData";
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
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1");
  const currentPageSize = 100;
  let log: PaginatedMileageLog | null = null;

  const subscriptionStatus = await checkSubscriptionStatus();

  try {
    log = await getSavedMileageLog({
      logId: id,
      page: currentPage,
      pageSize: currentPageSize,
    });
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

  // Transform log entries dates from string to Date objects for the display component
  const transformedLog = {
    ...log,
    log_entries: log.log_entries.map((entry) => ({
      ...entry,
      date: new Date(entry.date), // Convert string date to Date object
      type: entry.type as 'business' | 'personal', // Cast string to expected literal union
      business_type: entry.business_type ?? '', // Provide default empty string if null
      location: entry.location ?? undefined, // Convert null to undefined
      log_id: entry.log_id ?? undefined // Convert null to undefined
    })),
  };

  return (
    <Container size="xl" py="xl">
      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Mileage Log Details</Title>
        </Group>
        <MileageLogDisplay subscriptionStatus={subscriptionStatus} log={transformedLog} />
      </Card>
    </Container>
  );
}
