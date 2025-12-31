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
  Box,
  ScrollArea,
  Title,
  Divider,
  Paper,
  ThemeIcon,
  Table,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { ProCard } from "@/components/ui/ProCard";
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
import type { MileageEntry, MileageLog } from "@/app/actions/mileageGenerator";
import { DownloadSpreadsheet } from "./DownloadSpreadsheet";
import { PrintMilageLog } from "./PrintMilageLog";
import { GeneratePDF } from "./GeneratePDF";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";

export function MileageLogDisplay({
  log,
  subscriptionStatus,
}: {
  log: MileageLog;
  subscriptionStatus?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  if (log.log_entries.length > 0) {
    console.log("First mileage log entry:", log.log_entries[0]);
  }

  const MobileLogEntry = ({ entry }: { entry: MileageEntry }) => (
    <ProCard p="sm" mb="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={700} size="sm">
          {new Date(entry.date).toLocaleDateString()}
        </Text>
        <Badge
          size="sm"
          variant={entry.type === "Business" ? "filled" : "light"}
          color={entry.type === "Business" ? "teal" : "gray"}
        >
          {entry.type}
        </Badge>
      </Group>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Miles
          </Text>
          <Text size="sm" fw={500}>
            {parseFloat(entry.miles.toFixed(1))}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Purpose
          </Text>
          <Text size="sm" style={{ textAlign: "right", maxWidth: "200px" }}>
            {entry.purpose}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Odometer
          </Text>
          <Text size="xs">
            {parseFloat(entry.start_mileage.toFixed(1))} →{" "}
            {parseFloat(entry.end_mileage.toFixed(1))}
          </Text>
        </Group>
      </Stack>
    </ProCard>
  );

  return (
    <Stack gap={isMobile ? "md" : 5}>
      {subscriptionStatus !== "active" && <SubscriptionAlert />}
      {isMobile ? (
        <ProCard p="sm" w="100%">
          <Stack gap="xs">
            {subscriptionStatus === "active" && (
              <Stack justify="flex-start">
                <DownloadSpreadsheet log={log} />
                <PrintMilageLog log={log} />
                <GeneratePDF log={log} />
              </Stack>
            )}

            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Vehicle:
              </Text>
              <Text fw={600}>{log.vehicle_info || "Not specified"}</Text>
            </Group>

            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Period:
              </Text>
              <Text fw={600}>
                {log.start_date} - {log.end_date}
              </Text>
            </Group>

            <Divider my="xs" label="Odometer" labelPosition="center" />

            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Starting Odometer:
              </Text>
              <Text fw={600}>{parseFloat(log.start_mileage.toFixed(1))}</Text>
            </Group>
            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Ending Odometer:
              </Text>
              <Text fw={600}>{parseFloat(log.end_mileage.toFixed(1))}</Text>
            </Group>

            <Divider my="xs" label="Mileage" labelPosition="center" />

            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Total Mileage:
              </Text>
              <Text fw={600}>
                {parseFloat(log.total_mileage.toFixed(1))} miles
              </Text>
            </Group>
            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Business Mileage:
              </Text>
              <Text fw={600}>
                {parseFloat(log.total_business_miles.toFixed(1))} miles
              </Text>
            </Group>
            <Group justify="apart">
              <Text fw={500} c="dimmed">
                Personal Mileage:
              </Text>
              <Text fw={600}>
                {parseFloat(log.total_personal_miles.toFixed(1))} miles
              </Text>
            </Group>

            {log.business_deduction_rate && log.business_deduction_amount && (
              <>
                <Divider my="xs" label="Tax Deduction" labelPosition="center" />
                <Group justify="apart">
                  <Text fw={500} c="dimmed">
                    Rate:
                  </Text>
                  <Text fw={600}>
                    ${log.business_deduction_rate.toFixed(2)}/mile
                  </Text>
                </Group>
                <Group justify="apart">
                  <Text fw={500} c="dimmed">
                    Deduction:
                  </Text>
                  <Text fw={600}>
                    ${log.business_deduction_amount.toFixed(2)}
                  </Text>
                </Group>
              </>
            )}
          </Stack>
        </ProCard>
      ) : (
        <>
          <ProCard p="xl" w="100%">
            <Group justify="flex-end" mb="xl" gap="xs">
              {subscriptionStatus === "active" && (
                <Group justify="flex-start">
                  <DownloadSpreadsheet log={log} />
                  <GeneratePDF log={log} />
                  <PrintMilageLog log={log} />
                </Group>
              )}
            </Group>
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
                    <Text fw={600}>{log.vehicle_info || "Not specified"}</Text>
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
                      {log.start_date} - {log.end_date}
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
                      {parseFloat(log.total_mileage.toFixed(1))} miles
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
                      {parseFloat(log.start_mileage.toFixed(1))} →{" "}
                      {parseFloat(log.end_mileage.toFixed(1))}
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
                      {parseFloat(log.total_personal_miles.toFixed(1))} miles
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
                      {parseFloat(log.total_business_miles.toFixed(1))} miles
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
                      ${log.business_deduction_rate?.toFixed(2) || "0.00"}
                      /mile
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
                      ${log.business_deduction_amount?.toFixed(2) || "0.00"}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Group>
          </ProCard>
        </>
      )}

      {isMobile ? (
        <Stack>
          {log.log_entries.map((entry, index) => (
            <MobileLogEntry key={index} entry={entry} />
          ))}
        </Stack>
      ) : (
        <Paper p="xl" radius="sm" withBorder shadow="sm" w="100%" bg="white">
          <Group justify="space-between" mb="lg">
            <Title order={4} fw={600}>
              Detailed Log Entries
            </Title>
            <Badge variant="light" size="lg" color="gray">
              {log.log_entries.length} entries
            </Badge>
          </Group>
          <ScrollArea>
            <Box maw="100%" w="100%">
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                styles={{
                  th: { backgroundColor: "#f8fafc", color: "#64748b" },
                  td: { fontSize: "14px" },
                }}
              >
                <TableThead>
                  <TableTr>
                    <TableTh>Date</TableTh>
                    <TableTh>Vehicle</TableTh>
                    <TableTh>Start</TableTh>
                    <TableTh>End</TableTh>
                    <TableTh>Total Miles</TableTh>
                    <TableTh>Purpose</TableTh>
                    <TableTh>Type</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {log.log_entries.map((entry, index) => (
                    <TableTr key={index}>
                      <TableTd>
                        {new Date(entry.date).toLocaleDateString()}
                      </TableTd>
                      <TableTd>
                        {entry.vehicle_info || log.vehicle_info}
                      </TableTd>
                      <TableTd>
                        {parseFloat(entry.start_mileage.toFixed(1))}
                      </TableTd>
                      <TableTd>
                        {parseFloat(entry.end_mileage.toFixed(1))}
                      </TableTd>
                      <TableTd fw={600}>
                        {parseFloat(entry.miles.toFixed(1))}
                      </TableTd>
                      <TableTd>{entry.purpose}</TableTd>
                      <TableTd>
                        <Badge
                          size="sm"
                          variant={
                            entry.type === "Business" ? "dot" : "outline"
                          }
                          color={entry.type === "Business" ? "teal" : "gray"}
                        >
                          {entry.type}
                        </Badge>
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>
          </ScrollArea>
        </Paper>
      )}
    </Stack>
  );
}
