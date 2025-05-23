// types/custom_business_type.d.ts

/**
 * Represents a specific purpose associated with a custom business type.
 */
export interface CustomBusinessPurpose {
  id: string; // UUID
  business_type_id: string; // UUID, FK to CustomBusinessType
  purpose_name: string;
  max_distance: number; // Max distance for a trip with this purpose
  frequency_per_day?: number; // Optional: How many times this purpose might occur per day
  created_at: string; // TIMESTAMPTZ as string
}

/**
 * Represents a user-defined business type.
 */
export interface CustomBusinessType {
  id: string; // UUID
  user_id: string; // UUID, FK to auth.users
  name: string;
  avg_trips_per_workday: number;
  created_at: string; // TIMESTAMPTZ as string
  // Optional: Include purposes when fetching details
  custom_business_purposes?: CustomBusinessPurpose[]; 
}

/**
 * Data Transfer Object for creating a new Custom Business Type.
 * Includes nested purposes.
 */
export interface CreateCustomBusinessTypeDTO {
  name: string;
  avg_trips_per_workday: number;
  // Omit will now correctly include frequency_per_day as it's part of CustomBusinessPurpose
  purposes: Array<Omit<CustomBusinessPurpose, 'id' | 'business_type_id' | 'created_at'>>;
}

/**
 * Data Transfer Object for updating a Custom Business Type.
 * Includes the ID and potentially updated fields/purposes.
 */
export interface UpdateCustomBusinessTypeDTO extends Partial<Omit<CustomBusinessType, 'id' | 'user_id' | 'created_at' | 'custom_business_purposes'>> {
  id: string; // ID of the type to update
  // Omit will now correctly include frequency_per_day for purposes being updated/added
  purposes?: (Omit<CustomBusinessPurpose, 'created_at' | 'business_type_id' | 'id'> & { id?: string })[]; 
}
