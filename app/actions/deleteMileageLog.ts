"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function deleteMileageLog(logId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from("mileage_logs").delete().eq("id", logId).eq("user_id", userId)

    if (error) throw error

    revalidatePath("/saved-logs")
    return { success: true, message: "Mileage log deleted successfully." }
  } catch (error) {
    console.error("Error deleting mileage log:", error)
    return { success: false, message: "Failed to delete mileage log. Please try again." }
  }
}
