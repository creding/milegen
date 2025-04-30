"use server";

import { createClient } from "@/lib/supabaseServerClient";
import { Tables } from "@/types/database.types";

/**
 * Fetches all saved mileage logs for the currently authenticated user.
 * 
 * @returns {Promise<Tables<'mileage_logs'>[]>} A promise that resolves to an array of mileage log objects.
 *          Returns an empty array if there's no user or an error occurs.
 */
export async function getUserSavedLogs(): Promise<Tables<'mileage_logs'>[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Return empty array if no user is found or there's an error fetching the user
  if (userError || !user) {
    console.error("Error fetching user or no user logged in:", userError);
    return [];
  }

  // Get saved logs for the user
  const { data, error } = await supabase
    .from("mileage_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Handle potential errors during log fetching
  if (error) {
    console.error("Error fetching saved logs:", error);
    return []; 
  }

  // Return the fetched logs, or an empty array if data is null/undefined
  return data || [];
}
