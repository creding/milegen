import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createClient } from '@/lib/supabaseServerClient';
import { logger } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types/database.types';
import { loadMileageLogs, loadMileageLog } from '@/app/actions/loadMileageLogs';
import * as dataLayer from '@/lib/data/mileage';

// --- Mock Dependencies ---
vi.mock('@/lib/supabaseServerClient');
vi.mock('@/lib/logger');
vi.mock('@/lib/data/mileage');

// --- Mock Types ---
type MileageLog = Tables<'mileage_logs'>;
type MockUser = Pick<User, 'id'>;

type MockAuth = {
  getUser: Mock;
};

type MockSupabase = {
  auth: MockAuth;
};

// --- Test Data ---
const testUser: MockUser = { id: 'user-test-123' };
const now = new Date();
const yesterday = new Date(now.setDate(now.getDate() - 1));

const testLog1: MileageLog = {
  id: '11111111-1111-1111-1111-111111111111', // Use a valid UUID
  user_id: testUser.id,
  log_name: 'Trip to Client A',
  start_date: yesterday.toISOString().split('T')[0],
  end_date: yesterday.toISOString().split('T')[0],
  start_mileage: 10000,
  end_mileage: 10100,
  total_mileage: 100,
  total_business_miles: 100,
  total_personal_miles: 0,
  vehicle_info: 'Toyota Camry 2020',
  created_at: yesterday.toISOString(),
  business_deduction_rate: 0.655,
  business_deduction_amount: 65.50,
  year: yesterday.getFullYear(),
};

const testLog2: MileageLog = {
  id: '22222222-2222-2222-2222-222222222222', // Use a valid UUID
  user_id: testUser.id,
  log_name: 'Trip to Supplier B',
  start_date: now.toISOString().split('T')[0],
  end_date: now.toISOString().split('T')[0],
  start_mileage: 10100,
  end_mileage: 10150,
  total_mileage: 50,
  total_business_miles: 50,
  total_personal_miles: 0,
  vehicle_info: 'Toyota Camry 2020',
  created_at: now.toISOString(),
  business_deduction_rate: 0.655,
  business_deduction_amount: 32.75,
  year: now.getFullYear(),
};

// --- Test Suite ---
describe('loadMileageLogs actions', () => {
  let mockSupabaseClient: MockSupabase;
  let mockGetUser: Mock;
  let mockCreateClient: Mock;
  let mockFetchAllMileageLogs: Mock;
  let mockFetchMileageLogById: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    mockGetUser = vi.fn();

    mockSupabaseClient = {
      auth: { getUser: mockGetUser },
    };
    mockCreateClient = createClient as Mock;
    mockCreateClient.mockResolvedValue(mockSupabaseClient);

    mockFetchAllMileageLogs = dataLayer.fetchAllMileageLogsByUserId as Mock;
    mockFetchMileageLogById = dataLayer.fetchMileageLogById as Mock;

    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    mockFetchAllMileageLogs.mockResolvedValue({ data: [testLog1, testLog2], error: null });
    mockFetchMileageLogById.mockResolvedValue({ data: testLog1, error: null });
  });

  describe('loadMileageLogs', () => {
    it('should return logs successfully for an authenticated user', async () => {
      // Arrange: Default mocks handle success

      // Act
      const result = await loadMileageLogs();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mileage logs loaded successfully');
      expect(result.logs).toEqual([testLog1, testLog2]);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).toHaveBeenCalledWith(expect.anything(), testUser.id); // Check it's called with the correct user ID
    });

    it('should return an empty array if user has no logs', async () => {
      // Arrange
      mockFetchAllMileageLogs.mockResolvedValue({ data: [], error: null });

      // Act
      const result = await loadMileageLogs();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mileage logs loaded successfully');
      expect(result.logs).toEqual([]);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).toHaveBeenCalledWith(expect.anything(), testUser.id);
    });

    it('should return failure if user is not authenticated', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      // Act
      const result = await loadMileageLogs();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication required to load mileage logs.');
      expect(result.logs).toEqual([]);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).not.toHaveBeenCalled(); // Data layer should not be called
    });

    it('should return failure on data layer error', async () => {
      // Arrange
      const dataLayerError = new Error('Database connection failed');
      mockFetchAllMileageLogs.mockResolvedValue({ data: null, error: dataLayerError });

      // Act
      const result = await loadMileageLogs();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to load mileage logs. Please try again.');
      expect(result.logs).toEqual([]);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).toHaveBeenCalledTimes(1);
      expect(mockFetchAllMileageLogs).toHaveBeenCalledWith(expect.anything(), testUser.id);
      // Optionally check logger, but the error is logged in the data layer now
      // expect(logger.error).toHaveBeenCalled(); 
    });
  });

  describe('loadMileageLog', () => {
    const validLogId = testLog1.id;
    const invalidLogId = 'not-a-uuid';
    const nonExistentLogId = '00000000-0000-0000-0000-000000000000'; // A valid UUID likely not in DB

    it('should return the log successfully for an authenticated user with a valid ID', async () => {
      // Arrange: Default mocks handle success

      // Act
      const result = await loadMileageLog(validLogId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mileage log loaded successfully');
      expect(result.log).toEqual(testLog1);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).toHaveBeenCalledWith(expect.anything(), testUser.id, validLogId);
    });

    it('should return failure for an invalid log ID format', async () => {
      // Arrange
      const mockLoggerWarn = vi.spyOn(logger, 'warn');

      // Act
      const result = await loadMileageLog(invalidLogId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation error: Invalid log ID');
      expect(result.log).toBeNull();
      expect(mockCreateClient).not.toHaveBeenCalled(); // Should fail validation before client creation
      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockFetchMileageLogById).not.toHaveBeenCalled();
      expect(mockLoggerWarn).toHaveBeenCalledWith(expect.objectContaining({ logId: invalidLogId }), expect.stringContaining('Invalid log ID format'));
    });

    it('should return failure if user is not authenticated', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      const mockLoggerWarn = vi.spyOn(logger, 'warn');

      // Act
      const result = await loadMileageLog(validLogId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Authentication required to load mileage log.');
      expect(result.log).toBeNull();
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).not.toHaveBeenCalled();
      expect(mockLoggerWarn).toHaveBeenCalledWith(expect.objectContaining({ logId: validLogId }), expect.stringContaining('Load single mileage log action called without authenticated user'));
    });

    it('should return failure if log is not found or not owned by user (data layer error)', async () => {
      // Arrange: Simulate data layer returning the specific error Supabase throws for .single() not found
      const notFoundError = {
        name: 'PostgrestError',
        message: 'PGRST116: Row not found',
        code: 'PGRST116',
      } as Error; // Cast to Error type for the mock signature
      
      mockFetchMileageLogById.mockResolvedValue({ data: null, error: notFoundError });

      // Act
      const result = await loadMileageLog(nonExistentLogId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Mileage log not found or access denied.'); // Action translates the error
      expect(result.log).toBeNull();
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).toHaveBeenCalledWith(expect.anything(), testUser.id, nonExistentLogId);
    });

    it('should return failure on generic data layer error', async () => {
      // Arrange
      const dataLayerError = new Error('Database query failed');
      mockFetchMileageLogById.mockResolvedValue({ data: null, error: dataLayerError });

      // Act
      const result = await loadMileageLog(validLogId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to load mileage log. Please try again.');
      expect(result.log).toBeNull();
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).toHaveBeenCalledTimes(1);
      expect(mockFetchMileageLogById).toHaveBeenCalledWith(expect.anything(), testUser.id, validLogId);
      // Error logging handled within the data layer function
    });
  });
});
