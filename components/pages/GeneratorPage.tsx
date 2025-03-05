"use client";

import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { saveMileageLog as saveMileageLogApi } from "@/app/actions/saveMileageLog";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";

import {
  IconCheck,
  IconDeviceFloppy,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import {
  Button,
  Card,
  Container,
  Group,
  Title,
  Stack,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { MileageForm } from "@/components/milagelog/MileageForm";
import { User } from "@supabase/supabase-js";
import { useMediaQuery } from "@mantine/hooks";
import { generateMileageLogFromForm } from "@/app/actions/mileageGenerator";
import { DownloadSpreadsheet } from "@/components/milagelog/DownloadSpreadsheet";

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
  const [mileageLog, setMileageLog] = useState<MileageLog>();
  const [vehicle, setVehicle] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [totalPersonalMiles, setTotalPersonalMiles] = useState("0");
  const [entryCount, setEntryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleGenerateMileageLog = async () => {
    const start = parseInt(startMileage);
    const end = parseInt(endMileage);
    const personalMiles = parseInt(totalPersonalMiles) || 0;

    setIsGenerating(true);

    try {
      const result = await generateMileageLogFromForm({
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
      if (result) {
        setMileageLog(result);
        setEntryCount((prevCount) => prevCount + result.log_entries.length);
        setShowForm(false);
        setIsGenerating(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        notifications.show({
          title: "Error",
          message:
            error?.message ||
            "Failed to generate mileage log. Please try again.",
          color: "red",
          icon: <IconX />,
        });
        setShowForm(true);
      }
    }
  };

  const handleNewLog = () => {
    resetForm();
    setMileageLog(undefined);
    setShowForm(true);
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

  return (
    <Container size="xl" mt={20} py="xl" px={isMobile ? "xs" : "md"}>
      {showForm ? (
        <Card withBorder pos="relative">
          <LoadingOverlay visible={isGenerating} overlayProps={{ blur: 2 }} />
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
      ) : null}

      {!showForm && mileageLog && (
        <Card radius="md" withBorder>
          <Stack>
            <Group justify="space-between">
              <Title order={2}>Generated Mileage Log</Title>
              <Group>
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={20} />}
                  onClick={handleNewLog}
                  size={isMobile ? "md" : "sm"}
                >
                  New
                </Button>
                {subscriptionStatus === "active" && (
                  <Button
                    loading={isSaving}
                    variant="light"
                    leftSection={<IconDeviceFloppy size={20} />}
                    onClick={saveMileageLog}
                    size={isMobile ? "md" : "sm"}
                  >
                    Save
                  </Button>
                )}
              </Group>
            </Group>
            <MileageLogDisplay log={mileageLog} />
          </Stack>
        </Card>
      )}
    </Container>
  );
};
