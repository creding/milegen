"use client";

import {
  Group,
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
  Paper,
  ThemeIcon,
  Table,
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
import type { MileageEntry } from "@/app/actions/mileageGenerator";
import { getRandomBusinessPurpose } from "@/utils/mileageUtils";

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
  vehicleInfo: string;
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
          <Text size="sm">{entry.vehicle_info || vehicleInfo}</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Starting Mileage:
          </Text>
          <Text size="sm">{parseFloat(entry.start_mileage.toFixed(1))}</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Ending Mileage:
          </Text>
          <Text size="sm">{parseFloat(entry.end_mileage.toFixed(1))}</Text>
        </Group>
        <Divider my="xs" />
        <Text size="sm" c="dimmed" mt="xs">
          Purpose:
        </Text>
        <Text size="sm">{entry.purpose}</Text>
        <Divider my="xs" />
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Total Miles:
          </Text>
          <Text size="sm">{parseFloat(entry.miles.toFixed(1))} miles</Text>
        </Group>
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Type:
          </Text>
          <Text size="sm">{entry.type}</Text>
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
                <Text fw={600}>{vehicleInfo || "Not specified"}</Text>
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
                <Text fw={600}>{parseFloat(startMileage.toFixed(1))}</Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Ending Odometer:
                </Text>
                <Text fw={600}>{parseFloat(endMileage.toFixed(1))}</Text>
              </Group>

              <Divider my="xs" label="Mileage" labelPosition="center" />

              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Total Mileage:
                </Text>
                <Text fw={600}>
                  {parseFloat(totalMileage.toFixed(1))} miles
                </Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Business Mileage:
                </Text>
                <Text fw={600}>
                  {parseFloat(totalBusinessMiles.toFixed(1))} miles
                </Text>
              </Group>
              <Group justify="apart">
                <Text fw={500} c="dimmed">
                  Personal Mileage:
                </Text>
                <Text fw={600}>
                  {parseFloat(totalPersonalMiles.toFixed(1))} miles
                </Text>
              </Group>

              {businessDeductionRate && businessDeductionAmount && (
                <>
                  <Divider
                    my="xs"
                    label="Tax Deduction"
                    labelPosition="center"
                  />
                  <Group justify="apart">
                    <Text fw={500} c="dimmed">
                      Rate:
                    </Text>
                    <Text fw={600}>
                      ${businessDeductionRate.toFixed(2)}/mile
                    </Text>
                  </Group>
                  <Group justify="apart">
                    <Text fw={500} c="dimmed">
                      Deduction:
                    </Text>
                    <Text fw={600}>${businessDeductionAmount.toFixed(2)}</Text>
                  </Group>
                </>
              )}
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
                    <Text fw={600}>{vehicleInfo || "Not specified"}</Text>
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
                    <Text fw={600}>
                      {parseFloat(totalMileage.toFixed(1))} miles
                    </Text>
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
                      {parseFloat(startMileage.toFixed(1))} →{" "}
                      {parseFloat(endMileage.toFixed(1))}
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
                    <Text fw={600}>
                      {parseFloat(totalPersonalMiles.toFixed(1))} miles
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
                    <IconBriefcase size="1rem" />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Business Miles
                    </Text>
                    <Text fw={600}>
                      {parseFloat(totalBusinessMiles.toFixed(1))} miles
                    </Text>
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
        <Stack>
          {mileageLog.map((entry, index) => (
            <MobileLogEntry key={index} entry={entry} />
          ))}
        </Stack>
      ) : (
        <ScrollArea>
          <Box maw="100%">
            <Table striped highlightOnHover withTableBorder>
              <TableThead>
                <TableTr>
                  <TableTh>Date</TableTh>
                  <TableTh>Vehicle</TableTh>
                  <TableTh>Start</TableTh>
                  <TableTh>End</TableTh>
                  <TableTh>Miles</TableTh>
                  <TableTh>Purpose</TableTh>
                  <TableTh>Type</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {mileageLog.map((entry, index) => (
                  <TableTr key={index}>
                    <TableTd>
                      {new Date(entry.date).toLocaleDateString()}
                    </TableTd>
                    <TableTd>{entry.vehicle_info || vehicleInfo}</TableTd>
                    <TableTd>
                      {parseFloat(entry.start_mileage.toFixed(1))}
                    </TableTd>
                    <TableTd>
                      {parseFloat(entry.end_mileage.toFixed(1))}
                    </TableTd>
                    <TableTd>{parseFloat(entry.miles.toFixed(1))}</TableTd>
                    <TableTd>{entry.purpose}</TableTd>
                    <TableTd>{entry.type}</TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </ScrollArea>
      )}
    </Stack>
  );
}
