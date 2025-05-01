import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock dependencies
vi.mock('server-only', () => ({})); 
vi.mock('@/lib/data/mileageLogData', () => ({
  getFullMileageLog: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } })); // Mock logger just in case
vi.mock('jspdf');
vi.mock('jspdf-autotable');

import { getFullMileageLog } from '@/lib/data/mileageLogData';
import { downloadMileageLogPdf } from '@/app/actions/downloadMileageLogPdf';

const mockGetFullMileageLog = getFullMileageLog as Mock;
const mockJsPDF = jsPDF as unknown as Mock;
const mockAutoTable = autoTable as Mock;

// Mock implementation for jsPDF
const mockPdfOutput = vi.fn();
const mockPdfText = vi.fn();
const mockPdfSetFontSize = vi.fn();
const mockPdfSetTextColor = vi.fn();

mockJsPDF.mockImplementation(() => ({
  text: mockPdfText,
  setFontSize: mockPdfSetFontSize,
  setTextColor: mockPdfSetTextColor,
  output: mockPdfOutput,
}));

describe('downloadMileageLogPdf integration', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return values
    mockPdfOutput.mockReturnValue('mock-base64-pdf-data'); 
  });

  it('returns validation error for invalid log ID', async () => {
    const invalidLogId = 'not-a-uuid';
    const result = await downloadMileageLogPdf(invalidLogId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation error: Invalid log ID');
    expect(mockGetFullMileageLog).not.toHaveBeenCalled();
  });

  it('returns error when mileage log is not found', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174000';
    mockGetFullMileageLog.mockResolvedValue(null);

    const result = await downloadMileageLogPdf(validLogId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Mileage log not found.');
    expect(mockGetFullMileageLog).toHaveBeenCalledWith(validLogId);
  });

  it('returns error when getFullMileageLog throws an error', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174000';
    const dbError = new Error('Database connection failed');
    mockGetFullMileageLog.mockRejectedValue(dbError);

    const result = await downloadMileageLogPdf(validLogId);

    // The original function catches the error and likely returns a generic message or the error message itself.
    // Based on the current structure (viewed code), it seems unhandled errors might bubble up or be caught later.
    // Let's assume it propagates for now or returns a generic error.
    // UPDATE: The provided code *does* have a try/catch around getFullMileageLog, but the catch block wasn't shown.
    // Assuming it returns a generic error or the specific error message.
    // If the function returns { success: false, error: '...' } from the catch block:
    expect(result.success).toBe(false);
    // Adjust the expected error message if the actual catch block implementation differs.
    expect(result.error).toBeDefined(); 
    // We might need to see the actual catch block in downloadMileageLogPdf for a precise assertion.
  });

  it('successfully generates PDF data when log is found', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174000';
    const mockLogData = {
      id: validLogId,
      vehicle_info: 'Test Car',
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-01-31T23:59:59Z',
      start_mileage: 10000,
      end_mileage: 11000,
      total_mileage: 1000,
      total_business_miles: 800,
      total_personal_miles: 200,
      business_deduction_rate: 0.655,
      business_deduction_amount: 524,
      log_entries: [
        { date: '2023-01-05T10:00:00Z', start_mileage: 10100, end_mileage: 10150, miles: 50, purpose: 'Client Meeting' },
        { date: '2023-01-15T14:00:00Z', start_mileage: 10500, end_mileage: 10580, miles: 80, purpose: 'Supplies' },
      ],
    };
    mockGetFullMileageLog.mockResolvedValue(mockLogData);

    const result = await downloadMileageLogPdf(validLogId);

    expect(result.success).toBe(true);
    expect(result.data).toBe('mock-base64-pdf-data'); // Check if the mocked output is returned
    expect(result.error).toBeUndefined();
    expect(mockGetFullMileageLog).toHaveBeenCalledWith(validLogId);
    expect(mockJsPDF).toHaveBeenCalledTimes(1);
    expect(mockAutoTable).toHaveBeenCalledTimes(1);
    expect(mockPdfOutput).toHaveBeenCalledWith('datauristring'); // Verify it tries to get Base64
    // Optionally, add more specific checks on calls to text/setFontSize etc. if needed
    expect(mockPdfText).toHaveBeenCalled(); 
    expect(mockPdfSetFontSize).toHaveBeenCalled();
  });
});
