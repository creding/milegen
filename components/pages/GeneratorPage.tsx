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
import { PageLayout } from "@/components/ui/PageLayout";
import { ProCard } from "@/components/ui/ProCard";

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
    <PageLayout
      title="Generate Mileage Log"
      subtitle="Enter your trip details below to generate an IRS-compliant mileage log in seconds."
    >
      {showForm ? (
        <ProCard pos="relative" maw={800} mx="auto">
          <LoadingOverlay visible={isGenerating} overlayProps={{ blur: 2 }} />
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
        </ProCard>
      ) : null}

      {!showForm && mileageLog && (
        <ProCard>
          <Stack>
            <Group justify="space-between">
              <Title order={3} c="gray.8">
                Generated Log Preview
              </Title>
              <Group>
                <Button
                  variant="outline"
                  color="gray"
                  leftSection={<IconRefresh size={18} />}
                  onClick={handleNewLog}
                >
                  New Log
                </Button>
                {subscriptionStatus === "active" && (
                  <Button
                    loading={isSaving}
                    variant="gradient"
                    gradient={{ from: "teal", to: "cyan" }}
                    leftSection={<IconDeviceFloppy size={18} />}
                    onClick={saveMileageLog}
                  >
                    Save & Download
                  </Button>
                )}
              </Group>
            </Group>
            <MileageLogDisplay
              log={mileageLog}
              subscriptionStatus={subscriptionStatus}
            />
          </Stack>
        </ProCard>
      )}
    </PageLayout>
  );
};
