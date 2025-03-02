export interface MileageEntry {
  date: string;
  vehicle: string;
  startMileage: number;
  endMileage: number;
  totalMiles: number;
  personalMiles: number;
  businessMiles: number;
  location: string;
  businessPurpose: string;
  recordedAt?: string; // Timestamp when the entry was created
  notes?: string; // Additional notes or circumstances
  attachments?: string[]; // URLs to any attached receipts or documentation
}

export interface MileageLog {
  id?: string; // UUID in the database
  user_id?: string;
  year: string | number;
  start_date: string;
  end_date: string;
  start_mileage: string | number;
  end_mileage: string | number;
  total_mileage: number;
  total_business_miles: number;
  total_personal_miles: number;
  business_deduction_rate?: number;
  business_deduction_amount?: number;
  log_entries: MileageEntry[];
  created_at?: string;
  updated_at?: string;
  vehicle_info?: {
    name: string;
    make?: string;
    model?: string;
    year?: string;
    vin?: string;
  };
}
