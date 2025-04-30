import { createClient } from "../supabaseBrowserClient";
import { Database } from "@/types/database.types"; // Import generated Database type

type MileageEntry = Database["public"]["Tables"]["mileage_log_entries"]["Row"];

// New function for paginated entries
export async function getPaginatedMileageEntries(
  logId: string,
  page: number,
  pageSize: number
): Promise<{ entries: MileageEntry[]; totalCount: number | null }> {
  const supabase = await createClient();
  console.log(`Fetching entries for logId: ${logId}, page: ${page}, pageSize: ${pageSize}`); // Log input
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const {
      data: entries,
      error,
      count,
    } = await supabase
      .from("mileage_log_entries")
      .select("*", { count: "exact" }) // Fetch entries and total count
      .eq("log_id", logId) // Correct column name for filtering
      .order("date", { ascending: true }) // Order by date, oldest first
      .range(from, to); // Fetch the specific page range

    if (error) {
      console.error(
        "Error fetching paginated mileage entries. Raw error:", 
        error, 
        "Stringified:", 
        JSON.stringify(error, null, 2)
      );
      throw error; // Re-throw the error to be handled by the caller
    }

    return {
      entries: entries || [], // Return empty array if data is null
      totalCount: count, // Return the total count
    };
  } catch (error) {
    console.error("Supabase query failed:", error);
    // Return a default error state or re-throw
    return { entries: [], totalCount: 0 }; // Or handle error more robustly
  }
}
