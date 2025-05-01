import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as XLSX from 'xlsx';

// Mock dependencies
vi.mock('server-only', () => ({}));
vi.mock('@/lib/data/mileageLogData', () => ({
  getFullMileageLog: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));
vi.mock('xlsx'); // Simple mock for the whole module

import { getFullMileageLog } from '@/lib/data/mileageLogData';
import { downloadMileageLogXls } from '@/app/actions/downloadMileageLogXls';
import { logger } from '@/lib/logger';

const mockGetFullMileageLog = getFullMileageLog as Mock;

// Variables to hold our specific mocks, assigned in beforeEach
let mockBookNew: Mock;
let mockAoaToSheet: Mock;
let mockBookAppendSheet: Mock;
let mockWrite: Mock;

describe('downloadMileageLogXls integration', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Assign specific mocks in beforeEach
    mockBookNew = vi.fn();
    mockAoaToSheet = vi.fn();
    mockBookAppendSheet = vi.fn();
    mockWrite = vi.fn();

    // Use vi.mocked to safely access and assign mocks
    const mockedXLSX = vi.mocked(XLSX, true); // Deep mock
    mockedXLSX.utils.book_new = mockBookNew;
    mockedXLSX.utils.aoa_to_sheet = mockAoaToSheet;
    mockedXLSX.utils.book_append_sheet = mockBookAppendSheet;
    mockedXLSX.write = mockWrite;

    // Default mock return values
    mockBookNew.mockReturnValue({}); // Mock workbook object
    mockAoaToSheet.mockReturnValue({ '!cols': [] }); // Mock worksheet object
    mockWrite.mockReturnValue(Buffer.from('mock-excel-data')); // Mock buffer output
  });

  it('returns validation error for invalid log ID', async () => {
    const invalidLogId = 'not-a-uuid';
    const result = await downloadMileageLogXls(invalidLogId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation error: Invalid log ID');
    expect(mockGetFullMileageLog).not.toHaveBeenCalled();
  });

  it('returns error when mileage log is not found', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174000';
    mockGetFullMileageLog.mockResolvedValue(null);

    const result = await downloadMileageLogXls(validLogId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Mileage log not found.');
    expect(mockGetFullMileageLog).toHaveBeenCalledWith(validLogId);
  });

  it('returns error when getFullMileageLog throws an error', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174000';
    const dbError = new Error('Database connection failed');
    mockGetFullMileageLog.mockRejectedValue(dbError);

    const result = await downloadMileageLogXls(validLogId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection failed'); // Error message from the caught error
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ err: dbError }), 'Error generating XLS');
  });

  it('successfully generates XLS data when log is found', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174000';
    const mockLogData = {
      id: validLogId,
      vehicle_info: 'Test Car XLS',
      start_date: '2023-02-01T00:00:00Z',
      end_date: '2023-02-28T23:59:59Z',
      start_mileage: 20000,
      end_mileage: 21500,
      total_mileage: 1500,
      total_business_miles: 1200,
      total_personal_miles: 300,
      business_deduction_rate: 0.655,
      business_deduction_amount: 786,
      log_entries: [
        { date: '2023-02-05T10:00:00Z', start_mileage: 20100, end_mileage: 20180, miles: 80, purpose: 'Client Visit' },
        { date: '2023-02-15T14:00:00Z', start_mileage: 20800, end_mileage: 20950, miles: 150, purpose: 'Conference' },
      ],
    };
    mockGetFullMileageLog.mockResolvedValue(mockLogData);

    const result = await downloadMileageLogXls(validLogId);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.data).toBe(Buffer.from('mock-excel-data').toString('base64')); // Check for correct base64 string
    expect(mockGetFullMileageLog).toHaveBeenCalledWith(validLogId);
    expect(mockBookNew).toHaveBeenCalledTimes(1);
    expect(mockAoaToSheet).toHaveBeenCalledTimes(2); // Once for summary, once for entries
    expect(mockBookAppendSheet).toHaveBeenCalledTimes(2);
    expect(mockWrite).toHaveBeenCalledWith(expect.anything(), { bookType: 'xlsx', type: 'buffer' });
  });

  it('handles division by zero when calculating business percentage', async () => {
    const validLogId = '123e4567-e89b-12d3-a456-426614174001';
    const mockLogData = {
      id: validLogId,
      vehicle_info: 'Zero Miles Car',
      start_date: '2023-03-01T00:00:00Z',
      end_date: '2023-03-31T23:59:59Z',
      start_mileage: 30000,
      end_mileage: 30000,
      total_mileage: 0,
      total_business_miles: 0,
      total_personal_miles: 0,
      business_deduction_rate: 0.655,
      business_deduction_amount: 0,
      log_entries: [],
    };
    mockGetFullMileageLog.mockResolvedValue(mockLogData);

    const result = await downloadMileageLogXls(validLogId);

    expect(result.success).toBe(true);
    // Check that aoa_to_sheet was called with data reflecting 0% business use
    const summaryDataCall = mockAoaToSheet.mock.calls[0][0] as (string | number | undefined)[][]; // Type the call data
    const businessUseRow = summaryDataCall.find(
        (row: (string | number | undefined)[]) => row[0]?.toString().startsWith('Business Use %:') // Type the row
    );
    expect(businessUseRow?.[1]).toBe('0.0%'); // Use optional chaining
  });
});
