import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import type { MileageLog } from "@/types/mileage";
import { createClient } from "@/lib/supabaseServerClient";
import { Card, Container, Title, Text, Group } from "@mantine/core";
import { PrintMilageLog } from "@/components/milagelog/PrintMilageLog";

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

  if (!log) {
    return (
      <Container size="md" py="xl">
        <Text>No log found.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" mt={80}>
      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>Mileage Log Details</Title>
          <PrintMilageLog log={log} />
        </Group>
        <MileageLogDisplay
          startDate={new Date(log.start_date)}
          endDate={new Date(log.end_date)}
          totalMileage={log.total_mileage}
          totalBusinessMiles={log.total_business_miles}
          totalPersonalMiles={log.total_personal_miles}
          startMileage={Number(log.start_mileage)}
          endMileage={Number(log.end_mileage)}
          businessDeductionRate={log.business_deduction_rate}
          businessDeductionAmount={log.business_deduction_amount}
          vehicleInfo={log.vehicle_info}
          mileageLog={log.log_entries}
          logId={log.id}
          userId={log.user_id}
        />
      </Card>
    </Container>
  );
}
