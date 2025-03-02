import {
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
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
  return (
    <div>
      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Mileage Log Summary</h3>
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
      </div>
      <div className="rounded-md border overflow-x-auto">
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
      </div>
    </div>
  );
}
