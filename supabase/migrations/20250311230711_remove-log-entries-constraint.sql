-- Update mileage_logs table to remove not-null constraint on log_entries
-- This is part of our migration to a dedicated mileage_log_entries table
-- while preserving all realism improvements (trip clustering, geographic coherence, etc.)

ALTER TABLE mileage_logs
  ALTER COLUMN log_entries DROP NOT NULL,
  -- Set default to empty array to maintain compatibility
  ALTER COLUMN log_entries SET DEFAULT '[]'::jsonb;

-- Add comment explaining the change
COMMENT ON COLUMN mileage_logs.log_entries IS 
  'Legacy field maintained for backward compatibility. New entries are stored in mileage_log_entries table with improved realism features.';
