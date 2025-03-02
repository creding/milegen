"use client";

import { MileageLog } from "@/types/mileage";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPrinter } from "@tabler/icons-react";

interface PrintMilageLogProps {
  log: MileageLog;
}

// Export a reusable function to print mileage logs
export const printMileageLog = (log: MileageLog) => {
  const printContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 15px;
          }
          .header { 
            margin-bottom: 20px; 
          }
          .info { 
            margin: 5px 0; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
          }
          
          @media print {
            body {
              padding: 0;
            }
            .page-break {
              page-break-before: always;
            }
          }
          
          @media screen and (max-width: 768px) {
            table {
              font-size: 14px;
            }
            th, td {
              padding: 6px;
            }
            h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Mileage Log</h1>
          <div class="info">Vehicle: ${log.vehicle_info?.name || 'Not specified'}</div>
          <div class="info">Start Date: ${new Date(
            log.start_date
          ).toLocaleDateString()}</div>
          <div class="info">End Date: ${new Date(
            log.end_date
          ).toLocaleDateString()}</div>
          <div class="info">Total Mileage: ${log.total_mileage}</div>
          <div class="info">Total Business Miles: ${log.total_business_miles}</div>
          <div class="info">Total Personal Miles: ${log.total_personal_miles}</div>
          <div class="info">Starting Odometer: ${log.start_mileage}</div>
          <div class="info">Ending Odometer: ${log.end_mileage}</div>
          <div class="info">Business Deduction Rate: $${log.business_deduction_rate?.toFixed(2) || '0.00'}</div>
          <div class="info">Business Deduction Amount: $${log.business_deduction_amount?.toFixed(2) || '0.00'}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Odometer Start</th>
              <th>Odometer End</th>
              <th>Total Miles</th>
              <th>Business Miles</th>
              <th>Personal Miles</th>
              <th>Location</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            ${log.log_entries
              .map(
                (entry) => `
              <tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${entry.vehicle}</td>
                <td>${entry.startMileage}</td>
                <td>${entry.endMileage}</td>
                <td>${entry.totalMiles}</td>
                <td>${entry.businessMiles}</td>
                <td>${entry.personalMiles}</td>
                <td>${entry.location}</td>
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

export const PrintMilageLog: React.FC<PrintMilageLogProps> = ({ log }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handlePrint = () => {
    printMileageLog(log);
  };

  return (
    <Button
      leftSection={<IconPrinter />}
      onClick={handlePrint}
      variant="light"
      color="blue"
      fullWidth={isMobile}
      size={isMobile ? "md" : "sm"}
    >
      Print Log
    </Button>
  );
};
