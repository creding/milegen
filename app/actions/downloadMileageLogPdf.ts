"use server";

import 'server-only';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getFullMileageLog } from '@/lib/data/mileageLogData';
import { format, parseISO } from 'date-fns';
import { z } from "zod";

const idSchema = z.string().uuid("Invalid log ID");

// Helper to safely format date or return placeholder
const safeFormatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MM/dd/yyyy');
  } catch (e) {
    console.error("Error parsing date:", dateStr, e);
    return 'Invalid Date';
  }
};

// Helper to format currency for display
const formatCurrencyDisplay = (amount: number | null | undefined): string => {
  if (amount == null) return 'N/A';
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export async function downloadMileageLogPdf(logId: string): Promise<{ success: boolean; data?: string; error?: string }> {
  const parsed = idSchema.safeParse(logId);
  if (!parsed.success) {
    return { success: false, error: `Validation error: ${parsed.error.errors.map(e => e.message).join(", ")}` };
  }
  const validLogId = parsed.data;

  try {
    const logData = await getFullMileageLog(validLogId);

    if (!logData) {
      return { success: false, error: 'Mileage log not found.' };
    }

    // Calculate business use percentage
    const businessUsePercentage = 
      logData.total_mileage && logData.total_mileage > 0
        ? (logData.total_business_miles / logData.total_mileage) * 100
        : 0;

    const doc = new jsPDF();

    // --- Add Title & Summary --- 
    doc.setFontSize(16);
    doc.text('Mileage Log Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Summary Info (adjust y positions as needed)
    let yPos = 35;
    const lineHeight = 7;
    doc.text(`Vehicle: ${logData.vehicle_info || 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Period: ${safeFormatDate(logData.start_date)} - ${safeFormatDate(logData.end_date)}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Odometer: ${logData.start_mileage?.toLocaleString() ?? 'N/A'} - ${logData.end_mileage?.toLocaleString() ?? 'N/A'}`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Total Mileage: ${logData.total_mileage?.toFixed(1) ?? 'N/A'} miles`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Business Miles: ${logData.total_business_miles?.toFixed(1) ?? 'N/A'} miles`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Personal Miles: ${logData.total_personal_miles?.toFixed(1) ?? 'N/A'} miles`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Business Use: ${businessUsePercentage.toFixed(1)}%`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Rate: $${logData.business_deduction_rate?.toFixed(3) ?? 'N/A'}/mile`, 14, yPos);
    yPos += lineHeight;
    doc.text(`Tax Deduction: ${formatCurrencyDisplay(logData.business_deduction_amount)}`, 14, yPos);
    yPos += 10; // Space before table

    // --- Add Entries Table --- 
    const tableColumn = ['Date', 'Vehicle', 'Start', 'End', 'Miles', 'Purpose'];
    const tableRows = logData.log_entries.map(entry => [
      safeFormatDate(entry.date),
      entry.vehicle_info || logData.vehicle_info || 'N/A',
      entry.start_mileage ?? '',
      entry.end_mileage ?? '',
      entry.miles?.toFixed(1) ?? '',
      entry.purpose || '',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] }, // Example header color
      didDrawPage: () => {
        // You can add headers/footers here if needed
      }
    });

    // --- Generate Base64 Output --- 
    // Use output('datauristring') which includes the prefix 'data:application/pdf;base64,'
    const dataUriString = doc.output('datauristring');
    // Extract just the base64 part
    const base64String = dataUriString.substring(dataUriString.indexOf(',') + 1);

    return { success: true, data: base64String };

  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF file.';
    return { success: false, error: errorMessage };
  }
}
