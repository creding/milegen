export interface MileageEntry {
  date: Date;
  start_mileage: number;
  end_mileage: number;
  miles: number;
  purpose: string;
  type: 'business' | 'personal';
  vehicle_info: string;
  business_type?: string;
}

export interface MileageLog {
  start_date: string;
  end_date: string;
  start_mileage: number;
  end_mileage: number;
  total_mileage: number;
  total_business_miles: number;
  total_personal_miles: number;
  business_deduction_rate: number;
  business_deduction_amount: number;
  vehicle_info: string;
  log_entries: MileageEntry[];
  business_type?: string;
}
