-- Update mileage columns to use decimal type
ALTER TABLE mileage_logs
  ALTER COLUMN start_mileage TYPE DECIMAL(10,1),
  ALTER COLUMN end_mileage TYPE DECIMAL(10,1),
  ALTER COLUMN total_mileage TYPE DECIMAL(10,1),
  ALTER COLUMN total_business_miles TYPE DECIMAL(10,1),
  ALTER COLUMN total_personal_miles TYPE DECIMAL(10,1);

-- Update existing data to ensure decimal format
UPDATE mileage_logs SET
  start_mileage = start_mileage::DECIMAL(10,1),
  end_mileage = end_mileage::DECIMAL(10,1),
  total_mileage = total_mileage::DECIMAL(10,1),
  total_business_miles = total_business_miles::DECIMAL(10,1),
  total_personal_miles = total_personal_miles::DECIMAL(10,1);
