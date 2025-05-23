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
    const businessEntries = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    // Predefined types don't have frequency limits in this mock, so multiple can appear
    // up to avg_trips_per_workday or mileage target.
    expect(businessEntries.length).toBeGreaterThan(0); 
    expect(businessEntries.every(entry => entry.purpose === 'Client Meeting' || entry.purpose === 'Prospecting'))
  });

  it('should fetch and use custom business type details when a custom ID is provided (respecting max_distance)', async () => {
    // sampleCustomType has "Custom Pickup B" with max_distance: 15
    (mockGetCustomDetails as vi.Mock).mockResolvedValue(sampleCustomType); 
    const params = { 
      ...baseParams, 
      businessType: 'custom-id-123',
      endDate: new Date('2023-01-01'), // Single day for easier trip analysis
      endMileage: baseParams.startMileage + 200, // Enough miles for multiple trips
      totalPersonalMiles: 10,
    };
    const result = await generateMileageLogFromForm(params);

    expect(result.success).toBe(true);
    expect(mockGetCustomDetails).toHaveBeenCalledWith(expect.anything(), 'custom-id-123', 'test-user-id');
    
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    expect(savedLog.business_type).toBe('My Custom Deliveries');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('avg_trips_per_workday: 4'));

    const businessEntries = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    expect(businessEntries.length).toBeGreaterThan(0);
    businessEntries.forEach(entry => {
      if (entry.purpose === 'Custom Pickup B') {
        expect(entry.miles).toBeLessThanOrEqual(15 + 0.1); // Max distance + tolerance
      }
      if (entry.purpose === 'Custom Delivery A') { // max_distance: 20
        expect(entry.miles).toBeLessThanOrEqual(20 + 0.1);
      }
    });
  });
  
  it('should respect frequency_per_day for custom types', async () => {
    const customTypeWithFrequency = {
      ...sampleCustomType,
      avg_trips_per_workday: 5, // Allow up to 5 trips a day if possible
      custom_business_purposes: [
        { ...sampleCustomType.custom_business_purposes[0], purpose_name: 'Frequent Purpose', frequency_per_day: 2, max_distance: 20 },
        { ...sampleCustomType.custom_business_purposes[1], purpose_name: 'Rare Purpose', frequency_per_day: 1, max_distance: 10 },
      ],
    };
    (mockGetCustomDetails as vi.Mock).mockResolvedValue(customTypeWithFrequency);
    const params = { 
        ...baseParams, 
        businessType: 'custom-id-123',
        endDate: new Date('2023-01-01'), // Single day
        endMileage: baseParams.startMileage + 300, // Ample mileage
        totalPersonalMiles: 10,
    };
    await generateMileageLogFromForm(params);
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    const businessEntries = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    
    const frequentCount = businessEntries.filter(e => e.purpose === 'Frequent Purpose').length;
    const rareCount = businessEntries.filter(e => e.purpose === 'Rare Purpose').length;

    expect(frequentCount).toBeLessThanOrEqual(2);
    expect(rareCount).toBeLessThanOrEqual(1);
    // Total business trips could be up to 3 (2+1) if mileage allows, or less.
    // It could also be limited by avg_trips_per_workday if that was smaller.
    expect(businessEntries.length).toBeLessThanOrEqual(3); 
  });

  it('should stop generating business trips if all frequency-limited purposes are exhausted for the day', async () => {
    const customTypeSingleFreq = {
      ...sampleCustomType,
      avg_trips_per_workday: 5, // High avg trips
      custom_business_purposes: [
        { id: 'p1', business_type_id: 'custom-id-123', purpose_name: 'Single Use Daily', max_distance: 20, frequency_per_day: 1, created_at: '' },
      ],
    };
    (mockGetCustomDetails as vi.Mock).mockResolvedValue(customTypeSingleFreq);
    const params = { 
        ...baseParams, 
        businessType: 'custom-id-123',
        endDate: new Date('2023-01-01'), // Single day
        endMileage: baseParams.startMileage + 300, // Ample mileage for many trips
        totalPersonalMiles: 10,
    };
    await generateMileageLogFromForm(params);
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    const businessEntries = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    expect(businessEntries.length).toBe(1); // Only one trip of "Single Use Daily"
    expect(businessEntries[0].purpose).toBe('Single Use Daily');
  });
  
  it('total trips should be limited by sum of frequencies if less than avg_trips_per_workday', async () => {
    const customTypeLimitedSumFreq = {
      ...sampleCustomType,
      name: "Limited Sum Freq Type",
      avg_trips_per_workday: 10, // High avg trips
      custom_business_purposes: [
        { id: 'p1', business_type_id: 'custom-id-123', purpose_name: 'P1 Freq1', max_distance: 20, frequency_per_day: 1, created_at: '' },
        { id: 'p2', business_type_id: 'custom-id-123', purpose_name: 'P2 Freq1', max_distance: 10, frequency_per_day: 1, created_at: '' },
      ],
    };
     (mockGetCustomDetails as vi.Mock).mockResolvedValue(customTypeLimitedSumFreq);
    const params = { 
        ...baseParams, 
        businessType: 'custom-id-123',
        endDate: new Date('2023-01-01'), // Single day
        endMileage: baseParams.startMileage + 300, // Ample mileage
        totalPersonalMiles: 10,
    };
    await generateMileageLogFromForm(params);
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    const businessEntries = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    // Total trips capped by sum of frequencies (1+1=2) because avg_trips (10) is higher.
    expect(businessEntries.length).toBe(2); 
  });

  it('should allow non-frequency limited purposes to fill up to avg_trips_per_workday', async () => {
    const customTypeMixedFreq = {
      ...sampleCustomType,
      name: "Mixed Freq Type",
      avg_trips_per_workday: 3, 
      custom_business_purposes: [
        { id: 'p1', business_type_id: 'custom-id-123', purpose_name: 'P1 Freq1', max_distance: 20, frequency_per_day: 1, created_at: '' },
        { id: 'p2', business_type_id: 'custom-id-123', purpose_name: 'P2 Unlimited', max_distance: 10, /* no frequency */ created_at: '' },
      ],
    };
    (mockGetCustomDetails as vi.Mock).mockResolvedValue(customTypeMixedFreq);
     const params = { 
        ...baseParams, 
        businessType: 'custom-id-123',
        endDate: new Date('2023-01-01'), // Single day
        endMileage: baseParams.startMileage + 300, // Ample mileage
        totalPersonalMiles: 10,
    };
    await generateMileageLogFromForm(params);
    const savedLog = (mockSaveMileageLog as vi.Mock).mock.calls[0][0] as MileageLog;
    const businessEntries = savedLog.log_entries?.filter(e => e.type === 'business') || [];
    
    const p1Count = businessEntries.filter(e => e.purpose === 'P1 Freq1').length;
    const p2Count = businessEntries.filter(e => e.purpose === 'P2 Unlimited').length;

    expect(p1Count).toBe(1); // Limited by its frequency
    // P2 Unlimited can make up the rest of avg_trips_per_workday
    // Total trips should be <= avg_trips_per_workday (3)
    expect(businessEntries.length).toBeLessThanOrEqual(3); 
    expect(p2Count).toBe(businessEntries.length - p1Count);
    // If mileage was low, total trips could be less than 3. If high, it will be 3.
    // For this test, with ample mileage, we expect it to hit avg_trips_per_workday.
    if(businessEntries.length === 3) {
        expect(p2Count).toBe(2);
    }
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
