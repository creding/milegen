"use server";

import { createClient } from "@/lib/supabaseServerClient"; // Use createClient
import {
  _getCustomBusinessTypes,
  _getCustomBusinessTypeDetails,
  _createCustomBusinessType,
  _updateCustomBusinessType,
  _deleteCustomBusinessType
} from "@/lib/data/customBusinessTypes.data"; // Import data layer functions
import {
  CustomBusinessType,
  CreateCustomBusinessTypeDTO,
  UpdateCustomBusinessTypeDTO,
  CustomBusinessPurpose
} from "@/types/custom_business_type";
import { revalidatePath } from "next/cache";

// Define the path to revalidate after CUD operations. Adjust as needed.
const MANAGEMENT_PAGE_PATH = '/settings/business-types'; // Example path

/**
 * Action to fetch all custom business type IDs and names for the current user.
 */
export async function getCustomBusinessTypes(): Promise<{ data: Pick<CustomBusinessType, 'id' | 'name'>[]; error: string | null }> {
  try {
    const supabase = await createClient(); // Use createClient
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { data: [], error: 'User not authenticated' };
    }

    const types = await _getCustomBusinessTypes(supabase, userData.user.id);
    return { data: types, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error("Action Error - getCustomBusinessTypes:", message);
    return { data: [], error: message || 'Failed to fetch custom business types.' };
  }
}

/**
 * Action to fetch the full details of a specific custom business type.
 */
export async function getCustomBusinessTypeDetails(
  id: string
): Promise<{ data: CustomBusinessType | null; error: string | null }> {
  try {
    const supabase = await createClient(); // Use createClient
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { data: null, error: 'User not authenticated' };
    }

    const typeDetails = await _getCustomBusinessTypeDetails(supabase, id, userData.user.id);
    return { data: typeDetails, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error("Action Error - getCustomBusinessTypeDetails:", message);
    return { data: null, error: message || 'Failed to fetch custom business type details.' };
  }
}

/**
 * Action to create a new custom business type and its associated purposes.
 */
export async function createCustomBusinessType(
  typeData: CreateCustomBusinessTypeDTO
): Promise<{ data: CustomBusinessType | null; error: string | null }> {
  try {
    const supabase = await createClient(); // Use createClient
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { data: null, error: 'User not authenticated' };
    }

    const newType = await _createCustomBusinessType(supabase, userData.user.id, typeData);
    revalidatePath(MANAGEMENT_PAGE_PATH); // Revalidate the management page
    revalidatePath('/generator'); // Revalidate the generator page
    return { data: newType, error: null };

  } catch (error: unknown) {
    let message = 'Failed to create custom business type.';
    if (error instanceof Error) {
        message = error.message;
        // Check for specific DB errors
        if (message?.includes('duplicate key value violates unique constraint')) {
            message = 'A custom business type or purpose with this name already exists.';
        }
    }
    console.error("Action Error - createCustomBusinessType:", message);
    return { data: null, error: message };
  }
}

/**
 * Action to update an existing custom business type and its purposes.
 */
export async function updateCustomBusinessType(
  typeData: UpdateCustomBusinessTypeDTO
): Promise<{ data: CustomBusinessType | null; error: string | null }> {
  try {
    const supabase = await createClient(); // Use createClient
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { data: null, error: 'User not authenticated' };
    }

    const updatedType = await _updateCustomBusinessType(supabase, userData.user.id, typeData);
    revalidatePath(MANAGEMENT_PAGE_PATH); // Revalidate
    revalidatePath(`${MANAGEMENT_PAGE_PATH}/${typeData.id}`); // Revalidate specific detail page if exists
    revalidatePath('/generator'); // Revalidate the generator page
    return { data: updatedType, error: null };

  } catch (error: unknown) {
    let message = 'Failed to update custom business type.';
     if (error instanceof Error) {
        message = error.message;
         if (message?.includes('duplicate key value violates unique constraint')) {
            message = 'A purpose with this name already exists for this business type.';
        }
    }
    console.error("Action Error - updateCustomBusinessType:", message);
    return { data: null, error: message };
  }
}

/**
 * Action to delete a custom business type.
 */
export async function deleteCustomBusinessType(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient(); // Use createClient
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if the user owns the type they're trying to delete
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: typeOwnerCheck, error: ownerCheckError } = await supabase
      .from('custom_business_types')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle as it might not exist

    if (ownerCheckError) {
      console.error('Owner check error:', ownerCheckError);
      return { success: false, error: 'Database error checking type ownership.' };
    }

    if (!typeOwnerCheck) {
      return { success: false, error: 'Business type not found or permission denied.' };
    }

    await _deleteCustomBusinessType(supabase, id, userId);
    revalidatePath(MANAGEMENT_PAGE_PATH); // Revalidate the list
    revalidatePath('/generator'); // Revalidate the generator page
    return { success: true, error: null };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error("Action Error - deleteCustomBusinessType:", message);
    return { success: false, error: message || 'Failed to delete custom business type.' };
  }
}

// --- Helper function to get user ID (ensure createClient handles auth) ---
async function getUserId(): Promise<string | null> {
  const supabase = await createClient(); // Await the client
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user.id;
}

// --- Get Purposes for a specific Business Type --- 
export async function getPurposesForBusinessType(businessTypeId: string): Promise<{ data: CustomBusinessPurpose[] | null; error: string | null }> {
  const supabase = await createClient(); // Await the client
  const userId = await getUserId();

  if (!userId) {
    return { data: null, error: 'User not authenticated' };
  }

  if (!businessTypeId) {
     return { data: null, error: 'Business Type ID is required' };
  }

  // First, verify the user owns the parent business type (optional but good practice)
  const { data: typeOwnerCheck, error: ownerCheckError } = await supabase
    .from('custom_business_types')
    .select('id')
    .eq('id', businessTypeId)
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle as it might not exist

  if (ownerCheckError) {
     console.error('Owner check error:', ownerCheckError);
     return { data: null, error: 'Database error checking type ownership.' };
  }

  if (!typeOwnerCheck) {
     return { data: null, error: 'Business type not found or permission denied.' };
  }

  // Fetch the purposes
  const { data, error } = await supabase
    .from('custom_business_purposes') // Assuming this is the table name
    .select('*') // Select all purpose fields
    .eq('business_type_id', businessTypeId);
    // RLS should ideally handle user_id check here if table has user_id
    // If not, add .eq('user_id', userId) if custom_business_purposes has user_id

  if (error) {
    console.error('Error fetching purposes:', error);
    return { data: null, error: 'Failed to fetch purposes for the business type.' };
  }

  return { data, error: null };
}

// TODO: Add actions for createPurpose, updatePurpose, deletePurpose if needed
