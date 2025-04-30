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
  Select,
  Pagination,
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
import { format, parseISO } from 'date-fns';

import { useMediaQuery } from "@mantine/hooks";
import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { MileageEntry, MileageLog } from "@/app/actions/mileageGenerator";
import { DownloadSpreadsheet } from "./DownloadSpreadsheet";
import { PrintMilageLog } from "./PrintMilageLog";
import { GeneratePDF } from "./GeneratePDF";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";

export function MileageLogDisplay({
  log,
  subscriptionStatus,
}: {
  log: MileageLog & {
    pagination?: {
      currentPage: number;
      pageSize: number;
      totalEntries: number;
      totalPages: number;
    };
  };
  subscriptionStatus?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoize entries to avoid unnecessary re-renders
  const entries = useMemo(() => log.log_entries || [], [log.log_entries]);
  const pagination = log.pagination;

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newSize.toString());
    params.set('page', '1'); // Reset to first page when changing page size
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper function to get vehicle info for an entry
const getVehicleInfo = (entry: MileageEntry) => {
  // During migration, entry.vehicle_info might be undefined
  return entry.vehicle_info || log.vehicle_info || "Not specified";
};

const MobileLogEntry = ({ entry }: { entry: MileageEntry }) => (
    <Card shadow="sm" p="md" radius="md" withBorder mb="sm">
      <Text fw={700} mb="xs">
        {typeof entry.date === 'string'
          ? format(parseISO(entry.date), 'MM/dd/yyyy')
          : format(entry.date, 'MM/dd/yyyy')}
      </Text>
      <Stack gap="xs">
        <Group justify="apart">
          <Text size="sm" c="dimmed">
            Vehicle:
          </Text>
          <Text size="sm">{getVehicleInfo(entry)}</Text>
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

  // Pagination controls component
  const PaginationControls = () => {
    if (!pagination) return null;

    const { currentPage, totalPages, pageSize, totalEntries } = pagination;
    const pageSizeOptions = [10, 25, 50, 100].map(size => ({ value: size.toString(), label: size.toString() }));

    return (
      <Paper p="md" withBorder mt="md">
        <Group justify="space-between" align="center">
          <Group>
            <Text size="sm" c="dimmed">Show</Text>
            <Select
              value={pageSize.toString()}
              onChange={(value) => handlePageSizeChange(parseInt(value || '25'))}
              data={pageSizeOptions}
              w={80}
            />
            <Text size="sm" c="dimmed">entries per page</Text>
          </Group>
          
          <Group>
            <Text size="sm" c="dimmed">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
            </Text>
            <Pagination
              value={currentPage}
              onChange={handlePageChange}
              total={totalPages}
              size={isMobile ? 'sm' : 'md'}
              radius="md"
              withEdges
            />
          </Group>
        </Group>
      </Paper>
    );
  };

  return (
    <Stack gap={isMobile ? "md" : 5}>
      {subscriptionStatus !== "active" && <SubscriptionAlert />}
      
      {/* Add pagination controls at the top */}
      <PaginationControls />
      
      {isMobile ? (
        <Paper p="md" radius="sm" withBorder shadow="xs" w="100%">
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
                {format(parseISO(log.start_date), 'MM/dd/yyyy')} - {format(parseISO(log.end_date), 'MM/dd/yyyy')}
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
        </Paper>
      ) : (
        <>
          <Paper p="lg" radius="sm" withBorder shadow="xs" w="100%">
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
                      {format(parseISO(log.start_date), 'MM/dd/yyyy')} - {format(parseISO(log.end_date), 'MM/dd/yyyy')}
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
          </Paper>
        </>
      )}

      {isMobile ? (
        <Stack>
          {entries.map((entry, index) => (
            <MobileLogEntry key={index} entry={entry} />
          ))}
        </Stack>
      ) : (
        <Paper p="lg" radius="sm" withBorder shadow="xs" w="100%">
          <Title order={4} mb="md">
            Mileage Log Entries
          </Title>
          <Divider mb="md" />
          <ScrollArea>
            <Box maw="100%" w="100%">
              <Table striped highlightOnHover withTableBorder w="100%">
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
                  {entries.map((entry, index) => (
                    <TableTr key={index}>
                      <TableTd>
                        {typeof entry.date === 'string'
                          ? format(parseISO(entry.date), 'MM/dd/yyyy')
                          : format(entry.date, 'MM/dd/yyyy')}
                      </TableTd>
                      <TableTd>
                        {getVehicleInfo(entry)}
                      </TableTd>
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
          
          {/* Add pagination controls at the bottom */}
          <PaginationControls />
        </Paper>
      )}
    </Stack>
  );
}
