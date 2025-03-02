"use client";

import {
  Group,
  Table,
  Text,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  Stack,
  Card,
  Box,
  ScrollArea,
  Title,
  Divider,
  Button,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCar,
  IconCalendar,
  IconRoad,
  IconBriefcase,
  IconHome,
  IconGauge,
  IconCoin,
  IconReceipt,
} from "@tabler/icons-react";

import { useMediaQuery } from "@mantine/hooks";
import type { MileageEntry } from "@/types/mileage";

interface MileageLogDisplayProps {
  startDate: Date;
  endDate: Date;
  totalMileage: number;
  totalBusinessMiles: number;
  totalPersonalMiles: number;
  startMileage: number;
  endMileage: number;
  businessDeductionRate?: number;
  businessDeductionAmount?: number;
  vehicleInfo?: {
    name: string;
  };
  mileageLog: MileageEntry[];
  logId?: string;
  userId?: string;
}

export function MileageLogDisplay({
  startDate,
  endDate,
  totalMileage,
  totalBusinessMiles,
  totalPersonalMiles,
  startMileage,
  endMileage,
  businessDeductionRate,
  businessDeductionAmount,
  vehicleInfo,
  mileageLog,
  logId,
  userId,
}: MileageLogDisplayProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  console.log("MileageLogDisplay props:", {
    startDate,
    endDate,
    totalMileage,
    totalBusinessMiles,
    totalPersonalMiles,
    startMileage,
    endMileage,
    businessDeductionRate,
    businessDeductionAmount,
    vehicleInfo,
    mileageLogLength: mileageLog.length,
  });

  if (mileageLog.length > 0) {
    console.log("First mileage log entry:", mileageLog[0]);
    console.log("First entry types:", {
      startMileage: typeof mileageLog[0].startMileage,
      endMileage: typeof mileageLog[0].endMileage,
      totalMiles: typeof mileageLog[0].totalMiles,
      personalMiles: typeof mileageLog[0].personalMiles,
      businessMiles: typeof mileageLog[0].businessMiles,
    });
  }

  const MobileLogEntry = ({ entry }: { entry: MileageEntry }) => (
    <Card shadow="sm" p="md" radius="md" withBorder mb="sm">
      <Text fw={700} mb="xs">
        {new Date(entry.date).toLocaleDateString()}
      </Text>
      <Stack gap="xs">
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Vehicle:
          </Text>
          <Text size="sm">{entry.vehicle}</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Starting Mileage:
          </Text>
          <Text size="sm">{entry.startMileage}</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Ending Mileage:
          </Text>
          <Text size="sm">{entry.endMileage}</Text>
        </Group>
        <Divider my="xs" />
        <Text size="sm" c="dimmed">
          Location:
        </Text>
        <Text size="sm">{entry.location}</Text>
        <Text size="sm" c="dimmed" mt="xs">
          Business Purpose:
        </Text>
        <Text size="sm">{entry.businessPurpose}</Text>
        <Divider my="xs" />
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Total Miles:
          </Text>
          <Text size="sm">{entry.totalMiles} miles</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Business Miles:
          </Text>
          <Text size="sm">{entry.businessMiles} miles</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Personal Miles:
          </Text>
          <Text size="sm">{entry.personalMiles} miles</Text>
        </Group>
      </Stack>
    </Card>
  );

  return (
    <Stack gap={isMobile ? "md" : 5}>
      <Group justify="space-between" align="flex-start">
        {isMobile ? (
          <Paper p="md" radius="sm" withBorder shadow="xs" w="100%">
            <Stack gap="xs">
              <Title order={4} mb="sm">
                Summary
              </Title>

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Vehicle:
                </Text>
                <Text fw={600}>{vehicleInfo?.name || "Not specified"}</Text>
              </Group>

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Period:
                </Text>
                <Text fw={600}>
                  {startDate.toLocaleDateString()} -{" "}
                  {endDate.toLocaleDateString()}
                </Text>
              </Group>

              <Divider my="xs" label="Odometer" labelPosition="center" />

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Starting Odometer:
                </Text>
                <Text fw={600}>{startMileage}</Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Ending Odometer:
                </Text>
                <Text fw={600}>{endMileage}</Text>
              </Group>

              <Divider my="xs" label="Mileage" labelPosition="center" />

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Total Mileage:
                </Text>
                <Text fw={600}>{totalMileage} miles</Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Business Miles:
                </Text>
                <Text fw={600} c="blue">
                  {totalBusinessMiles} miles
                </Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Personal Miles:
                </Text>
                <Text fw={600}>{totalPersonalMiles} miles</Text>
              </Group>

              <Divider my="xs" label="Tax Deduction" labelPosition="center" />

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Business Deduction Rate:
                </Text>
                <Text fw={600}>
                  ${businessDeductionRate?.toFixed(2) || "0.00"}/mile
                </Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Business Deduction Amount:
                </Text>
                <Text fw={700} c="green">
                  ${businessDeductionAmount?.toFixed(2) || "0.00"}
                </Text>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <Paper p="lg" radius="sm" withBorder shadow="xs" w="100%">
            <Title order={4} mb="md">
              Summary
            </Title>
            <Divider mb="md" />

            <Group grow align="flex-start" gap="xs">
              <Stack gap="md">
                <Group>
                  <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                    <IconCar size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Vehicle
                    </Text>
                    <Text fw={600}>{vehicleInfo?.name || "Not specified"}</Text>
                  </Stack>
                </Group>

                <Group>
                  <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                    <IconCalendar size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Period
                    </Text>
                    <Text fw={600}>
                      {startDate.toLocaleDateString()} -{" "}
                      {endDate.toLocaleDateString()}
                    </Text>
                  </Stack>
                </Group>
                <Group>
                  <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                    <IconRoad size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Total Mileage
                    </Text>
                    <Text fw={600}>{totalMileage} miles</Text>
                  </Stack>
                </Group>
              </Stack>

              <Stack gap="md">
                <Group>
                  <ThemeIcon size="md" variant="light" color="cyan" radius="xl">
                    <IconGauge size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Odometer Reading
                    </Text>
                    <Text fw={600}>
                      {startMileage} → {endMileage}
                    </Text>
                  </Stack>
                </Group>
                <Group>
                  <ThemeIcon size="md" variant="light" color="gray" radius="xl">
                    <IconHome size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Personal Miles
                    </Text>
                    <Text fw={600}>{totalPersonalMiles} miles</Text>
                  </Stack>
                </Group>
                <Group>
                  <ThemeIcon
                    size="md"
                    variant="light"
                    color="green"
                    radius="xl"
                  >
                    <IconBriefcase size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Business Miles
                    </Text>
                    <Text fw={600}>{totalBusinessMiles} miles</Text>
                  </Stack>
                </Group>
              </Stack>

              <Stack gap="md">
                <Group>
                  <ThemeIcon
                    size="md"
                    variant="light"
                    color="yellow"
                    radius="xl"
                  >
                    <IconCoin size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Deduction Rate
                    </Text>
                    <Text fw={600}>
                      ${businessDeductionRate?.toFixed(2) || "0.00"}/mile
                    </Text>
                  </Stack>
                </Group>
                <Group>
                  <ThemeIcon
                    size="md"
                    variant="light"
                    color="green"
                    radius="xl"
                  >
                    <IconReceipt size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Tax Deduction
                    </Text>
                    <Text fw={700} size="lg" c="green">
                      ${businessDeductionAmount?.toFixed(2) || "0.00"}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Group>
          </Paper>
        )}
      </Group>

      {isMobile ? (
        <Box>
          <Title order={3} size="h4" mb="md">
            Mileage Log Entries
          </Title>
          <Stack>
            {mileageLog.map((entry) => (
              <MobileLogEntry key={entry.date.toString()} entry={entry} />
            ))}
          </Stack>
        </Box>
      ) : (
        <ScrollArea>
          <Table striped highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh>Date</TableTh>
                <TableTh>Vehicle</TableTh>
                <TableTh>Odometer Start</TableTh>
                <TableTh>Odometer End</TableTh>
                <TableTh>Total Miles</TableTh>
                <TableTh>Business Miles</TableTh>
                <TableTh>Personal Miles</TableTh>
                <TableTh>Location</TableTh>
                <TableTh>Purpose</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {mileageLog.map((entry) => (
                <TableTr key={entry.date.toString()}>
                  <TableTd>{new Date(entry.date).toLocaleDateString()}</TableTd>
                  <TableTd>{entry.vehicle}</TableTd>
                  <TableTd>{entry.startMileage}</TableTd>
                  <TableTd>{entry.endMileage}</TableTd>
                  <TableTd>{entry.totalMiles}</TableTd>
                  <TableTd>{entry.businessMiles}</TableTd>
                  <TableTd>{entry.personalMiles}</TableTd>
                  <TableTd>{entry.location}</TableTd>
                  <TableTd>{entry.businessPurpose}</TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </ScrollArea>
      )}
    </Stack>
  );
}
