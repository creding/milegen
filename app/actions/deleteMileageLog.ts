"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabaseServerClient"
import { deleteSavedMileageLog } from "@/lib/data/mileageLogData";
import { logger } from "@/lib/logger";
import { z } from "zod";

const idSchema = z.string().uuid("Invalid log ID");

export async function deleteMileageLog(logId: string): Promise<{ success: boolean; message: string }> {
  const parsed = idSchema.safeParse(logId);
  if (!parsed.success) {
    return { success: false, message: `Validation error: ${parsed.error.errors.map(e => e.message).join(", ")}` };
  }
  const validLogId = parsed.data;

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, message: "User not authenticated." }
  }

  try {
    // Delegate deletion to data layer
    await deleteSavedMileageLog(validLogId, user.id);

    revalidatePath("/saved-logs")
    return { success: true, message: "Mileage log deleted successfully." }
  } catch (error) {
    logger.error({ err: error }, "Error deleting mileage log");
    return { success: false, message: "Failed to delete mileage log. Please try again." }
  }
}
