-- Create function to save mileage log and entries in a transaction
CREATE OR REPLACE FUNCTION save_mileage_log_with_entries(
    log_data JSONB,
    entries_data JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    -- Start transaction
    BEGIN
        -- Insert the mileage log first
        INSERT INTO mileage_logs (
            user_id,
            year,
            start_date,
            end_date,
            start_mileage,
            end_mileage,
            total_mileage,
            total_business_miles,
            total_personal_miles,
            business_deduction_rate,
            business_deduction_amount,
            vehicle_info
        )
        VALUES (
            (log_data->>'user_id')::UUID,
            (log_data->>'year')::INTEGER,
            (log_data->>'start_date')::DATE,
            (log_data->>'end_date')::DATE,
            (log_data->>'start_mileage')::NUMERIC,
            (log_data->>'end_mileage')::NUMERIC,
            (log_data->>'total_mileage')::NUMERIC,
            (log_data->>'total_business_miles')::NUMERIC,
            (log_data->>'total_personal_miles')::NUMERIC,
            (log_data->>'business_deduction_rate')::NUMERIC,
            (log_data->>'business_deduction_amount')::NUMERIC,
            log_data->'vehicle_info' -- Keep as JSONB
        )
        RETURNING id INTO log_id;

        -- Insert each entry, preserving all realism improvements
        INSERT INTO mileage_log_entries (
            log_id,
            date,
            start_mileage,
            end_mileage,
            miles,
            purpose,
            type,
            vehicle_info,
            business_type,
            location
        )
        SELECT
            log_id,
            (entry->>'date')::DATE,
            (entry->>'start_mileage')::NUMERIC,
            (entry->>'end_mileage')::NUMERIC,
            (entry->>'miles')::NUMERIC,
            entry->>'purpose',
            entry->>'type',
            (entry->>'vehicle_info')::TEXT, -- Convert to TEXT for entries table
            entry->>'business_type',
            entry->>'location'
        FROM jsonb_array_elements(entries_data) AS entry;

        -- Return the log ID
        RETURN log_id;
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction on error
            RAISE EXCEPTION 'Failed to save mileage log: %', SQLERRM;
    END;
END;
$$;