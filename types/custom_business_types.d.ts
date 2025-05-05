// /Users/ccreding/milage/milegen/types/custom_business_types.d.ts

// Corresponds to the database table structure for the main type
export interface CustomBusinessType {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  avg_trips_per_workday: number;
  created_at: string; // timestamp with time zone
  // Note: Assuming purposes are handled in a separate table or logic for now
}

// Define the full structure for a purpose (based on TS errors and common patterns)
export interface CustomBusinessPurpose {
  id: string; // uuid
  business_type_id: string; // uuid, foreign key
  purpose_name: string; // Changed from purpose_text based on error
  max_distance: number; // Added based on error
  created_at: string; // timestamp with time zone
}

// DTO for creating a new purpose (associated with a type)
export type CreatePurposeDTO = Omit<CustomBusinessPurpose, 'id' | 'business_type_id' | 'created_at'>;
// { purpose_name: string; max_distance: number; }

// DTO for updating an existing purpose
export type UpdatePurposeDTO = Pick<CustomBusinessPurpose, 'id'> & Partial<Omit<CustomBusinessPurpose, 'id' | 'business_type_id' | 'created_at'>>;
// { id: string; purpose_name?: string; max_distance?: number; }

// DTO for creating a new type
export interface CreateCustomBusinessTypeDTO {
  name: string;
  avg_trips_per_workday: number;
  purposes?: CreatePurposeDTO[]; // Array of purposes to create alongside the type
}

// DTO for updating an existing type
export interface UpdateCustomBusinessTypeDTO {
  id: string;
  name?: string;
  avg_trips_per_workday?: number;
  purposes?: UpdatePurposeDTO[]; // Array of purposes to update
}
