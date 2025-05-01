import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createClient } from '@/lib/supabaseServerClient';
import { logger } from '@/lib/logger';
import { saveMileageLog } from '@/app/actions/saveMileageLog';
import { getBusinessMileageRate } from '@/utils/constants'; // Mock this
import { saveMileageLogAndEntries } from '@/lib/data/mileage'; // Mock this
import { revalidatePath } from 'next/cache'; // Mock this
import type { User } from '@supabase/supabase-js';
// Use the specific type from mileageGenerator, as the action does
import type { MileageLog } from '@/app/actions/mileageGenerator'; 

// --- Mocks Setup ---
vi.mock('@/lib/supabaseServerClient');
vi.mock('@/lib/logger');
vi.mock('@/utils/constants');
vi.mock('@/lib/data/mileage', () => ({
  saveMileageLogAndEntries: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// Simplified Supabase mock for this action
type MockAuth = {
  getUser: Mock;
};

type MockSupabase = {
  auth: MockAuth;
};

type MockUser = Pick<User, 'id'>;

// --- Test Data ---
const testUser: MockUser = {
  id: 'test-user-id-123',
};

// Define base entry matching Tables<'mileage_log_entries'>['Row'] structure
const testLogEntryBase = {
  date: '2024-01-01',
  start_mileage: 1000, // Correct field name
  end_mileage: 1050,   // Correct field name
  miles: 50, // Calculated: end_mileage - start_mileage
  purpose: 'Office to Client A - Meeting', // Map route/notes here
  type: 'Business', // Default value
  vehicle_info: 'Test Vehicle', // Default value
  // Nullable fields
  business_type: null,
  location: null,
  // DB-generated fields (set null/empty here, required by type but not used as input)
  id: '', 
  log_id: null, // Use null for optional foreign key
  created_at: null,
  updated_at: null,
};

const testMileageLogInput: MileageLog = {
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  start_mileage: 1000,
  end_mileage: 1500,
  total_mileage: 500,
  total_business_miles: 300,
  total_personal_miles: 200,
  business_type: 'Consulting',
  vehicle_info: 'Toyota Camry',
  business_deduction_rate: 0, // Will be calculated
  business_deduction_amount: 0, // Will be calculated
  user_id: '', // Will be set by action
  id: '', // Will be set by DB
  log_entries: [
    { ...testLogEntryBase, id: 'entry-1' }, // Provide minimal required fields, ID is set by DB 
    {
      ...testLogEntryBase,
      id: 'entry-2',
      date: '2024-01-02',
      start_mileage: 1050,
      end_mileage: 1100,
      miles: 50, // Recalculate for this entry
      purpose: 'Client A to B',
    },
  ]
};

const expectedLogId = 'new-log-uuid-456';
const mockRate = 0.67; // Example rate for the current year

// --- Test Suite ---
describe('saveMileageLog action', () => {
  let mockSupabaseClient: MockSupabase;
  let mockGetUser: Mock;
  let mockCreateClient: Mock;
  let mockSaveDataLayer: Mock; // Mock for the data layer function
  let mockGetRate: Mock;
  let mockRevalidate: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock dependencies
    mockGetUser = vi.fn().mockResolvedValue({ data: { user: testUser }, error: null });
    mockGetRate = getBusinessMileageRate as Mock;
    mockGetRate.mockReturnValue(mockRate);
    mockRevalidate = revalidatePath as Mock;

    // Mock the data layer function's successful return
    mockSaveDataLayer = saveMileageLogAndEntries as Mock;
    mockSaveDataLayer.mockResolvedValue({ data: expectedLogId, error: null });

    mockSupabaseClient = {
      auth: { getUser: mockGetUser },
    };
    mockCreateClient = createClient as Mock;
    mockCreateClient.mockResolvedValue(mockSupabaseClient);
  });

  it('should successfully save a log for an authenticated user', async () => {
    // Arrange
    const inputLog = { ...testMileageLogInput }; 
    const expectedCalculatedAmount = inputLog.total_business_miles * mockRate;

    // Act
    const result = await saveMileageLog(inputLog);

    // Assert
    expect(result.success).toBe(true);
    expect(result.message).toBe('Mileage log saved successfully');
    expect(result.logId).toBe(expectedLogId);

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockGetRate).toHaveBeenCalledWith(new Date(inputLog.start_date).getFullYear());
    // Check that the data layer function was called correctly
    expect(mockSaveDataLayer).toHaveBeenCalledTimes(1);
    expect(mockSaveDataLayer).toHaveBeenCalledWith(
      mockSupabaseClient, // Expect the supabase client instance
      expect.objectContaining({
        // Check essential fields passed to data layer
        log_name: `Log ${inputLog.start_date} to ${inputLog.end_date}`, // Check placeholder name
        year: new Date(inputLog.start_date).getFullYear(),
        start_date: inputLog.start_date,
        end_date: inputLog.end_date,
        start_mileage: inputLog.start_mileage,
        end_mileage: inputLog.end_mileage,
        total_mileage: inputLog.total_mileage,
        total_business_miles: inputLog.total_business_miles,
        total_personal_miles: inputLog.total_personal_miles,
        business_deduction_rate: mockRate,
        business_deduction_amount: expectedCalculatedAmount,
        vehicle_info: inputLog.vehicle_info,
        business_type: inputLog.business_type,
        log_entries: [], // Expect empty tuple
      }),
      // Ensure the entries passed match the updated structure (omitting DB fields)
      [
        expect.objectContaining({
          date: '2024-01-01',
          start_mileage: 1000,
          end_mileage: 1050,
          miles: 50,
          purpose: 'Office to Client A - Meeting',
          type: 'Business',
          vehicle_info: 'Test Vehicle',
        }),
        expect.objectContaining({
          date: '2024-01-02',
          start_mileage: 1050,
          end_mileage: 1100,
          miles: 50,
          purpose: 'Client A to B',
          type: 'Business',
          vehicle_info: 'Test Vehicle',
        }),
      ]
    );
    expect(mockRevalidate).toHaveBeenCalledTimes(1);
    expect(mockRevalidate).toHaveBeenCalledWith('/saved-logs');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should return failure if user is not authenticated', async () => {
    // Arrange
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const inputLog = { ...testMileageLogInput };

    // Act
    const result = await saveMileageLog(inputLog);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to save mileage log. Please try again.'); // Action catches and returns generic message
    expect(result.logId).toBeUndefined();
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockSaveDataLayer).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith({ err: new Error('User is not logged in') }, 'Error saving mileage log');
  });

  it('should return failure if supabase rpc call fails', async () => {
    // Arrange
    const dataLayerError = { message: 'Data layer RPC error', details: '', hint: '', code: 'DL_RPC_ERROR' };
    // Simulate the data layer function returning an error
    mockSaveDataLayer.mockResolvedValue({ data: null, error: dataLayerError });
    const inputLog = { ...testMileageLogInput };

    // Act
    const result = await saveMileageLog(inputLog);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to save mileage log. Please try again.');
    expect(result.logId).toBeUndefined();
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockGetRate).toHaveBeenCalledTimes(1);
    expect(mockSaveDataLayer).toHaveBeenCalledTimes(1); // Data layer func was called
    expect(mockRevalidate).not.toHaveBeenCalled();
    // Check the error log from the action's catch block after data layer error
    expect(logger.error).toHaveBeenCalledWith({ err: dataLayerError }, "Action: Error saving mileage log via data layer");
    expect(logger.error).toHaveBeenCalledWith({ err: dataLayerError }, 'Error saving mileage log'); // General catch block log
  });

  it('should return failure on generic error during execution', async () => {
    // Arrange
    const genericError = new Error('Something broke');
    // Simulate error during deduction rate calculation for example
    mockGetRate.mockImplementation(() => { throw genericError; }); 
    const inputLog = { ...testMileageLogInput };

    // Act
    const result = await saveMileageLog(inputLog);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to save mileage log. Please try again.');
    expect(result.logId).toBeUndefined();
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockGetRate).toHaveBeenCalledTimes(1);
    expect(mockSaveDataLayer).not.toHaveBeenCalled(); // Failed before data layer call
    expect(mockRevalidate).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith({ err: genericError }, 'Error saving mileage log');
  });

});
