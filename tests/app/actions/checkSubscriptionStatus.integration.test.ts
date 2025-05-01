import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createClient } from '@/lib/supabaseServerClient';
import { checkSubscriptionStatus } from '@/app/actions/checkSubscriptionStatus';
import { logger } from '@/lib/logger';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { SubscriptionData } from '@/types/subscription';
import { fetchLatestSubscriptionByUserId } from '@/lib/data/subscriptions';

// Mock dependencies
vi.mock('@/lib/supabaseServerClient');
vi.mock('@/lib/logger'); 
vi.mock('@/lib/data/subscriptions');

// --- Mock Types ---
type AppUser = Pick<User, 'id' | 'email'>;

type MockSupabaseAuth = {
  getUser: Mock;
};

type MockSupabaseClient = {
  auth: MockSupabaseAuth;
};

// --- Test Suite ---
describe('checkSubscriptionStatus action', () => {
  let mockSupabaseClient: MockSupabaseClient;
  let mockGetUser: Mock;
  let mockedFetchLatestSubscription: Mock;

  beforeEach(() => {
    // 1. Reset mocks
    vi.resetAllMocks();

    // 3. Mock getUser
    mockGetUser = vi.fn();

    // 4. Mock Supabase client structure
    mockSupabaseClient = {
      auth: { getUser: mockGetUser },
    };

    // 5. Mock the createClient factory
    const mockedCreateClient = createClient as Mock;
    mockedCreateClient.mockResolvedValue(mockSupabaseClient as unknown as SupabaseClient);

    // 6. Mock the data layer function
    mockedFetchLatestSubscription = fetchLatestSubscriptionByUserId as Mock;

    // 7. Set default implementations (can be overridden in tests)
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockedFetchLatestSubscription.mockResolvedValue({ data: null, error: null });
  });

  it('returns null when no user is authenticated', async () => {
    // Arrange - Default mockGetUser returns null user

    // Act
    const result = await checkSubscriptionStatus();

    // Assert
    expect(result).toBeNull();
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).not.toHaveBeenCalled(); 
    expect(logger.info).toHaveBeenCalledTimes(1); 
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled(); 
  });

  it('returns subscription status when user is authenticated and subscription exists', async () => {
    // Arrange
    const testUser: AppUser = { id: 'user-123', email: 'test@example.com' };
    const testSubscription: SubscriptionData = {
      id: 'sub-abc',
      user_id: testUser.id,
      status: 'active',
      current_period_end: new Date(Date.now() + 86400000 * 30).toISOString(),
      created_at: new Date().toISOString(),
    };
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    mockedFetchLatestSubscription.mockResolvedValue({ data: testSubscription, error: null });

    // Act
    const result = await checkSubscriptionStatus();

    // Assert
    expect(result).toBe(testSubscription.status);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledWith(expect.any(Object), testUser.id); 
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns null when user is authenticated but no subscription found', async () => {
    // Arrange
    const testUser: AppUser = { id: 'user-no-sub', email: 'nosub@example.com' };
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    // Default mockedFetchLatestSubscription returns { data: null, error: null }

    // Act
    const result = await checkSubscriptionStatus();

    // Assert
    expect(result).toBeNull();
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledWith(expect.any(Object), testUser.id);
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns null when database query returns an error', async () => {
    // Arrange
    const testUser: AppUser = { id: 'user-db-error', email: 'dberror@example.com' };
    const dbError = new Error('Database query failed');
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    mockedFetchLatestSubscription.mockResolvedValue({ data: null, error: dbError }); 

    // Act
    const result = await checkSubscriptionStatus();

    // Assert
    expect(result).toBeNull();
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledWith(expect.any(Object), testUser.id);
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(1); 
    expect(logger.warn).toHaveBeenCalledWith({ err: dbError, userId: testUser.id }, expect.any(String));
    expect(logger.error).not.toHaveBeenCalled(); 
  });

  it('returns null and logs error when database operation throws', async () => {
    // Arrange
    const testUser: AppUser = { id: 'user-throw-error', email: 'throw@example.com' };
    const thrownError = new Error('DB Operation Failed');
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    // Simulate the data layer function throwing an error
    mockedFetchLatestSubscription.mockRejectedValue(thrownError);

    // Act
    const result = await checkSubscriptionStatus();

    // Assert
    expect(result).toBeNull();
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).toHaveBeenCalledWith(expect.any(Object), testUser.id);
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1); 
    expect(logger.error).toHaveBeenCalledWith(
      { err: thrownError },
      'Error checking subscription status'
    );
  });

  it('returns null when getUser throws an error', async () => {
    // Arrange
    const authError = new Error('Authentication service unavailable');
    mockGetUser.mockRejectedValue(authError);

    // Act
    const result = await checkSubscriptionStatus();

    // Assert
    expect(result).toBeNull();
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchLatestSubscription).not.toHaveBeenCalled(); 
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledTimes(1); 
    expect(logger.error).toHaveBeenCalledWith(
      { err: authError },
      'Error checking subscription status'
    );
  });
});