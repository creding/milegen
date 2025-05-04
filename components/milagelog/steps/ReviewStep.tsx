import React from "react";
import { Box, Text, SimpleGrid, Title, Paper } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { FormValues } from "@/types/form_values";
import { formatDate } from "@/utils/date.utils";

// Define VehicleOption locally or import if centralized
interface VehicleOption {
  value: string;
  label: string;
}

// --- Component Props Interface --- //

interface ReviewStepProps {
  form: UseFormReturnType<FormValues>;
  vehicleMakes: VehicleOption[]; // Add prop for makes
  vehicleModels: Record<string, VehicleOption[]>; // Add prop for models
}

// --- Component Definition --- //

export function ReviewStep({ 
  form, 
  vehicleMakes, // Destructure props
  vehicleModels 
}: ReviewStepProps) {
  const { values } = form;

  // Calculate total miles driven based on user input
  const startMiles = parseInt(values.startMileage || "0");
  const endMiles = parseInt(values.endMileage || "0");
  const totalMilesDriven = endMiles > startMiles ? endMiles - startMiles : 0;

  // Calculate business miles based on total driven and user's personal miles input
  const personalMilesInput = parseInt(values.totalPersonalMiles || "0");
  const businessMiles =
    totalMilesDriven >= personalMilesInput
      ? totalMilesDriven - personalMilesInput
      : 0;

  // Re-implement vehicle label logic using props
  let vehicleDisplay = "Vehicle information incomplete";
  if (values.vehicleMake && values.vehicleModel && values.vehicleYear) {
    const make = vehicleMakes.find((m) => m.value === values.vehicleMake);
    const modelData = vehicleModels[values.vehicleMake];
    const model = modelData?.find((m) => m.value === values.vehicleModel);

    if (make && model) {
      vehicleDisplay = `${values.vehicleYear} ${make.label} ${model.label}`.trim();
    } else {
      // Fallback if labels not found, use raw values
      vehicleDisplay = `${values.vehicleYear} ${values.vehicleMake} ${values.vehicleModel}`.trim();
    }
  }

  // Use the helper function for dates
  const startDateDisplay = formatDate(values.startDate);
  const endDateDisplay = formatDate(values.endDate);

  return (
    <Box my="lg">
      <Paper shadow="sm" p="lg" withBorder>
        <Title order={3} mb="xs">
          Review Details
        </Title>
        <Text mb="lg" size="sm" c="dimmed">
          Please confirm the details below before generating the mileage log.
        </Text>
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
          <Box>
            <Text fw={500}>Vehicle:</Text>
            <Text>{vehicleDisplay}</Text>
          </Box>
          <Box>
            <Text fw={500}>Mileage Range:</Text>
            {/* Display raw values with fallback */}
            <Text>
              {values.startMileage || "N/A"} - {values.endMileage || "N/A"}
            </Text>
          </Box>
          <Box>
            <Text fw={500}>Date Range:</Text>
            <Text>
              {startDateDisplay} to {endDateDisplay}
            </Text>
          </Box>
          <Box>
            <Text fw={500}>Total Miles Driven:</Text>
            <Text>{totalMilesDriven}</Text>
          </Box>
          <Box>
            <Text fw={500}>Business Miles:</Text>
            {/* Display the calculated business miles */}
            <Text>{businessMiles}</Text>
          </Box>
          <Box>
            <Text fw={500}>Personal Miles:</Text>
            {/* Also display the user's target personal miles */}
            <Text>{values.totalPersonalMiles || "Not Specified"}</Text>
          </Box>
          <Box>
            <Text fw={500}>Business Type:</Text>
            <Text>{values.businessType || "N/A"}</Text>
          </Box>
        </SimpleGrid>
      </Paper>
    </Box>
  );
}
