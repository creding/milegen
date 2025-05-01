import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { Tables } from "@/types/database.types";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database.types";

// Extract the specific argument types for cleaner usage
type SaveMileageLogArgs = Database["public"]["Functions"]["save_mileage_log_with_entries"]["Args"];
type RpcLogDataType = SaveMileageLogArgs["log_data"];
type RpcEntriesDataType = SaveMileageLogArgs["entries_data"];

/**
 * Define MileageLog type locally based on the generated types
 */
type MileageLog = Tables<"mileage_logs">;

/**
 * Fetches all mileage logs for a specific user, ordered by creation date descending.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user whose logs are to be fetched.
 * @returns A promise resolving to an object containing the data or an error.
 */
export async function fetchAllMileageLogsByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: MileageLog[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error({ err: error, userId }, "Error fetching all mileage logs");
      return { data: null, error: error };
    }
    return { data, error: null };
  } catch (error) {
    logger.error(
      { err: error, userId },
      "Unexpected error fetching all mileage logs"
    );
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching logs"),
    };
  }
}

/**
 * Fetches a single mileage log by its ID, ensuring it belongs to the specified user.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user who should own the log.
 * @param logId - The UUID of the mileage log to fetch.
 * @returns A promise resolving to an object containing the log data or an error.
 */
export async function fetchMileageLogById(
  supabase: SupabaseClient,
  userId: string,
  logId: string
): Promise<{ data: MileageLog | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("mileage_logs")
      .select("*")
      .eq("id", logId)
      .eq("user_id", userId)
      .single();

    if (error) {
      // Don't log 'PGRST116' (resource not found) as an error, it's expected if ID is wrong
      if (error.code !== "PGRST116") {
        logger.error(
          { err: error, userId, logId },
          "Error fetching single mileage log"
        );
      }
      return { data: null, error: error };
    }
    return { data, error: null };
  } catch (error) {
    logger.error(
      { err: error, userId, logId },
      "Unexpected error fetching single mileage log"
    );
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error fetching log"),
    };
  }
}

/**
 * Saves a mileage log and its associated entries using an RPC function.
 *
 * @param supabase - The Supabase client instance.
 * @param logData - The prepared data for the mileage_logs table.
 * @param entriesData - The array of entry data for the mileage_log_entries table.
 * @returns The ID of the newly created log or an error object.
 */
export async function saveMileageLogAndEntries(
  supabase: SupabaseClient<Database>,
  logData: RpcLogDataType,
  entriesData: RpcEntriesDataType
): Promise<{ data: string | null; error: PostgrestError | null }> {
  try {
    // With regenerated types, direct call should work without 'as any'
    const { data, error } = await supabase.rpc("save_mileage_log_with_entries", {
      log_data: logData, // Ensure this matches the structure in RpcLogDataType
      entries_data: entriesData, // Ensure this matches the structure in RpcEntriesDataType
    });

    if (error) {
      logger.error({ err: error }, "Data Layer: Error saving mileage log via RPC");
      return { data: null, error };
    }

    // Type checking for the return value (should be string based on generated types)
    if (typeof data !== 'string') {
        logger.warn({ responseData: data }, "Data Layer: RPC returned unexpected type, expected string ID.");
        // Decide how to handle - return error or try to coerce? For now, return error.
        return {
            data: null,
            error: {
                message: "RPC did not return a valid log ID string.",
                details: `Expected string, received ${typeof data}`,
                hint: "Check the RPC function implementation.",
                code: "RPC_INVALID_RESPONSE_TYPE",
            } as PostgrestError,
        };
    }

    return { data, error: null };
  } catch (err) {
    // Catch potential errors during the RPC call itself (e.g., network issues)
    logger.error(
      { err },
      "Data Layer: Exception during save_mileage_log_with_entries RPC call"
    );
    const error =
      err instanceof Error ? err : new Error("Unknown error during RPC call");
    return {
      data: null,
      error: {
        message: error.message,
        details: "",
        hint: "",
        code: "RPC_EXECUTION_ERROR",
      } as PostgrestError,
    };
  }
}
