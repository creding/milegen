// components/milagelog/steps/TripDetailsStep.tsx
import React from "react";
import {
  Box,
  Paper,
  Title,
  Text,
  Stack,
  TextInput,
  Select,
} from "@mantine/core";
import { CustomInputWrapper } from "@/components/form/CustomInputWrapper";
import { UseFormReturnType } from "@mantine/form";
import { FormValues } from "@/types/form_values";

interface TripDetailsStepProps {
  form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
  businessTypeOptions: { value: string; label: string }[];
}

export function TripDetailsStep({
  form,
  businessTypeOptions,
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
          error={form.errors.businessType}
          required
        >
          <Select
            placeholder="Select business type"
            data={businessTypeOptions}
            {...form.getInputProps("businessType")}
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
            error={null} // Hide default error
          />
        </CustomInputWrapper>
      </Stack>
    </Box>
  );
}
