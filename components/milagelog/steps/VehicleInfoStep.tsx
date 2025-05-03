// components/milagelog/steps/VehicleInfoStep.tsx
import React from 'react';
import { Box, Paper, Title, Text, Stack, Group, TextInput, Select } from '@mantine/core';
import { CustomInputWrapper } from '@/components/form/CustomInputWrapper';
import { UseFormReturnType } from '@mantine/form';
import { VEHICLE_MAKES, VEHICLE_YEARS } from '@/utils/constants'; // Import constants

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

interface VehicleInfoStepProps {
  form: UseFormReturnType<FormValues>;
  isMobile: boolean;
  onStartMileageChange: (value: string) => void;
  onEndMileageChange: (value: string) => void;
  availableModels: { value: string; label: string }[];
  handleMakeChange: (value: string | null) => void;
  handleModelChange: (value: string | null) => void;
  handleYearChange: (value: string | null) => void;
}

export function VehicleInfoStep({ 
  form, 
  isMobile, 
  onStartMileageChange,
  onEndMileageChange,
  availableModels,
  handleMakeChange,
  handleModelChange,
  handleYearChange
}: VehicleInfoStepProps) {
  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Vehicle Information
      </Title>
      <Text c="dimmed" mb="lg">
        Enter your vehicle details and odometer readings
      </Text>
      
      {/* Odometer Readings Section */}
      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} size="h5" mb="md">
          Odometer Readings
        </Title>
        {isMobile ? (
          <Stack>
            <CustomInputWrapper
              label="Starting Odometer Reading"
              required
              error={form.errors.startMileage}
            >
              <TextInput
                placeholder="Enter starting mileage"
                {...form.getInputProps("startMileage")}
                onChange={(e) => {
                  form.setFieldValue("startMileage", e.target.value);
                  onStartMileageChange(e.target.value);
                }}
                error={null} // Hide default error
              />
            </CustomInputWrapper>
            <CustomInputWrapper
              label="Ending Odometer Reading"
              required
              error={form.errors.endMileage}
            >
              <TextInput
                placeholder="Enter ending mileage"
                {...form.getInputProps("endMileage")}
                onChange={(e) => {
                  form.setFieldValue("endMileage", e.target.value);
                  onEndMileageChange(e.target.value);
                }}
                error={null} // Hide default error
              />
            </CustomInputWrapper>
          </Stack>
        ) : (
          <Group grow>
            <CustomInputWrapper
              label="Starting Odometer Reading"
              required
              error={form.errors.startMileage}
            >
              <TextInput
                placeholder="Enter starting mileage"
                {...form.getInputProps("startMileage")}
                onChange={(e) => {
                  form.setFieldValue("startMileage", e.target.value);
                  onStartMileageChange(e.target.value);
                }}
                error={null} // Hide default error
              />
            </CustomInputWrapper>
            <CustomInputWrapper
              label="Ending Odometer Reading"
              required
              error={form.errors.endMileage}
            >
              <TextInput
                placeholder="Enter ending mileage"
                {...form.getInputProps("endMileage")}
                onChange={(e) => {
                  form.setFieldValue("endMileage", e.target.value);
                  onEndMileageChange(e.target.value);
                }}
                error={null} // Hide default error
              />
            </CustomInputWrapper>
          </Group>
        )}
      </Paper>

      {/* Vehicle Details Section */}
      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} size="h5" mb="md">
          Vehicle Details
        </Title>
        <Stack gap="md">
          <CustomInputWrapper
            label="Vehicle Make"
            description="Select the make of your vehicle"
            error={form.errors.vehicleMake}
            required
          >
            <Select
              placeholder="Select make"
              data={VEHICLE_MAKES} // Directly use imported constant
              value={form.values.vehicleMake}
              onChange={(value) => {
                form.setFieldValue("vehicleMake", value || "");
                handleMakeChange(value);
              }}
              searchable
              clearable
              error={null} // Hide default error
              comboboxProps={{ position: "bottom", withinPortal: true }}
              maxDropdownHeight={280}
            />
          </CustomInputWrapper>

          <CustomInputWrapper
            label="Vehicle Model"
            description="Select the model of your vehicle"
            error={form.errors.vehicleModel}
            required
          >
            <Select
              placeholder="Select model"
              data={availableModels}
              value={form.values.vehicleModel}
              onChange={(value) => {
                form.setFieldValue("vehicleModel", value || "");
                handleModelChange(value);
              }}
              searchable
              clearable
              disabled={!form.values.vehicleMake}
              error={null} // Hide default error
              comboboxProps={{ position: "bottom", withinPortal: true }}
              maxDropdownHeight={280}
            />
          </CustomInputWrapper>

          <CustomInputWrapper
            label="Vehicle Year"
            description="Select the year of your vehicle"
            error={form.errors.vehicleYear}
            required
          >
            <Select
              placeholder="Select year"
              data={VEHICLE_YEARS} // Directly use imported constant
              value={form.values.vehicleYear}
              onChange={(value) => {
                form.setFieldValue("vehicleYear", value || "");
                handleYearChange(value);
              }}
              searchable
              clearable
              error={null} // Hide default error
              comboboxProps={{ position: "bottom", withinPortal: true }}
              maxDropdownHeight={280}
            />
          </CustomInputWrapper>
        </Stack>
      </Paper>
    </Box>
  );
}
