"use client";

import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { generateOrganicMileageLog } from "@/app/actions/generateOrganicMileageLog";
import { saveMileageLog as saveMileageLogApi } from "@/app/actions/saveMileageLog";
import type { MileageEntry, MileageLog } from "@/types/mileage";
import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";
import { PrintMilageLog } from "@/components/milagelog/PrintMilageLog";
import { IconCheck, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import {
  Button,
  Card,
  Container,
  Group,
  Title,
  Stack,
  Text,
} from "@mantine/core";
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
  const [mileageLog, setMileageLog] = useState<MileageLog | null>(null);
  const [vehicle, setVehicle] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [totalPersonalMiles, setTotalPersonalMiles] = useState("0");
  const [entryCount, setEntryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateMileageLog = async () => {
    const start = parseInt(startMileage);
    const end = parseInt(endMileage);
    const totalMiles = end - start;
    const personalMiles = parseInt(totalPersonalMiles) || 0;

    console.log("Starting handleGenerateMileageLog with values:", {
      start,
      end,
      totalMiles,
      personalMiles,
      vehicle,
      businessType,
      startDate,
      endDate,
      subscriptionStatus,
      entryCount,
    });

    if (isNaN(totalMiles) || totalMiles <= 0) {
      console.log(
        "Invalid mileage input:",
        startMileage,
        endMileage,
        totalMiles
      );
      notifications.show({
        title: "Invalid Input",
        message: "Please enter valid starting and ending odometer readings.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    try {
      console.log("Calling generateOrganicMileageLog with params:", {
        startMileage: start,
        endMileage: end,
        startDate,
        endDate,
        totalPersonalMiles: personalMiles,
        vehicle,
        businessType,
        subscriptionStatus: subscriptionStatus || "inactive",
        currentEntryCount: entryCount,
      });

      const result = await generateOrganicMileageLog({
        startMileage: start,
        endMileage: end,
        startDate,
        endDate,
        totalPersonalMiles: personalMiles,
        vehicle,
        businessType,
        subscriptionStatus: subscriptionStatus || "inactive",
        currentEntryCount: entryCount,
      });

      console.log("generateOrganicMileageLog result:", result);

      setMileageLog(result.mileageLog);
      setEntryCount(
        (prevCount) => prevCount + result.mileageLog.log_entries.length
      );
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
    setStartDate(new Date(new Date().getFullYear() - 1, 0, 1));
    setEndDate(new Date(new Date().getFullYear() - 1, 11, 31));
    setTotalPersonalMiles("0");
    setVehicle("");
    setBusinessType("");
  };

  const saveMileageLog = async () => {
    if (!mileageLog || mileageLog.log_entries.length === 0) {
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
        const result = await saveMileageLogApi(mileageLog);

        if (result.success) {
          notifications.show({
            title: "Success",
            message: "Mileage log saved successfully.",
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
        <Stack gap="md" mb="md">
          <Title order={2}>Generate Mileage Log</Title>
          <Text c="dimmed" size="sm">
            Fill out the form to generate a mileage log.
          </Text>
        </Stack>
        <MileageForm
          startMileage={startMileage}
          endMileage={endMileage}
          startDate={startDate}
          endDate={endDate}
          totalPersonalMiles={totalPersonalMiles}
          vehicle={vehicle}
          businessType={businessType}
          subscriptionStatus={subscriptionStatus}
          entryCount={entryCount}
          onStartMileageChange={setStartMileage}
          onEndMileageChange={setEndMileage}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onTotalPersonalMilesChange={setTotalPersonalMiles}
          onVehicleChange={setVehicle}
          onBusinessTypeChange={setBusinessType}
          onGenerate={handleGenerateMileageLog}
          onReset={resetForm}
        />
      </Card>

      {mileageLog && mileageLog.log_entries.length > 0 && (
        <Card withBorder mt="md" mb="md">
          <Group justify="space-between" mb="md" wrap="wrap">
            <Title order={2} size={isMobile ? "h3" : "h2"}>
              Mileage Log Details
            </Title>
            {isMobile ? (
              <Stack w="100%" mt="sm">
                <PrintMilageLog log={mileageLog} />
                {user && (
                  <Button
                    leftSection={<IconDeviceFloppy />}
                    onClick={saveMileageLog}
                    disabled={isSaving}
                    fullWidth
                    variant="gradient"
                    size={isMobile ? "md" : "sm"}
                  >
                    {isSaving ? "Saving..." : "Save Log"}
                  </Button>
                )}
              </Stack>
            ) : (
              <Group justify="flex-end" mt="md" mb="md">
                <PrintMilageLog log={mileageLog} />
                {user && (
                  <Button
                    leftSection={<IconDeviceFloppy />}
                    onClick={saveMileageLog}
                    disabled={isSaving}
                    variant="gradient"
                    size={isMobile ? "md" : "sm"}
                  >
                    {isSaving ? "Saving..." : "Save Log"}
                  </Button>
                )}
              </Group>
            )}
          </Group>
          <MileageLogDisplay
            startDate={new Date(mileageLog.start_date)}
            endDate={new Date(mileageLog.end_date)}
            totalMileage={mileageLog.total_mileage}
            totalBusinessMiles={mileageLog.total_business_miles}
            totalPersonalMiles={mileageLog.total_personal_miles}
            startMileage={Number(mileageLog.start_mileage)}
            endMileage={Number(mileageLog.end_mileage)}
            businessDeductionRate={mileageLog.business_deduction_rate}
            businessDeductionAmount={mileageLog.business_deduction_amount}
            vehicleInfo={mileageLog.vehicle_info}
            mileageLog={mileageLog.log_entries}
          />

          {isMobile ? (
            <Stack w="100%" mt="xl">
              <PrintMilageLog log={mileageLog} />
              {user && (
                <Button
                  leftSection={<IconDeviceFloppy />}
                  onClick={saveMileageLog}
                  disabled={isSaving}
                  fullWidth
                  variant="gradient"
                  size={isMobile ? "md" : "sm"}
                >
                  {isSaving ? "Saving..." : "Save Log"}
                </Button>
              )}
            </Stack>
          ) : (
            <Group justify="flex-end" mt="md" mb="md">
              <PrintMilageLog log={mileageLog} />
              {user && (
                <Button
                  variant="gradient"
                  leftSection={<IconDeviceFloppy />}
                  onClick={saveMileageLog}
                  disabled={isSaving}
                  size={isMobile ? "md" : "sm"}
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
