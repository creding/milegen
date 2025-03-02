-- Add terms of service acceptance tracking to users table
ALTER TABLE public.users 
ADD COLUMN terms_accepted_at timestamp with time zone,
ADD COLUMN terms_version text;

-- Add a check constraint to ensure terms are accepted for new users
ALTER TABLE public.users
ADD CONSTRAINT terms_acceptance_required 
CHECK (
    (created_at < '2025-03-01' OR (terms_accepted_at IS NOT NULL AND terms_version IS NOT NULL))
);

-- Create an index for querying by terms acceptance
CREATE INDEX idx_users_terms_acceptance ON public.users(terms_accepted_at);

COMMENT ON COLUMN public.users.terms_accepted_at IS 'Timestamp when the user accepted the terms of service';
COMMENT ON COLUMN public.users.terms_version IS 'Version of the terms of service that was accepted';
