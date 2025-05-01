import { z } from "zod";

const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, "Missing STRIPE_SECRET_KEY"),
  STRIPE_PRICE_ID: z.string().min(1, "Missing STRIPE_PRICE_ID"),
  NEXT_PUBLIC_VERCEL_URL: z.string().url("Invalid NEXT_PUBLIC_VERCEL_URL"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "Missing NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Missing SUPABASE_SERVICE_ROLE_KEY"),
  UPSTASH_REDIS_REST_URL: z.string().url("Invalid UPSTASH_REDIS_REST_URL").optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
