"use client";

import { MileageLog } from "@/app/actions/mileageGenerator";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconTable } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import * as XLSX from "xlsx";

interface DownloadSpreadsheetProps {
  log: MileageLog;
}

// Export a reusable function to generate and download spreadsheet
export const generateSpreadsheet = (log: MileageLog) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create summary worksheet with sections
    const summaryData = [
      ["Mileage Log Summary"],
      [""],
      ["Vehicle Information"],
      ["Vehicle", log.vehicle_info],
      [
        "Period",
        `${new Date(log.start_date).toLocaleDateString()} - ${new Date(
          log.end_date
        ).toLocaleDateString()}`,
      ],
      [""],
      ["Odometer Reading"],
      ["Starting Odometer", parseFloat(log.start_mileage.toFixed(1))],
      ["Ending Odometer", parseFloat(log.end_mileage.toFixed(1))],
      [""],
      ["Mileage Summary"],
      ["Total Mileage", `${parseFloat(log.total_mileage.toFixed(1))} miles`],
      [
        "Business Mileage",
        `${parseFloat(log.total_business_miles.toFixed(1))} miles`,
      ],
      [
        "Personal Mileage",
        `${parseFloat(log.total_personal_miles.toFixed(1))} miles`,
      ],
      [""],
      ["Tax Information"],
      [
        "Deduction Rate",
        log.business_deduction_rate
          ? `$${log.business_deduction_rate.toFixed(2)}/mile`
          : "$0.00/mile",
      ],
      [
        "Tax Deduction",
        log.business_deduction_amount
          ? `$${log.business_deduction_amount.toFixed(2)}`
          : "$0.00",
      ],
    ];

    // Add summary worksheet
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Convert log entries to worksheet format matching the table display
    const entries = log.log_entries.map((entry) => ({
      Date: new Date(entry.date).toLocaleDateString(),
      Vehicle: entry.vehicle_info || log.vehicle_info,
      Start: parseFloat(entry.start_mileage.toFixed(1)),
      End: parseFloat(entry.end_mileage.toFixed(1)),
      Miles: parseFloat(entry.miles.toFixed(1)),
      Purpose: entry.purpose,
      Type: entry.type,
    }));

    // Add entries worksheet
    const entriesWs = XLSX.utils.json_to_sheet(entries);
    XLSX.utils.book_append_sheet(wb, entriesWs, "Entries");

    // Save the file
    XLSX.writeFile(wb, "mileage-log.xlsx");

    notifications.show({
      title: "Success",
      message: "Spreadsheet downloaded successfully",
      color: "green",
      icon: <IconCheck />,
    });
  } catch (error) {
    console.error("Spreadsheet Generation Error:", error);
    notifications.show({
      title: "Error",
      message: "Failed to generate spreadsheet",
      color: "red",
      icon: <IconX />,
    });
  }
};

export function DownloadSpreadsheet({ log }: DownloadSpreadsheetProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Button
      leftSection={<IconTable size={16} />}
      onClick={() => generateSpreadsheet(log)}
      variant="transparent"
      size={isMobile ? "md" : "sm"}
      fullWidth={isMobile}
    >
      Download XLS
    </Button>
  );
}
