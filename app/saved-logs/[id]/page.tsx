import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import {
  getSavedMileageLog,
  PaginatedMileageLog,
} from "@/lib/data/mileageLogData";
import { Card, Container, Title, Text, Group } from "@mantine/core";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { MileageLogWithEntries } from "@/types/index"; // Import the new combined type
import { Tables } from "@/types/database.types"; // Import Tables
import { createClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?login=true&redirect=/saved-logs/" + id);
  }

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

  // Ensure the fetched log includes log_entries before transforming
  if (!log || !log.log_entries) {
    console.error("Fetched log is missing log_entries");
    // Decide how to handle this - perhaps show an error message or return notFound()
    // For now, returning notFound to prevent runtime errors downstream
    return (
      <Container size="md" py="xl">
        <Text>No log entries found.</Text>
      </Container>
    );
  }

  // Explicitly type transformedLog and ensure entries match
  const transformedLog: MileageLogWithEntries = {
    ...log,
    log_entries: log.log_entries.map(
      (
        entry: Tables<"mileage_log_entries">
      ): Tables<"mileage_log_entries"> => ({
        // Map all required fields explicitly, providing defaults if necessary
        id: entry.id,
        log_id: entry.log_id ?? null, // Use null if missing
        date: entry.date, // Pass the string date directly
        type: entry.type, // Already a string
        miles: entry.miles ?? 0, // Default to 0 if null
        purpose: entry.purpose ?? "", // Default to empty string
        location: entry.location ?? null, // Use null if missing
        start_mileage: entry.start_mileage ?? 0, // Default to 0
        end_mileage: entry.end_mileage ?? 0, // Default to 0
        vehicle_info: entry.vehicle_info ?? "", // Default to empty string
        business_type: entry.business_type ?? null, // Use null if missing
        created_at: entry.created_at ?? new Date().toISOString(), // Provide a default creation time
        updated_at: entry.updated_at ?? new Date().toISOString(), // Provide a default update time
      })
    ),
    // Ensure pagination is handled or explicitly set to undefined if not applicable here
    // pagination: log.pagination // If pagination comes from fetchMileageLogById
  };

  return (
    <Container size="xl" py="xl" mt={60}>
      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Mileage Log Details</Title>
        </Group>
        {/* Pass the single transformed log object */}
        <MileageLogDisplay
          log={transformedLog}
          subscriptionStatus={subscriptionStatus}
        />
      </Card>
    </Container>
  );
}
