import { z } from "zod";
import { createClient } from "../supabaseBrowserClient";
import { Database } from "@/types/database.types"; // Import generated Database type
import { logger } from "@/lib/logger";

// Schema for validating inputs
const paginationSchema = z.object({
  logId: z.string().uuid("Invalid log ID"),
  page: z.number().int().min(1, "Page must be >= 1"),
  pageSize: z.number().int().min(1, "Page size must be >= 1"),
});

type MileageEntry = Database["public"]["Tables"]["mileage_log_entries"]["Row"];

// New function for paginated entries
export async function getPaginatedMileageEntries(
  logId: string,
  page: number,
  pageSize: number
): Promise<{ entries: MileageEntry[]; totalCount: number | null }> {
  // Validate inputs
  const parsedInput = paginationSchema.safeParse({ logId, page, pageSize });
  if (!parsedInput.success) {
    logger.error({ validationErrors: parsedInput.error.errors, logId, page, pageSize }, "Validation error fetching paginated entries");
    return { entries: [], totalCount: null };
  }
  const { logId: validLogId, page: validPage, pageSize: validPageSize } = parsedInput.data;
  const supabase = await createClient();
  const from = (validPage - 1) * validPageSize;
  const to = from + validPageSize - 1;

  try {
    const { data: entries, error, count } = await supabase
      .from("mileage_log_entries")
      .select("*", { count: "exact" })
      .eq("log_id", validLogId)
      .order("date", { ascending: true })
      .range(from, to);

    if (error) {
      const errInfo = {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      };
      logger.error({ ...errInfo, logId: validLogId, page: validPage, pageSize: validPageSize }, "Error fetching paginated mileage entries");
      throw new Error(error.message);
    }

    return { entries: entries || [], totalCount: count };
  } catch (err) {
    if (err instanceof Error) {
      logger.error({ message: err.message, logId: validLogId, page: validPage, pageSize: validPageSize }, "Unexpected error fetching paginated mileage entries");
    } else {
      logger.error({ message: String(err), logId: validLogId, page: validPage, pageSize: validPageSize }, "Unexpected error fetching paginated mileage entries");
    }
    // On failure return empty results with null count
    return { entries: [], totalCount: null };
  }
}
