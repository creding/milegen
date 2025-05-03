// components/milagelog/steps/ReviewStep.tsx
import React from 'react';
import { Box, Paper, Title, Text, Stack, Group, Divider } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { VEHICLE_MAKES } from '@/utils/constants'; // Import constants if needed for display

// Define FormValues type (should match the one in MileageForm.tsx)
interface FormValues {
  startMileage: string;
  endMileage: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: string;
  businessType: string;
}

interface ReviewStepProps {
  form: UseFormReturnType<FormValues>;
  totalMiles: number;
  businessMiles: number;
  availableModels: { value: string; label: string }[]; // Pass needed constants/state for display
}

export function ReviewStep({ 
  form, 
  totalMiles, 
  businessMiles, 
  availableModels 
}: ReviewStepProps) {
  // Helper to find label for display
  const displayVehicleMake = VEHICLE_MAKES.find(m => m.value === form.values.vehicleMake)?.label || form.values.vehicleMake;
  const displayVehicleModel = availableModels.find(m => m.value === form.values.vehicleModel)?.label || form.values.vehicleModel;

  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Review Your Mileage Log
      </Title>
      <Text c="dimmed" mb="lg">
        Please review the information before generating your log
      </Text>
      
      {/* Review Details Section */}
      <Paper p="md" withBorder radius="md">
        <Stack gap="md">
          <Group>
            <Text fw={500} w={180}>
              Vehicle:
            </Text>
            <Text>
              {/* Display formatted vehicle string */}
              {form.values.vehicleYear} {displayVehicleMake} {displayVehicleModel}
            </Text>
          </Group>
          <Divider />

          <Group>
            <Text fw={500} w={180}>
              Date Range:
            </Text>
            <Text>
              {form.values.startDate?.toLocaleDateString()} to {form.values.endDate?.toLocaleDateString()}
            </Text>
          </Group>
          <Divider />

          <Group>
            <Text fw={500} w={180}>
              Odometer Readings:
            </Text>
            <Text>
              {form.values.startMileage} to {form.values.endMileage} ({totalMiles} total miles)
            </Text>
          </Group>
          <Divider />

          <Group>
            <Text fw={500} w={180}>
              Business Type:
            </Text>
            <Text>{form.values.businessType || "Not specified"}</Text>
          </Group>
          <Divider />

          <Group>
            <Text fw={500} w={180}>
              Miles Breakdown:
            </Text>
            <Stack gap="xs">
              <Text>Business Miles: {businessMiles}</Text>
              <Text>Personal Miles: {form.values.totalPersonalMiles || 0}</Text>
              <Text>Total Miles: {totalMiles}</Text>
            </Stack>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
