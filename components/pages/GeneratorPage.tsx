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
import { MileageForm } from "@/components/milagelog/MileageForm";
import { FormValues } from "@/types/form_values";
import { useMediaQuery } from "@mantine/hooks";
import { generateMileageLogFromForm } from "@/app/actions/mileageGenerator";
import { CustomBusinessType } from "@/types/custom_business_type";
import { BusinessType as PredefinedBusinessTypeStructure } from "@/utils/mileageUtils"; // Type from mileageUtils

interface GeneratorPageProps {
  subscriptionStatus: string | null;
  customBusinessTypes: Pick<CustomBusinessType, 'id' | 'name'>[];
  predefinedBusinessTypes: PredefinedBusinessTypeStructure[];
}

export const GeneratorPage = ({
  subscriptionStatus,
  customBusinessTypes,
  predefinedBusinessTypes,
}: GeneratorPageProps) => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMileageLog = async (values: FormValues) => {
    setIsGenerating(true);

    // --- Validation --- 
    if (!values.startDate || !values.endDate) {
      notifications.show({
        title: "Error",
        message: "Start date and end date are required.",
        color: "red",
        icon: <IconX />,
      });
      setIsGenerating(false);
      return;
    }

    // Construct the combined vehicle string for the server action
    const vehicleString = `${values.vehicleYear} ${values.vehicleMake} ${values.vehicleModel}`.trim();
    // Parse numeric values from form, providing default '0' if undefined/empty
    const startMileageInt = parseInt(values.startMileage || "0");
    const endMileageInt = parseInt(values.endMileage || "0");
    const personalMilesInt = parseInt(values.totalPersonalMiles || "0");

    // Validate parsed numbers
    if (isNaN(startMileageInt) || isNaN(endMileageInt) || isNaN(personalMilesInt)) {
      notifications.show({
        title: "Error",
        message: "Invalid mileage numbers entered.",
        color: "red",
        icon: <IconX />,
      });
      setIsGenerating(false);
      return;
    }
    // --- End Validation ---

    try {
      // Call the server action with the correctly structured data
      const result = await generateMileageLogFromForm({
        // Pass correctly typed/formatted values
        startMileage: startMileageInt,
        endMileage: endMileageInt,
        totalPersonalMiles: personalMilesInt,
        vehicle: vehicleString, 
        startDate: values.startDate, // Guaranteed non-null by check above
        endDate: values.endDate,     // Guaranteed non-null by check above
        businessType: values.businessType, // Pass businessType from form values
        // Pass other necessary params
        subscriptionStatus: subscriptionStatus || "inactive",
        currentEntryCount: 0, // TODO: Replace with actual count if needed
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
    // No longer managing form state here
    // Note: The actual form reset is handled within MileageForm via form.reset()
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
          subscriptionStatus={subscriptionStatus}
          onGenerate={handleGenerateMileageLog}
          onReset={resetForm}
          customBusinessTypes={customBusinessTypes}
          predefinedBusinessTypes={predefinedBusinessTypes}
        />
      </Card>
    </Container>
  );
};
