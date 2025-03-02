export interface MileageEntry {
  date: string;
  startMileage: string;
  endMileage: string;
  milesDriven: string;
  businessMiles: string;
  destination: string;
  businessPurpose: string;
  recordedAt?: string; // Timestamp when the entry was created
  notes?: string; // Additional notes or circumstances
  attachments?: string[]; // URLs to any attached receipts or documentation
}

export interface MileageLog {
  id: number;
  user_id: string;
  year: string;
  start_date: string;
  end_date: string;
  start_mileage: string;
  end_mileage: string;
  total_mileage: number;
  total_personal_miles: string;
  log_entries: MileageEntry[];
  created_at: string;
  last_modified_at?: string; // Track when the log was last modified
  vehicle_info?: {
    make?: string;
    model?: string;
    year?: string;
    vin?: string;
  }; // Optional vehicle information for better record keeping
}
