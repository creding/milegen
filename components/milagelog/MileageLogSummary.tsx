"use client";
import React from 'react';
import {
  Card,
  Grid,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconCar,
  IconCalendar,
  IconRoute,
  IconGauge,
  IconHome,
  IconBriefcase,
  IconCoin,
  IconReceipt,
} from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { MileageLogWithEntries } from '@/types/index';

interface MileageLogSummaryProps {
  log: MileageLogWithEntries;
}

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to format miles
const formatMiles = (miles: number | null | undefined) => {
  if (miles == null) return 'N/A';
  return `${miles.toLocaleString()} miles`;
};

export function MileageLogSummary({ log }: MileageLogSummaryProps) {
  const startDate = log.start_date ? format(parseISO(log.start_date), 'yyyy-MM-dd') : 'N/A';
  const endDate = log.end_date ? format(parseISO(log.end_date), 'yyyy-MM-dd') : 'N/A';
  const period = `${startDate} - ${endDate}`;

  const totalMiles = log.total_mileage;
  const businessMiles = log.total_business_miles;
  const personalMiles = log.total_personal_miles;
  const taxDeduction = log.business_deduction_amount;

  const SummaryItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <Group wrap="nowrap" gap="xs">
      <ThemeIcon size="lg" variant="light" radius="md">
        {icon}
      </ThemeIcon>
      <Stack gap={0}>
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="sm" fw={500}>{value}</Text>
      </Stack>
    </Group>
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
      {/* Header Row */}
      <Group justify="flex-start" align="center" mb="lg">
        <Title order={3}>Mileage Log Summary</Title>
      </Group>

      {/* Details Grid */}
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Stack>
            <SummaryItem icon={<IconCar size={18} />} label="Vehicle" value={log.vehicle_info || 'N/A'} />
            <SummaryItem icon={<IconCalendar size={18} />} label="Period" value={period} />
            <SummaryItem icon={<IconRoute size={18} />} label="Total Mileage" value={formatMiles(totalMiles)} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Stack>
            <SummaryItem icon={<IconGauge size={18} />} label="Odometer Reading" value={`${log.start_mileage?.toLocaleString() ?? 'N/A'} → ${log.end_mileage?.toLocaleString() ?? 'N/A'}`} />
            <SummaryItem icon={<IconHome size={18} />} label="Personal Miles" value={formatMiles(personalMiles)} />
            <SummaryItem icon={<IconBriefcase size={18} />} label="Business Miles" value={formatMiles(businessMiles)} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <SummaryItem icon={<IconCoin size={18} />} label="Deduction Rate" value={`$${log.business_deduction_rate?.toFixed(2) ?? 'N/A'}/mile`} />
            <SummaryItem icon={<IconReceipt size={18} />} label="Tax Deduction" value={formatCurrency(taxDeduction)} />
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
