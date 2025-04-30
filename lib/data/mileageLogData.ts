import { createClient } from "@/lib/supabaseServerClient"; 
import { Database } from '@/types/database.types'; // Import generated Database type

// Use types generated from Supabase schema
type MileageLog = Database['public']['Tables']['mileage_logs']['Row'];
type MileageEntry = Database['public']['Tables']['mileage_log_entries']['Row'];

interface GetLogOptions {
  logId: string;
  page: number;
  pageSize: number;
}

// Define a type for the returned log object including pagination
export type PaginatedMileageLog = MileageLog & {
    log_entries: MileageEntry[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalEntries: number;
        totalPages: number;
    };
};

export async function getSavedMileageLog({
  logId,
  page,
  pageSize,
}: GetLogOptions): Promise<PaginatedMileageLog | null> {
  const supabase = await createClient();

  try {
    // First get the main log data
    const { data: logData, error: logError } = await supabase
      .from("mileage_logs")
      .select()
      .eq("id", logId)
      .single();

    if (logError && logError.code !== 'PGRST116') { // PGRST116 = no rows found, handle as null
      console.error("Error fetching log details:", logError);
      throw new Error(`Failed to fetch log details for ID: ${logId}`);
    }
    if (!logData) {
        console.warn(`Mileage log not found for ID: ${logId}`);
        return null; // Log not found
    }

    // Get total count of entries
    const { count: totalEntries, error: countError } = await supabase
      .from("mileage_log_entries")
      .select("*", { count: "exact", head: true })
      .eq("log_id", logId);

    if (countError) {
        console.error("Error counting log entries:", countError);
        throw new Error(`Failed to count entries for log ID: ${logId}`);
    }

    // Then get paginated entries for this log
    const { data: entriesData, error: entriesError } = await supabase
      .from("mileage_log_entries")
      .select()
      .eq("log_id", logId)
      .order("date")
      .order("start_mileage")
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (entriesError) {
        console.error("Error fetching log entries:", entriesError);
        throw new Error(`Failed to fetch entries for log ID: ${logId}`);
    }

    // Combine the log data with its entries and pagination info
    const paginatedLog: PaginatedMileageLog = {
      ...(logData as MileageLog), // Cast might still be useful but types should align now
      log_entries: (entriesData as MileageEntry[]) || [], // Cast might still be useful
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalEntries: totalEntries || 0,
        totalPages: Math.ceil((totalEntries || 0) / pageSize),
      },
    };

    return paginatedLog;

  } catch (error) {
    console.error("Error in getSavedMileageLog:", error);
    // Re-throw the error to be handled by the caller (e.g., the Page component)
    // Or return null/handle differently based on requirements
    throw error; // Propagate error
  }
}
