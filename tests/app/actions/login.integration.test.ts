import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createClient } from '@/lib/supabaseServerClient';
import { logger } from '@/lib/logger';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { loginAction, signUpAction, logoutAction } from '@/app/actions/login';

// --- Mock Dependencies ---
vi.mock('@/lib/supabaseServerClient');
vi.mock('@/lib/logger');
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// --- Mock Types ---
type MockAuth = {
  signInWithPassword: Mock;
  signUp: Mock;
  signOut: Mock;
};

type MockSupabase = {
  auth: MockAuth;
};

// --- Test Suite ---
describe('Auth Actions (login.ts)', () => {
  let mockSupabaseClient: MockSupabase;
  let mockSignIn: Mock;
  let mockSignUp: Mock;
  let mockSignOut: Mock;
  let mockCreateClient: Mock;
  let mockLoggerError: Mock;

  beforeEach(() => {
    // 1. Reset mocks
    vi.resetAllMocks();

    // 2. Setup specific mocks from modules
    mockSignIn = vi.fn();
    mockSignUp = vi.fn();
    mockSignOut = vi.fn();
    mockLoggerError = logger.error as Mock; // Already mocked by vi.mock

    // 3. Mock Supabase client structure
    mockSupabaseClient = {
      auth: { signInWithPassword: mockSignIn, signUp: mockSignUp, signOut: mockSignOut },
    };

    // 4. Mock the createClient factory
    mockCreateClient = createClient as Mock;
    mockCreateClient.mockResolvedValue(mockSupabaseClient as unknown as SupabaseClient);

    // 5. Default mock implementations (success cases)
    mockSignIn.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  // --- Tests for loginAction ---
  describe('loginAction', () => {
    it('should successfully login and redirect on valid credentials', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      // Act
      await loginAction(formData);

      // Assert
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(redirect).toHaveBeenCalledWith('/generator');
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid email', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', 'password123');

      // Act
      const result = await loginAction(formData);

      // Assert
      expect(result?.error?.message).toContain('Validation error: Invalid email address');
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignIn).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should return validation error for short password', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', '123');

      // Act
      const result = await loginAction(formData);

      // Assert
      expect(result?.error?.message).toContain('Validation error: Password must be at least 6 characters');
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignIn).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should return error message on Supabase auth error', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      const authError = { message: 'Invalid login credentials', code: '400' };
      mockSignIn.mockResolvedValue({ error: authError });

      // Act
      const result = await loginAction(formData);

      // Assert
      expect(result?.error?.message).toBe('There was an error logging in.');
      expect(result?.error?.code).toBe(authError.message);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
      expect(mockLoggerError).not.toHaveBeenCalled(); // Login action doesn't log this error itself
    });
  });

  // --- Tests for signUpAction ---
  describe('signUpAction', () => {
    const validSignUpData = {
      email: 'newuser@example.com',
      password: 'newPassword123',
      termsAccepted: true,
    };

    it('should successfully sign up user and redirect', async () => {
      // Act
      await signUpAction(validSignUpData);

      // Assert
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignUp).toHaveBeenCalledTimes(1);
      expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
        email: validSignUpData.email,
        password: validSignUpData.password,
        options: {
          data: {
            terms_accepted: true,
            terms_accepted_at: expect.any(String),
            terms_version: '1.0',
          },
        },
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(redirect).toHaveBeenCalledWith('/generator');
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it('should return validation error if terms not accepted', async () => {
      // Arrange
      const invalidData = { ...validSignUpData, termsAccepted: false };

      // Act
      const result = await signUpAction(invalidData);

      // Assert
      expect(result?.error).toContain('Terms of Service must be accepted');
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignUp).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should return validation error for invalid email', async () => {
      // Arrange
      const invalidData = { ...validSignUpData, email: 'invalid' };

      // Act
      const result = await signUpAction(invalidData);

      // Assert
      expect(result?.error).toContain('Invalid email address');
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignUp).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should return error message and log on Supabase auth error', async () => {
      // Arrange
      const authError = new Error('User already registered');
      mockSignUp.mockResolvedValue({ error: authError });

      // Act
      const result = await signUpAction(validSignUpData);

      // Assert
      expect(result?.error).toBe('Failed to create user.');
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignUp).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith({ err: authError }, 'Failed to create user');
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  // --- Tests for logoutAction ---
  describe('logoutAction', () => {
    it('should successfully sign out user, revalidate, and redirect', async () => {
      // Act
      await logoutAction();

      // Assert
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('should throw error if Supabase signOut fails', async () => {
      // Arrange
      const signOutError = new Error('Sign out failed');
      mockSignOut.mockResolvedValue({ error: signOutError });

      // Act & Assert
      await expect(logoutAction()).rejects.toThrow(signOutError);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});
