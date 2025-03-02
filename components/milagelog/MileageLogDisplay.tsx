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
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { MileageEntry } from "@/types/mileage";

interface MileageLogDisplayProps {
  startDate: Date;
  endDate: Date;
  totalMileage: number;
  totalPersonalMiles: number;
  startMileage: number;
  endMileage: number;
  mileageLog: MileageEntry[];
}

export function MileageLogDisplay({
  startDate,
  endDate,
  totalMileage,
  totalPersonalMiles,
  startMileage,
  endMileage,
  mileageLog,
}: MileageLogDisplayProps) {
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
    <Stack gap={isMobile ? "md" : 5}>
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
        <Group grow>
          <Stack gap={3}>
            <Text>
              <Text span fw={600}>
                Start Date:
              </Text>{" "}
              {startDate.toLocaleDateString()}
            </Text>
            <Text>
              <Text span fw={600}>
                End Date:
              </Text>{" "}
              {endDate.toLocaleDateString()}
            </Text>
            <Text>
              <Text span fw={600}>
                Total Mileage:
              </Text>{" "}
              {totalMileage} miles
            </Text>
          </Stack>
          <Stack gap={3}>
            <Text>
              <Text span fw={600}>
                Personal Miles:
              </Text>{" "}
              {totalPersonalMiles} miles
            </Text>
            <Text>
              <Text span fw={600}>
                Starting Odometer:
              </Text>{" "}
              {startMileage}
            </Text>
            <Text>
              <Text span fw={600}>
                Ending Odometer:
              </Text>{" "}
              {endMileage}
            </Text>
          </Stack>
        </Group>
      )}

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
                <TableTh>Starting Mileage</TableTh>
                <TableTh>Ending Mileage</TableTh>
                <TableTh>Destination</TableTh>
                <TableTh>Business Purpose</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {mileageLog.map((entry) => (
                <TableTr key={entry.date.toString()}>
                  <TableTd>{new Date(entry.date).toLocaleDateString()}</TableTd>
                  <TableTd>{entry.startMileage}</TableTd>
                  <TableTd>{entry.endMileage}</TableTd>
                  <TableTd>{entry.destination}</TableTd>
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
