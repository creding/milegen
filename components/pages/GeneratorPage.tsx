"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { saveMileageLog as saveMileageLogApi } from "@/app/actions/saveMileageLog";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { MileageLogDisplay } from "@/components/milagelog/MileageLogDisplay";

import { IconCheck, IconX } from "@tabler/icons-react";
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
  const router = useRouter(); // Add router
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
        // Auto-save the log immediately
        const saveResult = await saveMileageLogApi(result);

        if (saveResult.success && saveResult.logId) {
          notifications.show({
            title: "Log Generated",
            message: "Mileage log saved successfully! Redirecting...",
            color: "green",
            icon: <IconCheck />,
          });
          // Redirect to the new log preview page
          router.push(`/saved-logs/${saveResult.logId}`);
        } else {
          throw new Error(
            saveResult.message || "Failed to save generated log."
          );
        }
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
      }
      setIsGenerating(false);
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
    </PageLayout>
  );
};
