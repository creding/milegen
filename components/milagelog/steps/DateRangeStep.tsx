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
  startDate: Date | null; // startDate state from parent
  handleStartDateChange: (date: Date) => void;
  endDate: Date | null; // endDate state from parent
  handleEndDateChange: (date: Date) => void;
}

export function DateRangeStep({ 
  form, 
  isMobile, 
  startDate, 
  handleStartDateChange, 
  endDate, 
  handleEndDateChange 
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
                value={startDate} // Use state variable for value
                onChange={(date) => date && handleStartDateChange(date)} // Update state via handler
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
                value={endDate} // Use state variable for value
                onChange={(date) => date && handleEndDateChange(date)} // Update state via handler
                minDate={startDate || undefined} // Use state variable for minDate
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
                value={startDate} // Use state variable for value
                onChange={(date) => date && handleStartDateChange(date)} // Update state via handler
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
                value={endDate} // Use state variable for value
                onChange={(date) => date && handleEndDateChange(date)} // Update state via handler
                minDate={startDate || undefined} // Use state variable for minDate
                error={null} // Hide default error
              />
            </CustomInputWrapper>
          </Group>
        )}
      </Stack>
    </Box>
  );
}
