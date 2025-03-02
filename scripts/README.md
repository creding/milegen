# Database Setup Instructions

This directory contains scripts to set up the database schema for the Milegen application.

## Setting Up the Database Schema

The `db_migration.sql` file contains SQL statements to create a fresh database schema for the mileage log structure. Follow these steps to run the script:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `db_migration.sql` into the SQL Editor
4. Run the script

## What the Script Does

The script:

1. Drops the existing `mileage_logs` table if it exists
2. Creates a new `mileage_logs` table with the proper schema:
   - `id`: UUID primary key
   - `user_id`: References the auth.users table
   - `year`: Integer for filtering by year
   - `start_date` and `end_date`: Date range for the log
   - `start_mileage` and `end_mileage`: Odometer readings
   - `total_mileage`: Total miles driven
   - `total_business_miles`: Business miles driven
   - `total_personal_miles`: Personal miles driven
   - `business_deduction_rate`: Standard mileage rate (default: 0.67 for 2024)
   - `business_deduction_amount`: Calculated deduction amount
   - `vehicle_info`: JSONB column for vehicle information
   - `log_entries`: JSONB column for individual mileage entries
   - `created_at` and `updated_at`: Timestamps

3. Sets up Row Level Security (RLS) policies to ensure users can only access their own logs
4. Creates indexes for better query performance

## Business Mileage Rates

The application uses the IRS standard mileage rates for business travel to calculate deduction amounts:

- 2020: $0.575 per mile
- 2021: $0.56 per mile
- 2022: $0.585 per mile
- 2023: $0.655 per mile
- 2024: $0.67 per mile

These rates are defined in the `utils/constants.ts` file and are automatically applied based on the year of the mileage log. The system will:

1. Use the appropriate rate for the year of the log
2. Calculate the business deduction amount by multiplying the business miles by the rate
3. Store both the rate and the calculated amount in the database

When the IRS announces new rates for future years, only the constants file needs to be updated.

## Verifying the Setup

After running the script, you can verify that it was successful by:

1. Navigating to the Table Editor in Supabase
2. Selecting the `mileage_logs` table
3. Confirming that the table has the expected structure

## Note

This script will delete any existing mileage logs in the database. Only run it if you're starting fresh or have backed up any important data.
