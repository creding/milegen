BEGIN;

-- 1. Create the mileage_log_entries table
CREATE TABLE IF NOT EXISTS mileage_log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_id UUID REFERENCES mileage_logs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_mileage NUMERIC(10,1) NOT NULL,
    end_mileage NUMERIC(10,1) NOT NULL,
    miles NUMERIC(10,1) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    vehicle_info TEXT NOT NULL,
    business_type VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_mileage_log_entries_log_id ON mileage_log_entries(log_id);
CREATE INDEX IF NOT EXISTS idx_mileage_log_entries_date ON mileage_log_entries(date);
CREATE INDEX IF NOT EXISTS idx_mileage_log_entries_type ON mileage_log_entries(type);



COMMIT;