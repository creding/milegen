// components/milagelog/steps/DateRangeStep.tsx
import React from 'react';
import { Box, Title, Text, Stack, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { CustomInputWrapper } from '@/components/form/CustomInputWrapper';
import { UseFormReturnType } from '@mantine/form';
import { FormValues } from '@/types/form_values';

interface DateRangeStepProps {
  form: UseFormReturnType<FormValues>;
  isMobile: boolean;
}

export function DateRangeStep({ 
  form, 
  isMobile 
}: DateRangeStepProps) {
  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Date Range
      </Title>
      <Text c="dimmed" mb="lg">
        Select the start and end dates for your mileage log
      </Text>
      
      {/* Date Picker Section */}
      <Stack gap="md">
        {isMobile ? (
          <Stack>
            <CustomInputWrapper
              label="Start Date"
              required
              error={form.errors.startDate}
            >
              <DatePickerInput
                placeholder="Select start date"
                {...form.getInputProps('startDate')} // Use getInputProps
                error={null} // Hide default error
              />
            </CustomInputWrapper>
            <CustomInputWrapper
              label="End Date"
              required
              error={form.errors.endDate}
            >
              <DatePickerInput
                placeholder="Select end date"
                {...form.getInputProps('endDate')} // Use getInputProps
                minDate={form.values.startDate || undefined} // Use form value for minDate
                error={null} // Hide default error
              />
            </CustomInputWrapper>
          </Stack>
        ) : (
          <Group grow>
            <CustomInputWrapper
              label="Start Date"
              required
              error={form.errors.startDate}
            >
              <DatePickerInput
                placeholder="Select start date"
                {...form.getInputProps('startDate')} // Use getInputProps
                error={null} // Hide default error
              />
            </CustomInputWrapper>
            <CustomInputWrapper
              label="End Date"
              required
              error={form.errors.endDate}
            >
              <DatePickerInput
                placeholder="Select end date"
                {...form.getInputProps('endDate')} // Use getInputProps
                minDate={form.values.startDate || undefined} // Use form value for minDate
                error={null} // Hide default error
              />
            </CustomInputWrapper>
          </Group>
        )}
      </Stack>
    </Box>
  );
}
