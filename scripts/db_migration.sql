-- Reset and create mileage_logs table with the new schema
-- Run this script in the Supabase SQL Editor

-- Drop the existing table if it exists
DROP TABLE IF EXISTS mileage_logs;

-- Create the table with the new schema
CREATE TABLE mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_mileage INTEGER NOT NULL,
    end_mileage INTEGER NOT NULL,
    total_mileage INTEGER NOT NULL,
    total_business_miles INTEGER NOT NULL,
    total_personal_miles INTEGER NOT NULL,
    business_deduction_rate DECIMAL NOT NULL DEFAULT 0.67, -- 2024 standard mileage rate
    business_deduction_amount DECIMAL NOT NULL,
    vehicle_info JSONB NOT NULL DEFAULT '{"name": "My Vehicle"}',
    log_entries JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own logs
CREATE POLICY "Users can view their own logs" 
ON mileage_logs FOR SELECT 
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own logs
CREATE POLICY "Users can insert their own logs" 
ON mileage_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own logs
CREATE POLICY "Users can update their own logs" 
ON mileage_logs FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own logs
CREATE POLICY "Users can delete their own logs" 
ON mileage_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Create an index on user_id for faster queries
CREATE INDEX mileage_logs_user_id_idx ON mileage_logs (user_id);

-- Create an index on year for faster filtering
CREATE INDEX mileage_logs_year_idx ON mileage_logs (year);

-- Create an index on created_at for sorting
CREATE INDEX mileage_logs_created_at_idx ON mileage_logs (created_at);
