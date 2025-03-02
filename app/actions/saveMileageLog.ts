"use server";

import { revalidatePath } from "next/cache";
import type { MileageLog } from "@/types/mileage";
import { createClient } from "@/lib/supabaseServerClient";

export async function saveMileageLog(
  mileageLog: MileageLog
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  try {
    if (!user) {
      throw new Error("User is not logged in");
    }

    const { error } = await supabase.from("mileage_logs").insert({
      user_id: user.id,
      year: mileageLog.year,
      start_date: mileageLog.start_date,
      end_date: mileageLog.end_date,
      start_mileage: mileageLog.start_mileage,
      end_mileage: mileageLog.end_mileage,
      total_mileage: mileageLog.total_mileage,
      total_personal_miles: mileageLog.total_personal_miles,
      log_entries: mileageLog.log_entries,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath("/saved-logs");
    return { success: true, message: "Mileage log saved successfully" };
  } catch (error) {
    console.error("Error saving mileage log:", error);
    return {
      success: false,
      message: "Failed to save mileage log. Please try again.",
    };
  }
}
