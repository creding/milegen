"use client";

import { DatePickerInput } from "@mantine/dates";
import Link from "next/link";
import {
  Title,
  Text,
  Alert,
  TextInput,
  Textarea,
  Group,
  Button,
  Stack,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

interface MileageFormProps {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  destination: string;
  businessPurpose: string;
  subscriptionStatus: string | null;
  entryCount: number;
  onStartMileageChange: (value: string) => void;
  onEndMileageChange: (value: string) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onTotalPersonalMilesChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onBusinessPurposeChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

const MAX_FREE_ENTRIES = 10;

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
  return (
    <Stack>
      <Stack gap={2}>
        <Title order={2}>Generate Mileage Log with Milegen</Title>
        <Text c="dimmed" size="sm">
          Enter your mileage information for the selected date range
        </Text>
      </Stack>
      {subscriptionStatus !== "active" && (
        <Alert
          icon={<IconInfoCircle />}
          title="Unlock Full Mileage Log Features!"
          color="blue"
          mb="lg"
        >
          <Text mb="sm">
            Upgrade to our premium plan for unlimited entries, advanced
            customization, detailed reporting, and priority support.
          </Text>
          <Button
            component={Link}
            href="/subscribe"
            variant="filled"
            color="blue"
          >
            Upgrade Now for $9.99/Year
          </Button>
        </Alert>
      )}

      <Stack>
        <Group grow>
          <TextInput
            label="Starting Odometer Reading"
            type="number"
            value={startMileage}
            onChange={(e) => onStartMileageChange(e.target.value)}
            required
          />
          <TextInput
            label="Ending Odometer Reading"
            type="number"
            value={endMileage}
            onChange={(e) => onEndMileageChange(e.target.value)}
            required
          />
          <TextInput
            label="Total Personal Miles"
            type="number"
            value={totalPersonalMiles}
            onChange={(e) => onTotalPersonalMilesChange(e.target.value)}
            min={0}
            step="any"
            required
          />
        </Group>

        <Group grow>
          <DatePickerInput
            value={startDate}
            onChange={(date) => date && onStartDateChange(date)}
            maxDate={endDate}
            label="Start Date"
          />
          <DatePickerInput
            value={endDate}
            onChange={(date) => date && onEndDateChange(date)}
            minDate={startDate}
            label="End Date"
          />
        </Group>

        <TextInput
          label="Default Destination"
          placeholder="e.g., Client office, Job site"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
        />

        <Textarea
          label="Default Business Purpose"
          placeholder="e.g., Client meeting, Project work"
          value={businessPurpose}
          onChange={(e) => onBusinessPurposeChange(e.target.value)}
          rows={3}
        />

        <Group justify="space-between">
          <Button
            variant="gradient"
            onClick={onGenerate}
            disabled={
              subscriptionStatus !== "active" && entryCount >= MAX_FREE_ENTRIES
            }
          >
            Generate Log
          </Button>
          <Button onClick={onReset} variant="light" color="gray">
            Reset
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
