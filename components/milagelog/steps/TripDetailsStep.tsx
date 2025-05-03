// components/milagelog/steps/TripDetailsStep.tsx
import React from 'react';
import { Box, Paper, Title, Text, Stack, TextInput, Select } from '@mantine/core';
import { CustomInputWrapper } from '@/components/form/CustomInputWrapper';
import { UseFormReturnType } from '@mantine/form';

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

interface TripDetailsStepProps {
  form: UseFormReturnType<FormValues>;
  businessTypeOptions: { value: string; label: string }[];
  onBusinessTypeChange: (value: string) => void;
  onTotalPersonalMilesChange: (value: string) => void;
}

export function TripDetailsStep({ 
  form, 
  businessTypeOptions, 
  onBusinessTypeChange, 
  onTotalPersonalMilesChange 
}: TripDetailsStepProps) {
  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Trip Details
      </Title>
      <Text c="dimmed" mb="lg">
        Specify your business type and personal miles
      </Text>
      
      {/* Business Information Section */}
      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} size="h5" mb="md">
          Business Information
        </Title>
        <CustomInputWrapper
          label="Business Type"
          description="Select your business type"
          error={form.errors.businessType}
          required
        >
          <Select
            placeholder="Select business type"
            data={businessTypeOptions}
            value={form.values.businessType}
            onChange={(value) => {
              form.setFieldValue("businessType", value || "");
              onBusinessTypeChange(value || "");
            }}
            searchable
            clearable
            error={null} // Hide default error
            comboboxProps={{ position: "bottom", withinPortal: true }}
            maxDropdownHeight={280}
          />
        </CustomInputWrapper>
      </Paper>

      {/* Personal Miles Section */}
      <Stack gap="md">
        <CustomInputWrapper
          label="Personal Miles"
          error={form.errors.totalPersonalMiles}
        >
          <TextInput
            placeholder="Enter personal miles"
            {...form.getInputProps("totalPersonalMiles")}
            onChange={(e) => {
              form.setFieldValue("totalPersonalMiles", e.target.value);
              onTotalPersonalMilesChange(e.target.value);
            }}
            error={null} // Hide default error
          />
        </CustomInputWrapper>
      </Stack>
    </Box>
  );
}
