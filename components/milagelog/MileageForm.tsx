"use client";

import { DatePickerInput } from "@mantine/dates";
import {
  TextInput,
  Group,
  Button,
  Stack,
  Box,
  Select,
  SimpleGrid,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useForm, isNotEmpty } from "@mantine/form";
import { CustomInputWrapper } from "../form/CustomInputWrapper";
import { BUSINESS_TYPES } from "@/utils/mileageUtils";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";

interface MileageFormProps {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  vehicle: string;
  businessType: string;
  subscriptionStatus: string;
  entryCount: number;
  onStartMileageChange: (value: string) => void;
  onEndMileageChange: (value: string) => void;
  onStartDateChange: (value: Date) => void;
  onEndDateChange: (value: Date) => void;
  onTotalPersonalMilesChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onBusinessTypeChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

interface FormValues {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  vehicle: string;
  businessType: string;
}

const MAX_FREE_ENTRIES = 5;

export function MileageForm({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  vehicle,
  businessType,
  subscriptionStatus,
  entryCount,
  onStartMileageChange,
  onEndMileageChange,
  onStartDateChange,
  onEndDateChange,
  onTotalPersonalMilesChange,
  onVehicleChange,
  onBusinessTypeChange,
  onGenerate,
  onReset,
}: MileageFormProps) {
  const form = useForm<FormValues>({
    initialValues: {
      startMileage,
      endMileage,
      startDate,
      endDate,
      totalPersonalMiles,
      vehicle,
      businessType,
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
      vehicle: isNotEmpty("Vehicle is required"),
      businessType: isNotEmpty("Business type is required"),
    },
  });

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

  // Create business type options for the select dropdown
  const businessTypeOptions = BUSINESS_TYPES.map((type) => ({
    value: type.name,
    label: type.name,
  }));

  return (
    <Box p="md">
      {subscriptionStatus !== "active" && <SubscriptionAlert mb="md" />}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <CustomInputWrapper
              label="Starting Odometer Reading"
              required
              error={form.errors.startMileage}
            >
              <TextInput
                placeholder="e.g. 15000"
                variant="filled"
                {...form.getInputProps("startMileage")}
                onChange={(e) => {
                  form.setFieldValue("startMileage", e.target.value);
                  onStartMileageChange(e.target.value);
                }}
                error={null}
              />
            </CustomInputWrapper>

            <CustomInputWrapper
              label="Ending Odometer Reading"
              required
              error={form.errors.endMileage}
            >
              <TextInput
                placeholder="e.g. 30000"
                variant="filled"
                {...form.getInputProps("endMileage")}
                onChange={(e) => {
                  form.setFieldValue("endMileage", e.target.value);
                  onEndMileageChange(e.target.value);
                }}
                error={null}
              />
            </CustomInputWrapper>

            <CustomInputWrapper
              label="Start Date"
              required
              error={form.errors.startDate}
            >
              <DatePickerInput
                placeholder="Select start date"
                variant="filled"
                value={startDate}
                onChange={(date) => date && handleStartDateChange(date)}
                error={null}
              />
            </CustomInputWrapper>

            <CustomInputWrapper
              label="End Date"
              required
              error={form.errors.endDate}
            >
              <DatePickerInput
                placeholder="Select end date"
                variant="filled"
                value={endDate}
                onChange={(date) => date && handleEndDateChange(date)}
                minDate={startDate}
                error={null}
              />
            </CustomInputWrapper>
          </SimpleGrid>

          <CustomInputWrapper
            label="Personal Miles"
            error={form.errors.totalPersonalMiles}
          >
            <TextInput
              placeholder="e.g. 200"
              variant="filled"
              {...form.getInputProps("totalPersonalMiles")}
              onChange={(e) => {
                form.setFieldValue("totalPersonalMiles", e.target.value);
                onTotalPersonalMilesChange(e.target.value);
              }}
              error={null} // Hide default error
            />
          </CustomInputWrapper>

          <CustomInputWrapper
            label="Business Type"
            required
            error={form.errors.businessType}
          >
            <Select
              placeholder="Select business type"
              variant="filled"
              data={businessTypeOptions}
              {...form.getInputProps("businessType")}
              onChange={(value) => {
                if (value) {
                  form.setFieldValue("businessType", value);
                  onBusinessTypeChange(value);
                }
              }}
              error={null} // Hide default error
            />
          </CustomInputWrapper>

          <CustomInputWrapper
            label="Vehicle"
            required
            error={form.errors.vehicle}
          >
            <TextInput
              placeholder="e.g. 2023 Tesla Model Y"
              variant="filled"
              {...form.getInputProps("vehicle")}
              onChange={(e) => {
                form.setFieldValue("vehicle", e.target.value);
                onVehicleChange(e.target.value);
              }}
              error={null} // Hide default error
            />
          </CustomInputWrapper>

          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={handleReset}>
              Reset Form
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: "teal", to: "cyan" }}
              type="submit"
              disabled={
                subscriptionStatus !== "active" &&
                entryCount >= MAX_FREE_ENTRIES
              }
              style={{ flexGrow: 0 }}
            >
              Generate Log
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
