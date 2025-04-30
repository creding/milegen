"use server";

import 'server-only'; // Ensures this module runs only on the server
import * as XLSX from 'xlsx';
import { getFullMileageLog } from '@/lib/data/mileageLogData';
import { format, parseISO } from 'date-fns';

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

// Helper to format currency
const formatCurrency = (amount: number | null | undefined): string | number => {
  if (amount == null) return 'N/A';
  // Return as number for Excel formatting, or formatted string if preferred
  return amount; // Let Excel handle formatting
};

export async function downloadMileageLogXls(logId: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const logData = await getFullMileageLog(logId);

    if (!logData) {
      return { success: false, error: 'Mileage log not found.' };
    }

    // Calculate business use percentage (handle division by zero)
    const businessUsePercentage = 
      logData.total_mileage && logData.total_mileage > 0
        ? (logData.total_business_miles / logData.total_mileage) * 100
        : 0;

    // --- Prepare Data for Sheets ---

    // 1. Summary Sheet Data
    const summaryData = [
      ['Mileage Log Summary'], // Title
      [], // Spacer
      ['Vehicle:', logData.vehicle_info || 'N/A'],
      ['Period:', `${safeFormatDate(logData.start_date)} - ${safeFormatDate(logData.end_date)}`],
      ['Odometer Reading:', `${logData.start_mileage?.toLocaleString() ?? 'N/A'} → ${logData.end_mileage?.toLocaleString() ?? 'N/A'}`],
      ['Total Mileage:', logData.total_mileage?.toFixed(1) ?? 'N/A'],
      ['Business Miles:', logData.total_business_miles?.toFixed(1) ?? 'N/A'],
      ['Personal Miles:', logData.total_personal_miles?.toFixed(1) ?? 'N/A'],
      ['Business Use %:', `${businessUsePercentage.toFixed(1)}%`],
      ['Deduction Rate:', `$${logData.business_deduction_rate?.toFixed(3) ?? 'N/A'}/mile`],
      ['Tax Deduction:', formatCurrency(logData.business_deduction_amount)], // Use helper
    ];

    // 2. Entries Sheet Data
    const entriesHeader = [
      'Date', 'Vehicle', 'Start', 'End', 'Miles', 'Purpose' // Matched UI columns
    ];
    const entriesBody = logData.log_entries.map(entry => ([
      safeFormatDate(entry.date),
      entry.vehicle_info || logData.vehicle_info || 'N/A', // Vehicle Info logic
      entry.start_mileage ?? '',
      entry.end_mileage ?? '',
      entry.miles != null ? parseFloat(entry.miles.toFixed(1)) : '', // Ensure miles are numbers or empty string
      entry.purpose || '',
    ]));

    const entriesData = [entriesHeader, ...entriesBody];

    // --- Create Workbook --- 
    const wb = XLSX.utils.book_new();

    // Create sheets from arrays
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsEntries = XLSX.utils.aoa_to_sheet(entriesData);

    // Add number format for currency cell in summary
    if (logData.business_deduction_amount != null) {
       const currencyCellRef = XLSX.utils.encode_cell({ r: 10, c: 1 }); // Row 10, Col 1 (0-indexed)
       if(wsSummary[currencyCellRef]) {
         wsSummary[currencyCellRef].z = '$#,##0.00'; // Excel currency format
       }
    }

    // Optional: Adjust column widths (example for entries)
    // wsEntries['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

    // Append sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, wsEntries, 'Entries');

    // --- Generate Base64 Output ---
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64String = buffer.toString('base64');

    return { success: true, data: base64String };

  } catch (error) {
    console.error('Error generating XLS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate Excel file.';
    return { success: false, error: errorMessage };
  }
}
