"use client";

import { MileageLog } from "@/types/mileage";
import { Button } from "@mantine/core";
import { IconPrinter } from "@tabler/icons-react";
interface PrintMilageLogProps {
  log: MileageLog;
}

export const PrintMilageLog: React.FC<PrintMilageLogProps> = ({ log }) => {
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { margin-bottom: 20px; }
            .info { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mileage Log</h1>
            <div class="info">Start Date: ${new Date(
              log.start_date
            ).toLocaleDateString()}</div>
            <div class="info">End Date: ${new Date(
              log.end_date
            ).toLocaleDateString()}</div>
            <div class="info">Total Mileage: ${log.total_mileage}</div>
            <div class="info">Personal Miles: ${log.total_personal_miles}</div>
            <div class="info">Starting Odometer: ${log.start_mileage}</div>
            <div class="info">Ending Odometer: ${log.end_mileage}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Starting Mileage</th>
                <th>Ending Mileage</th>
                <th>Destination</th>
                <th>Business Purpose</th>
              </tr>
            </thead>
            <tbody>
              ${log.log_entries
                .map(
                  (entry) => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.startMileage}</td>
                  <td>${entry.endMileage}</td>
                  <td>${entry.destination}</td>
                  <td>${entry.businessPurpose}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Button
      leftSection={<IconPrinter />}
      onClick={handlePrint}
      variant="light"
      color="blue"
    >
      Print Log
    </Button>
  );
};
