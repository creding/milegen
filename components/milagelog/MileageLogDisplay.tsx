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
} from "@mantine/core";
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
  return (
    <Stack gap={5}>
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
    </Stack>
  );
}
