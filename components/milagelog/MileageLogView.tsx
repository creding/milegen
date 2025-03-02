"use client";

import {
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Stack,
  Text,
  Card,
  Group,
  Box,
  ScrollArea,
  Title,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { MileageEntry } from "@/types/mileage";

interface MileageLogViewProps {
  startDate: Date;
  endDate: Date;
  totalMileage: number;
  totalPersonalMiles: number;
  startMileage: number;
  endMileage: number;
  mileageLog: MileageEntry[];
}

export function MileageLogView({
  startDate,
  endDate,
  totalMileage,
  totalPersonalMiles,
  startMileage,
  endMileage,
  mileageLog,
}: MileageLogViewProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const MobileLogEntry = ({ entry }: { entry: MileageEntry }) => (
    <Card shadow="sm" p="md" radius="md" withBorder mb="sm">
      <Text fw={700} mb="xs">
        {new Date(entry.date).toLocaleDateString()}
      </Text>
      <Stack gap="xs">
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
          Destination:
        </Text>
        <Text size="sm">{entry.destination}</Text>
        <Text size="sm" c="dimmed" mt="xs">
          Business Purpose:
        </Text>
        <Text size="sm">{entry.businessPurpose}</Text>
      </Stack>
    </Card>
  );

  return (
    <div>
      <Card shadow="sm" p="md" radius="md" withBorder mb="md" bg="gray.0">
        <Title order={3} size="h4" mb="md">
          Mileage Log Summary
        </Title>
        {isMobile ? (
          <Stack>
            <Group justify="apart">
              <Text fw={500}>Start Date:</Text>
              <Text>{startDate.toLocaleDateString()}</Text>
            </Group>
            <Group justify="apart">
              <Text fw={500}>End Date:</Text>
              <Text>{endDate.toLocaleDateString()}</Text>
            </Group>
            <Group justify="apart">
              <Text fw={500}>Total Mileage:</Text>
              <Text>{totalMileage} miles</Text>
            </Group>
            <Group justify="apart">
              <Text fw={500}>Personal Miles:</Text>
              <Text>{totalPersonalMiles} miles</Text>
            </Group>
            <Group justify="apart">
              <Text fw={500}>Starting Odometer:</Text>
              <Text>{startMileage}</Text>
            </Group>
            <Group justify="apart">
              <Text fw={500}>Ending Odometer:</Text>
              <Text>{endMileage}</Text>
            </Group>
          </Stack>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Start Date:</strong> {startDate.toLocaleDateString()}
              </p>
              <p>
                <strong>End Date:</strong> {endDate.toLocaleDateString()}
              </p>
              <p>
                <strong>Total Mileage:</strong> {totalMileage} miles
              </p>
            </div>
            <div>
              <p>
                <strong>Personal Miles:</strong> {totalPersonalMiles} miles
              </p>
              <p>
                <strong>Starting Odometer:</strong> {startMileage}
              </p>
              <p>
                <strong>Ending Odometer:</strong> {endMileage}
              </p>
            </div>
          </div>
        )}
      </Card>

      {isMobile ? (
        <Box>
          <Title order={3} size="h4" mb="md">
            Mileage Log Entries
          </Title>
          <Stack>
            {mileageLog.map((entry) => (
              <MobileLogEntry key={entry.date} entry={entry} />
            ))}
          </Stack>
        </Box>
      ) : (
        <ScrollArea>
          <Box className="rounded-md border overflow-x-auto">
            <Table striped highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Date</TableTh>
                  <TableTh>Starting Mileage</TableTh>
                  <TableTh>Ending Mileage</TableTh>
                  <TableTh>Destination</TableTh>
                  <TableTh>Business Purpose</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {mileageLog.map((entry) => (
                  <TableTr key={entry.date}>
                    <TableTd>{new Date(entry.date).toLocaleDateString()}</TableTd>
                    <TableTd>{entry.startMileage}</TableTd>
                    <TableTd>{entry.endMileage}</TableTd>
                    <TableTd>{entry.destination}</TableTd>
                    <TableTd>{entry.businessPurpose}</TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </ScrollArea>
      )}
    </div>
  );
}
