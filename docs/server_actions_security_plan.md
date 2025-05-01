# Server Actions Security Plan

This document outlines a structured plan to harden and secure all server actions in the mileage log generator app.

## 1. Environment & Key Management
- **Issue**: Banged non-null `process.env` keys, exposure of secrets via `NEXT_PUBLIC_*`.
- **Action**:
  - Validate and load all env vars on startup (using zod/envsafe).
  - Move private keys to `NEXT_PRIVATE_*` or keep only in `.env`.
  - Throw clear errors if any required key is missing.
- **Status**: ✅ Completed

## 2. Supabase Client Usage
- **Issue**: Direct service-role client in `deleteMileageLog`, bypassing RLS.
- **Action**:
  - Centralize every server action to use `createClient()` from `lib/supabaseServerClient.ts`.
  - Remove any `@supabase/supabase-js` client instantiation with service keys.
  - Enforce RLS policies via `auth.uid()`.
- **Status**: ✅ Completed

## 3. RPC & User Identity
- **Issue**: `saveMileageLog` RPC accepts `user_id` from client payload.
- **Action**:
  - Remove `user_id` parameter from RPC payload.
  - Update Postgres function `save_mileage_log_with_entries` to inherit `auth.uid()` as owner.
- **Status**: ✅ Completed

## 4. Input Validation
- **Issue**: Casting `FormData` fields without validation.
- **Action**:
  - Introduce Zod schemas for each server-action input (`loginAction`, `signUpAction`, etc.).
  - Validate types, lengths, email formats, boolean fields.
- **Status**: ✅ Completed

## 5. Error Handling & Information Leakage
- **Issue**: Raw `console.error` and stack leaks to logs.
- **Action**:
  - Standardize error logging (e.g., structured logger like pino).
  - Sanitize messages returned to client, avoid stack traces.
- **Status**: ✅ Completed

## 6. Rate-Limiting & Abuse Protection
- **Issue**: No throttle on critical endpoints (login, signup, RPC).
- **Action**:
  - Implement rate limiting via Next.js middleware or edge functions (e.g., Upstash limits).
  - Block brute-force attempts on auth actions.

## 7. CSP & Security Headers
- **Issue**: No explicit security headers.
- **Action**:
  - Add CSP, HSTS, X-Frame-Options in `next.config.js` or custom middleware.
  - **Status**: ✅ Completed
  - Audit headers for all routes.

## 8. Testing & Policy Verification
- **Issue**: No tests for RLS or input schemas.
- **Action**:
  - Write integration tests that attempt unauthorized deletes/updates.
  - Add unit tests for Zod schema validations.
  - Review Supabase RLS policies to ensure correct scoping.
