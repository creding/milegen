// lib/data/customBusinessTypes.data.ts
import { SupabaseClient } from "@supabase/supabase-js";
import {
  CustomBusinessType,
  CustomBusinessPurpose,
  CreateCustomBusinessTypeDTO,
  UpdateCustomBusinessTypeDTO,
} from "@/types/custom_business_type";

/**
 * Fetches custom business type IDs and names for a specific user.
 * Assumes RLS is enforced by the client's authentication.
 */
export async function _getCustomBusinessTypes(
  supabase: SupabaseClient,
  userId: string
): Promise<Pick<CustomBusinessType, 'id' | 'name'>[]> {
  const { data, error } = await supabase
    .from("custom_business_types")
    .select("id, name")
    .eq("user_id", userId)
    .order("name");

  if (error) {
    console.error("Data layer - Error fetching custom business types:", error);
    throw error; // Re-throw for the action layer to handle
  }
  return data || [];
}

/**
 * Fetches full details of a specific custom business type for a user.
 * Includes associated purposes.
 * Assumes RLS is enforced by the client's authentication.
 */
export async function _getCustomBusinessTypeDetails(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<CustomBusinessType | null> {
  const { data, error } = await supabase
    .from("custom_business_types")
    .select(`
      id,
      user_id,
      name,
      avg_trips_per_workday,
      created_at,
      custom_business_purposes (*)
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Data layer - Error fetching details:", error);
    throw error;
  }
  
  // Sort purposes consistently
  if (data?.custom_business_purposes) {
    data.custom_business_purposes = data.custom_business_purposes as CustomBusinessPurpose[];
    data.custom_business_purposes.sort((a, b) => 
      a.purpose_name.localeCompare(b.purpose_name)
    );
  }

  return data as CustomBusinessType | null;
}

/**
 * Creates a custom business type and its purposes.
 * WARNING: Needs transactional execution (RPC recommended) for atomicity.
 * This basic version performs separate inserts and is not safe for production.
 */
export async function _createCustomBusinessType(
  supabase: SupabaseClient,
  userId: string,
  typeData: CreateCustomBusinessTypeDTO
): Promise<CustomBusinessType> { // Returns the created type with purposes
  
  console.warn("Data layer - _createCustomBusinessType needs transactional implementation (RPC recommended)");

  // 1. Insert the main type
  const { data: newType, error: typeError } = await supabase
    .from("custom_business_types")
    .insert({
      user_id: userId,
      name: typeData.name,
      avg_trips_per_workday: typeData.avg_trips_per_workday,
    })
    .select()
    .single();

  if (typeError) {
    console.error("Data layer - Error inserting type:", typeError);
    throw typeError;
  }

  // 2. Insert the purposes
  if (typeData.purposes && typeData.purposes.length > 0) {
    const purposesToInsert = typeData.purposes.map((p) => ({
      business_type_id: newType.id,
      purpose_name: p.purpose_name,
      max_distance: p.max_distance,
    }));

    const { error: purposeError } = await supabase
      .from("custom_business_purposes")
      .insert(purposesToInsert);

    if (purposeError) {
      console.error("Data layer - Error inserting purposes:", purposeError);
      // Attempt to roll back (best effort without transaction)
      try {
        await supabase.from("custom_business_types").delete().match({ id: newType.id });
      } catch (rollbackError) {
        console.error("Data layer - Failed to rollback type insertion:", rollbackError);
      } 
      throw purposeError; // Propagate the original error
    }
  }

  // Fetch the complete data including purposes to return
  const finalData = await _getCustomBusinessTypeDetails(supabase, newType.id, userId);
  if (!finalData) {
      throw new Error("Failed to fetch newly created type details.");
  }
  return finalData;
}

/**
 * Updates a custom business type and its purposes.
 * WARNING: Needs transactional execution (RPC recommended).
 */
export async function _updateCustomBusinessType(
  supabase: SupabaseClient,
  userId: string,
  typeData: UpdateCustomBusinessTypeDTO
): Promise<CustomBusinessType> {
  console.warn("Data layer - _updateCustomBusinessType needs transactional implementation (RPC recommended)");
  
  const { id, purposes, ...mainTypeData } = typeData;

  // 1. Update the main type record if necessary
  if (Object.keys(mainTypeData).length > 0) {
    const { error: updateError } = await supabase
      .from('custom_business_types')
      .update(mainTypeData)
      .match({ id: id, user_id: userId }); // Ensure ownership

    if (updateError) {
      console.error("Data layer - Error updating type:", updateError);
      throw updateError;
    }
  }

  // 2. Replace purposes (delete existing, insert new)
  if (purposes) {
    // Delete existing purposes for this type
    const { error: deleteError } = await supabase
      .from('custom_business_purposes')
      .delete()
      .match({ business_type_id: id });

    if (deleteError) {
      console.error("Data layer - Error deleting old purposes:", deleteError);
      // Data is now inconsistent state - transaction needed!
      throw deleteError;
    }

    // Insert new purposes if any
    if (purposes.length > 0) {
       const purposesToInsert = purposes.map((p) => ({
          business_type_id: id,
          // Include id if provided for potential future upsert logic, but insert ignores it here
          purpose_name: p.purpose_name,
          max_distance: p.max_distance,
        }));
        
      const { error: insertError } = await supabase
        .from('custom_business_purposes')
        .insert(purposesToInsert);

      if (insertError) {
        console.error("Data layer - Error inserting new purposes:", insertError);
        // Data is now inconsistent state - transaction needed!
        throw insertError;
      }
    }
  }
  
  // Fetch the complete data including updated purposes to return
  const finalData = await _getCustomBusinessTypeDetails(supabase, id, userId);
   if (!finalData) {
      throw new Error("Failed to fetch updated type details.");
  }
  return finalData;
}

/**
 * Deletes a custom business type (purposes deleted via CASCADE).
 */
export async function _deleteCustomBusinessType(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("custom_business_types")
    .delete()
    .match({ id: id, user_id: userId }); // RLS also enforces

  if (error) {
    console.error("Data layer - Error deleting custom business type:", error);
    throw error;
  }
}
