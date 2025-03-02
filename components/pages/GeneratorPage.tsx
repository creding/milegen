"use client";

import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { generateMileageLog } from "@/app/actions/generateMileageLog";
import { saveMileageLog as saveMileageLogApi } from "@/app/actions/saveMileageLog";
import type { MileageEntry } from "@/types/mileage";
import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import { PrintMilageLog } from "@/components/milagelog/PrintMilageLog";
import { IconCheck, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { Button, Card, Container, Group, Title, Stack } from "@mantine/core";
import { MileageForm } from "@/components/milagelog/MileageForm"; 
import { User } from "@supabase/supabase-js";
import { useMediaQuery } from "@mantine/hooks";

export const GeneratorPage = ({
  user,
  subscriptionStatus,
}: {
  user: User | null;
  subscriptionStatus: string;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [startMileage, setStartMileage] = useState("");
  const [endMileage, setEndMileage] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const lastYear = new Date().getFullYear() - 1;
    return new Date(lastYear, 0, 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const lastYear = new Date().getFullYear() - 1;
    return new Date(lastYear, 11, 31);
  });
  const [mileageLog, setMileageLog] = useState<MileageEntry[]>([]);
  const [totalMileage, setTotalMileage] = useState(0);
  const [destination, setDestination] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [totalPersonalMiles, setTotalPersonalMiles] = useState("0");
  const [entryCount, setEntryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateMileageLog = async () => {
    const start = parseInt(startMileage);
    const end = parseInt(endMileage);
    const totalMiles = end - start;
    const personalMiles = parseInt(totalPersonalMiles) || 0;
    
    if (isNaN(totalMiles) || totalMiles <= 0) {
      notifications.show({
        title: "Invalid Input",
        message: "Please enter valid starting and ending odometer readings.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    try {
      const { mileageLog: generatedLog, totalMileage } =
        await generateMileageLog({
          startMileage: start,
          endMileage: end,
          startDate,
          endDate,
          totalPersonalMiles: personalMiles,
          destination,
          businessPurpose,
          subscriptionStatus: subscriptionStatus || "inactive",
          currentEntryCount: entryCount,
        });

      setMileageLog(generatedLog);
      setTotalMileage(totalMileage);
      setEntryCount((prevCount) => prevCount + generatedLog.length);
    } catch (error: unknown) {
      console.error("Error generating mileage log:", error);
      if (error instanceof Error) {
        notifications.show({
          title: "Error",
          message:
            error?.message ||
            "Failed to generate mileage log. Please try again.",
          color: "red",
          icon: <IconX />,
        });
      }
    }
  };

  const resetForm = () => {
    setStartMileage("");
    setEndMileage("");
    setStartDate(() => {
      const lastYear = new Date().getFullYear() - 1;
      return new Date(lastYear, 0, 1);
    });
    setEndDate(() => {
      const lastYear = new Date().getFullYear() - 1;
      return new Date(lastYear, 11, 31);
    });
    setMileageLog([]);
    setTotalMileage(0);
    setTotalPersonalMiles("0");
    setDestination("");
    setBusinessPurpose("");
  };

  const saveMileageLog = async () => {
    if (mileageLog.length === 0) {
      notifications.show({
        title: "No Entries to Save",
        message: "Please generate a mileage log first.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (user) {
        const result = await saveMileageLogApi({
          id: 0,
          user_id: user?.id,
          year: startDate.getFullYear().toString(),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          start_mileage: startMileage,
          end_mileage: endMileage,
          total_mileage: totalMileage,
          total_personal_miles: totalPersonalMiles,
          log_entries: mileageLog,
          created_at: new Date().toISOString(),
        });

        if (result.success) {
          notifications.show({
            title: "Success",
            message: "Milage log saved successfully.",
            color: "green",
            icon: <IconCheck />,
          });
        } else {
          notifications.show({
            title: "Error",
            message: result.message,
            color: "red",
            icon: <IconX />,
          });
        }
      } else {
        throw new Error("User is not logged in");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving mileage log:", error.message);
      }
      notifications.show({
        title: "Error",
        message: "Failed to save mileage log. Please try again.",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container size="xl" mt={20} py="xl" px={isMobile ? "xs" : "md"}>
      <Card withBorder>
        <MileageForm
          startMileage={startMileage}
          endMileage={endMileage}
          startDate={startDate}
          endDate={endDate}
          totalPersonalMiles={totalPersonalMiles}
          destination={destination}
          businessPurpose={businessPurpose}
          subscriptionStatus={subscriptionStatus}
          entryCount={entryCount}
          onStartMileageChange={setStartMileage}
          onEndMileageChange={setEndMileage}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onTotalPersonalMilesChange={setTotalPersonalMiles}
          onDestinationChange={setDestination}
          onBusinessPurposeChange={setBusinessPurpose}
          onGenerate={handleGenerateMileageLog}
          onReset={resetForm}
        />
      </Card>

      {mileageLog.length > 0 && (
        <Card withBorder mt="md" mb="md">
          <Group justify="space-between" mb="md" wrap="wrap">
            <Title order={2} size={isMobile ? "h3" : "h2"}>
              Mileage Log Details
            </Title>
            {isMobile ? (
              <Stack w="100%" mt="sm">
                <PrintMilageLog
                  log={{
                    id: 0,
                    user_id: user?.id,
                    year: startDate.getFullYear().toString(),
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    start_mileage: startMileage,
                    end_mileage: endMileage,
                    total_mileage: totalMileage,
                    total_personal_miles: totalPersonalMiles,
                    log_entries: mileageLog,
                    created_at: new Date().toISOString(),
                  }}
                />
                {user && (
                  <Button
                    leftSection={<IconDeviceFloppy />}
                    onClick={saveMileageLog}
                    disabled={isSaving}
                    fullWidth
                    variant="gradient"
                  >
                    {isSaving ? "Saving..." : "Save Log"}
                  </Button>
                )}
              </Stack>
            ) : (
              <Group justify="flex-end" mt="md" mb="md">
                <PrintMilageLog
                  log={{
                    id: 0,
                    user_id: user?.id,
                    year: startDate.getFullYear().toString(),
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    start_mileage: startMileage,
                    end_mileage: endMileage,
                    total_mileage: totalMileage,
                    total_personal_miles: totalPersonalMiles,
                    log_entries: mileageLog,
                    created_at: new Date().toISOString(),
                  }}
                />
                {user && (
                  <Button
                    leftSection={<IconDeviceFloppy />}
                    onClick={saveMileageLog}
                    disabled={isSaving}
                    variant="gradient"
                  >
                    {isSaving ? "Saving..." : "Save Log"}
                  </Button>
                )}
              </Group>
            )}
          </Group>
          <MileageLogDisplay
            startDate={startDate}
            endDate={endDate}
            totalMileage={totalMileage}
            totalPersonalMiles={parseInt(totalPersonalMiles)}
            startMileage={parseInt(startMileage)}
            endMileage={parseInt(endMileage)}
            mileageLog={mileageLog}
          />

          {isMobile ? (
            <Stack w="100%" mt="xl">
              <PrintMilageLog
                log={{
                  id: 0,
                  user_id: user?.id,
                  year: startDate.getFullYear().toString(),
                  start_date: startDate.toISOString(),
                  end_date: endDate.toISOString(),
                  start_mileage: startMileage,
                  end_mileage: endMileage,
                  total_mileage: totalMileage,
                  total_personal_miles: totalPersonalMiles,
                  log_entries: mileageLog,
                  created_at: new Date().toISOString(),
                }}
              />
              {user && (
                <Button
                  leftSection={<IconDeviceFloppy />}
                  onClick={saveMileageLog}
                  disabled={isSaving}
                  fullWidth
                  variant="gradient"
                >
                  {isSaving ? "Saving..." : "Save Log"}
                </Button>
              )}
            </Stack>
          ) : (
            <Group justify="flex-end" mt="md" mb="md">
              <PrintMilageLog
                log={{
                  id: 0,
                  user_id: user?.id,
                  year: startDate.getFullYear().toString(),
                  start_date: startDate.toISOString(),
                  end_date: endDate.toISOString(),
                  start_mileage: startMileage,
                  end_mileage: endMileage,
                  total_mileage: totalMileage,
                  total_personal_miles: totalPersonalMiles,
                  log_entries: mileageLog,
                  created_at: new Date().toISOString(),
                }}
              />
              {user && (
                <Button
                  variant="gradient"
                  leftSection={<IconDeviceFloppy />}
                  onClick={saveMileageLog}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Log"}
                </Button>
              )}
            </Group>
          )}
        </Card>
      )}
    </Container>
  );
};
