"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServerClient";

export async function deleteMileageLog(
  logId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("mileage_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/saved-logs");
    return { success: true, message: "Mileage log deleted successfully." };
  } catch (error) {
    console.error("Error deleting mileage log:", error);
    return {
      success: false,
      message: "Failed to delete mileage log. Please try again.",
    };
  }
}
