"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

import { IconCheck, IconX } from "@tabler/icons-react";
import {
  Card,
  Container,
  Title,
  Stack,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { MileageForm, FormValues } from "@/components/milagelog/MileageForm";
import { useMediaQuery } from "@mantine/hooks";
import { generateMileageLogFromForm } from "@/app/actions/mileageGenerator";

export const GeneratorPage = ({
  subscriptionStatus,
}: {
  subscriptionStatus: string | null;
}) => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [startDate, setStartDate] = useState(() => {
    const lastYear = new Date().getFullYear() - 1;
    return new Date(lastYear, 0, 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const lastYear = new Date().getFullYear() - 1;
    return new Date(lastYear, 11, 31);
  });
  const [vehicle, setVehicle] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [totalPersonalMiles, setTotalPersonalMiles] = useState("0");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMileageLog = async (values: FormValues) => {
    const start = parseInt(values.startMileage);
    const end = parseInt(values.endMileage);
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
        currentEntryCount: 0,
      });

      if (result.success && result.logId) {
        notifications.show({
          title: "Success",
          message:
            "Mileage log generated and saved successfully with realistic trip patterns and locations.",
          color: "green",
          icon: <IconCheck />,
        });

        // Redirect to saved logs page
        router.push(`/saved-logs/${result.logId}`);
      } else {
        const errorMessage =
          result.message ||
          "Failed to generate or save mileage log. This could be due to:" +
            "\n• Invalid mileage range" +
            "\n• Unrealistic trip patterns" +
            "\n• Database connection issues" +
            "\n\nPlease verify your inputs and try again.";

        notifications.show({
          title: "Error",
          message: errorMessage,
          color: "red",
          icon: <IconX />,
        });
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
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setStartDate(new Date(new Date().getFullYear() - 1, 0, 1));
    setEndDate(new Date(new Date().getFullYear() - 1, 11, 31));
    setTotalPersonalMiles("0");
    setVehicle("");
    setBusinessType("");
  };

  return (
    <Container mt={60} size="xl" py="xl" px={isMobile ? "xs" : "md"}>
      <Card withBorder pos="relative">
        <LoadingOverlay visible={isGenerating} overlayProps={{ blur: 2 }} />
        <Stack gap="md" mb="md">
          <Title order={2}>Generate Mileage Log</Title>
          <Text c="dimmed" size="sm">
            Fill out the form to generate a mileage log.
          </Text>
        </Stack>
        <MileageForm
          startDate={startDate}
          endDate={endDate}
          totalPersonalMiles={totalPersonalMiles}
          vehicle={vehicle}
          businessType={businessType}
          subscriptionStatus={subscriptionStatus}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onTotalPersonalMilesChange={setTotalPersonalMiles}
          onVehicleChange={setVehicle}
          onBusinessTypeChange={setBusinessType}
          onGenerate={handleGenerateMileageLog}
          onReset={resetForm}
        />
      </Card>
    </Container>
  );
};
