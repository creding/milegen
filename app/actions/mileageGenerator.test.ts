// app/actions/mileageGenerator.test.ts
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateMileageLogFromForm, MileageLog } from './mileageGenerator';
import { _getCustomBusinessTypeDetails as mockGetCustomDetails } from '@/lib/data/customBusinessTypes.data';
import { BUSINESS_TYPES as PREDEFINED_BUSINESS_TYPES_ACTUAL } from '@/utils/mileageUtils';
import { createClient } from '@/lib/supabaseServerClient';
import { saveMileageLog as mockSaveMileageLog } from './saveMileageLog';
import { logger } from '@/lib/logger';
import { CustomBusinessType } from '@/types/custom_business_type';

// --- Mocks ---
vi.mock('@/lib/data/customBusinessTypes.data', () => ({
  _getCustomBusinessTypeDetails: vi.fn(),
}));

vi.mock('@/utils/mileageUtils', async () => {
  const actual = await vi.importActual('@/utils/mileageUtils');
  return {
    ...actual, // Import actual isHoliday, etc.
    BUSINESS_TYPES: [ // Provide controlled mock for PREDEFINED_BUSINESS_TYPES
      { name: 'Sales', purposes: ['Client Meeting', 'Prospecting'] },
      { name: 'Consulting', purposes: ['On-site Visit', 'Workshop'] },
    ],
  };
});

vi.mock('@/lib/supabaseServerClient', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
    // Add other Supabase client methods if they are directly used in mileageGenerator
  }),
}));

vi.mock('./saveMileageLog', () => ({
  saveMileageLog: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// --- Test Data ---
const baseParams = {
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-01-05'), // Short period for simpler testing
  startMileage: 10000,
  endMileage: 10500,
  totalPersonalMiles: 100,
  vehicle: '2023 Toyota Camry',
  subscriptionStatus: 'active',
  currentEntryCount: 0,
};

const sampleCustomType: CustomBusinessType = {
  id: 'custom-id-123',
  user_id: 'test-user-id',
  name: 'My Custom Deliveries',
  avg_trips_per_workday: 4,
  created_at: new Date().toISOString(),
  custom_business_purposes: [
    { id: 'p1', business_type_id: 'custom-id-123', purpose_name: 'Custom Delivery A', max_distance: 20, created_at: new Date().toISOString() },
    { id: 'p2', business_type_id: 'custom-id-123', purpose_name: 'Custom Pickup B', max_distance: 15, created_at: new Date().toISOString() },
  ],
};

describe('generateMileageLogFromForm Action', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears all mocks, including call counts

    // Default successful save
    (mockSaveMileageLog as vi.Mock).mockResolvedValue({ success: true, logId: 'log-123', message: 'Saved' });
    // Default user for Supabase
    (createClient().auth.getUser as vi.Mock).mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
  });

  it('should use predefined business type details when a predefined name is provided', async () => {
    const params = { ...baseParams, businessType: 'Sales' };
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(true);
    expect(result.logId).toBe('log-123');
    expect(mockGetCustomDetails).not.toHaveBeenCalled();
    
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    expect(savedLog.business_type).toBe('Sales');
    // Further checks: Inspect log_entries to infer purpose usage if possible,
    // though this is harder. For now, ensuring correct type name is primary.
    expect(savedLog.log_entries?.some(entry => entry.type === 'business' && (entry.purpose === 'Client Meeting' || entry.purpose === 'Prospecting'))).toBe(true);
  });

  it('should fetch and use custom business type details when a custom ID is provided', async () => {
    (mockGetCustomDetails as vi.Mock).mockResolvedValue(sampleCustomType);
    const params = { ...baseParams, businessType: 'custom-id-123' };
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(true);
    expect(result.logId).toBe('log-123');
    expect(mockGetCustomDetails).toHaveBeenCalledWith(expect.anything(), 'custom-id-123', 'test-user-id');
    
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    expect(savedLog.business_type).toBe('My Custom Deliveries');
     // Check if avg_trips_per_workday was logged (as per implementation)
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('avg_trips_per_workday: 4'));

    // Check if custom purposes were used (example)
    const hasCustomPurpose = savedLog.log_entries?.some(entry => 
        entry.type === 'business' && 
        (entry.purpose === 'Custom Delivery A' || entry.purpose === 'Custom Pickup B')
    );
    expect(hasCustomPurpose).toBe(true);

    // Check if max_distance was respected (harder to test precisely without internal state)
    // We can check if any trip significantly exceeds the smallest max_distance
    const maxAllowedForCustom = 15; // Smallest max_distance in sampleCustomType
    const businessTrips = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    businessTrips.forEach(trip => {
        // Allow for some flexibility due to how remaining miles are handled
        // The core logic tries to make trips within max_distance, but might adjust the last one.
        // This test is a basic check.
        if (trip.purpose === 'Custom Pickup B') { // This purpose has max_distance: 15
             expect(trip.miles).toBeLessThanOrEqual(maxAllowedForCustom + 0.1); // Add small tolerance
        }
         if (trip.purpose === 'Custom Delivery A') { // This purpose has max_distance: 20
             expect(trip.miles).toBeLessThanOrEqual(20 + 0.1);
        }
    });
  });

  it('should return an error if an invalid custom business type ID is provided', async () => {
    (mockGetCustomDetails as vi.Mock).mockResolvedValue(null); // Simulate type not found
    const params = { ...baseParams, businessType: 'invalid-custom-id' };
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Custom business type with ID "invalid-custom-id" not found');
    expect(mockGetCustomDetails).toHaveBeenCalledWith(expect.anything(), 'invalid-custom-id', 'test-user-id');
    expect(mockSaveMileageLog).not.toHaveBeenCalled();
  });
  
  it('should return an error if fetching custom business type details fails', async () => {
    (mockGetCustomDetails as vi.Mock).mockRejectedValue(new Error('DB connection error'));
    const params = { ...baseParams, businessType: 'custom-id-error-case' };
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Error fetching details for custom business type ID "custom-id-error-case"');
    expect(mockSaveMileageLog).not.toHaveBeenCalled();
  });


  it('should use default business type if no businessType is provided in params', async () => {
    const params = { ...baseParams, businessType: undefined }; // Explicitly undefined
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(true);
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    // CONFIG.DEFAULT_BUSINESS_TYPE is "General Business" in mileageGenerator.ts
    expect(savedLog.business_type).toBe("General Business"); 
    expect(mockGetCustomDetails).not.toHaveBeenCalled();
  });

  it('should return an error if user is not authenticated when fetching custom type', async () => {
    (createClient().auth.getUser as vi.Mock).mockResolvedValueOnce({ data: { user: null }, error: { message: "Auth error", name:"AuthError", status:401 } });
    const params = { ...baseParams, businessType: 'custom-id-needs-auth' };
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(false);
    expect(result.message).toBe('User not authenticated. Cannot generate log.');
    expect(mockGetCustomDetails).not.toHaveBeenCalled();
  });

});
