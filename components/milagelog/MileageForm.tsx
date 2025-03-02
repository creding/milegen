"use client";

import { DatePickerInput } from "@mantine/dates";
import {
  TextInput,
  Textarea,
  Alert,
  Group,
  Button,
  Stack,
  Box,
  Text,
  Flex,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useForm, isNotEmpty } from "@mantine/form";
import { CustomInputWrapper } from "../form/CustomInputWrapper";

interface MileageFormProps {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  destination: string;
  businessPurpose: string;
  subscriptionStatus: string;
  entryCount: number;
  onStartMileageChange: (value: string) => void;
  onEndMileageChange: (value: string) => void;
  onStartDateChange: (value: Date) => void;
  onEndDateChange: (value: Date) => void;
  onTotalPersonalMilesChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onBusinessPurposeChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

interface FormValues {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  destination: string;
  businessPurpose: string;
}

const MAX_FREE_ENTRIES = 5;

export function MileageForm({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  destination,
  businessPurpose,
  subscriptionStatus,
  entryCount,
  onStartMileageChange,
  onEndMileageChange,
  onStartDateChange,
  onEndDateChange,
  onTotalPersonalMilesChange,
  onDestinationChange,
  onBusinessPurposeChange,
  onGenerate,
  onReset,
}: MileageFormProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const form = useForm<FormValues>({
    initialValues: {
      startMileage,
      endMileage,
      startDate,
      endDate,
      totalPersonalMiles,
      destination,
      businessPurpose,
    },
    validate: {
      startMileage: (value: string) => {
        if (!isNotEmpty(value)) return "Starting mileage is required";
        if (!/^\d+$/.test(value)) return "Must be a number";
        return null;
      },
      endMileage: (value: string, values: FormValues) => {
        if (!isNotEmpty(value)) return "Ending mileage is required";
        if (!/^\d+$/.test(value)) return "Must be a number";
        if (parseInt(value) <= parseInt(values.startMileage))
          return "Must be greater than starting mileage";
        return null;
      },
      totalPersonalMiles: (value: string, values: FormValues) => {
        if (!isNotEmpty(value)) return "Personal miles is required";
        if (!/^\d+$/.test(value)) return "Must be a number";
        const totalMiles =
          parseInt(values.endMileage) - parseInt(values.startMileage);
        if (parseInt(value) > totalMiles) return "Cannot exceed total mileage";
        return null;
      },
      destination: isNotEmpty("Destination is required"),
      businessPurpose: isNotEmpty("Business purpose is required"),
    },
  });

  // Sync form values with parent component
  const handleFormChange = (values: FormValues) => {
    onStartMileageChange(values.startMileage);
    onEndMileageChange(values.endMileage);
    onTotalPersonalMilesChange(values.totalPersonalMiles);
    onDestinationChange(values.destination);
    onBusinessPurposeChange(values.businessPurpose);
  };

  // Handle date changes separately since they're not string values
  const handleStartDateChange = (date: Date) => {
    form.setFieldValue("startDate", date);
    onStartDateChange(date);
  };

  const handleEndDateChange = (date: Date) => {
    form.setFieldValue("endDate", date);
    onEndDateChange(date);
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      onGenerate();
    }
  };

  const handleReset = () => {
    form.reset();
    onReset();
  };

  return (
    <Box p="md">
      {subscriptionStatus !== "active" && entryCount >= MAX_FREE_ENTRIES && (
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          title="Subscription Required"
          color="yellow"
          mb="md"
        >
          You have reached the maximum number of free entries. Please subscribe
          to generate more mileage logs.
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={isMobile ? "xs" : "md"}>
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

          {isMobile ? (
            <Stack>
              <CustomInputWrapper
                label="Start Date"
                required
                error={form.errors.startDate}
              >
                <DatePickerInput
                  placeholder="Select start date"
                  value={startDate}
                  onChange={(date) => date && handleStartDateChange(date)}
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
                  value={endDate}
                  onChange={(date) => date && handleEndDateChange(date)}
                  minDate={startDate}
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
                  value={startDate}
                  onChange={(date) => date && handleStartDateChange(date)}
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
                  value={endDate}
                  onChange={(date) => date && handleEndDateChange(date)}
                  minDate={startDate}
                  error={null} // Hide default error
                />
              </CustomInputWrapper>
            </Group>
          )}

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

          <CustomInputWrapper
            label="Destination"
            required
            error={form.errors.destination}
          >
            <TextInput
              placeholder="Enter common destination"
              {...form.getInputProps("destination")}
              onChange={(e) => {
                form.setFieldValue("destination", e.target.value);
                onDestinationChange(e.target.value);
              }}
              error={null} // Hide default error
            />
          </CustomInputWrapper>

          <CustomInputWrapper
            label="Business Purpose"
            required
            error={form.errors.businessPurpose}
          >
            <Textarea
              placeholder="Enter business purpose"
              rows={isMobile ? 3 : 4}
              {...form.getInputProps("businessPurpose")}
              onChange={(e) => {
                form.setFieldValue("businessPurpose", e.target.value);
                onBusinessPurposeChange(e.target.value);
              }}
              error={null} // Hide default error
            />
          </CustomInputWrapper>

          {isMobile ? (
            <Stack gap="xs" mt="sm">
              <Button
                variant="gradient"
                type="submit"
                disabled={
                  subscriptionStatus !== "active" &&
                  entryCount >= MAX_FREE_ENTRIES
                }
                fullWidth
                size="md"
              >
                Generate Log
              </Button>
              <Button
                onClick={handleReset}
                variant="light"
                color="gray"
                fullWidth
                size="md"
              >
                Reset
              </Button>
            </Stack>
          ) : (
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                color="gray"
                onClick={handleReset}
                size="md"
              >
                Reset
              </Button>
              <Button
                variant="gradient"
                type="submit"
                disabled={
                  subscriptionStatus !== "active" &&
                  entryCount >= MAX_FREE_ENTRIES
                }
                size="md"
              >
                Generate Log
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </Box>
  );
}
