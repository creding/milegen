import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Mock Supabase server client and data layer
vi.mock('@/lib/supabaseServerClient', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/data/mileageLogData', () => ({ deleteSavedMileageLog: vi.fn() }));

import { createClient } from '@/lib/supabaseServerClient';
import { deleteSavedMileageLog } from '@/lib/data/mileageLogData';
import { deleteMileageLog } from '@/app/actions/deleteMileageLog';

const VALID_UUID = 'f9a6cd9d-1517-4298-84e9-14b0a7e6d173';

describe('deleteMileageLog integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validation error for invalid UUID', async () => {
    const result = await deleteMileageLog('invalid-id');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Validation error');
  });

  it('returns auth error when no user', async () => {
    const mockClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: {} }) } };
    (createClient as Mock).mockResolvedValue(mockClient);

    const result = await deleteMileageLog(VALID_UUID);
    expect(result.success).toBe(false);
    expect(result.message).toBe('User not authenticated.');
  });

  it('deletes log when user authenticated', async () => {
    const mockUser = { id: 'user-id' };
    const mockClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) } };
    (createClient as Mock).mockResolvedValue(mockClient);

    const result = await deleteMileageLog(VALID_UUID);
    expect(deleteSavedMileageLog as Mock).toHaveBeenCalledWith(VALID_UUID, mockUser.id);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Mileage log deleted successfully.');
  });
});
