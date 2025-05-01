import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Mock dependencies
vi.mock('@/lib/supabaseServerClient', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));
vi.mock('@/lib/env', () => ({
  env: {
    STRIPE_PRICE_ID: 'price_123',
    NEXT_PUBLIC_VERCEL_URL: 'http://localhost:3000',
  },
}));

import { createClient } from '@/lib/supabaseServerClient';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { createCheckoutSessionAction } from '@/app/actions/createCheckoutSession';
import { env } from '@/lib/env';

const mockStripeSessionCreate = stripe.checkout.sessions.create as Mock;

describe('createCheckoutSessionAction integration', () => {
  // Define a more specific type for the mock client parts we use
  let mockSupabaseClient: {
    auth: {
      getUser: Mock;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabaseClient = {
      auth: {
        getUser: vi.fn(),
      },
    };
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);
  });

  it('returns error when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await createCheckoutSessionAction();

    expect(result).toEqual({ error: 'User not found' });
    expect(mockStripeSessionCreate).not.toHaveBeenCalled();
  });

  it('returns error when Stripe session creation fails', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const stripeError = new Error('Stripe API error');
    mockStripeSessionCreate.mockRejectedValue(stripeError);

    const result = await createCheckoutSessionAction();

    expect(result).toEqual({ error: 'Stripe API error' });
    expect(logger.error).toHaveBeenCalledWith({ err: stripeError }, 'Error creating checkout session');
  });

  it('returns error when Stripe session has no URL', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockStripeSessionCreate.mockResolvedValue({ id: 'sess_123', url: null }); // No URL

    const result = await createCheckoutSessionAction();

    expect(result).toEqual({ error: 'Failed to create checkout session' });
  });

  it('returns session URL when Stripe session creation succeeds', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSessionUrl = 'https://checkout.stripe.com/pay/cs_test_123';
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockStripeSessionCreate.mockResolvedValue({ id: 'sess_123', url: mockSessionUrl });

    const result = await createCheckoutSessionAction();

    expect(result).toEqual({ url: mockSessionUrl });
    expect(mockStripeSessionCreate).toHaveBeenCalledWith({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: mockUser.email,
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_VERCEL_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_VERCEL_URL}/subscribe`,
      metadata: {
        userId: mockUser.id,
      },
    });
  });
});
