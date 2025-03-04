"use server";

import { revalidatePath } from "next/cache";
import type { MileageLog } from "@/types/mileage";
import { createClient } from "@/lib/supabaseServerClient";
import { getBusinessMileageRate } from "@/utils/constants";

export async function saveMileageLog(
  mileageLog: MileageLog
): Promise<{ success: boolean; message: string; logId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  try {
    if (!user) {
      throw new Error("User is not logged in");
    }

    console.log("Saving mileage log:", mileageLog);

    // Get the year from the log start date
    const year = new Date(mileageLog.start_date).getFullYear();

    // Get the appropriate business deduction rate for the year
    const businessDeductionRate =
      mileageLog.business_deduction_rate || getBusinessMileageRate(year);

    // Calculate the business deduction amount
    const totalBusinessMiles = Number(mileageLog.total_business_miles);
    const businessDeductionAmount = totalBusinessMiles * businessDeductionRate;

    // Ensure all numeric values are properly converted
    const preparedLog = {
      user_id: user.id,
      year: Number(year),
      start_date: mileageLog.start_date,
      end_date: mileageLog.end_date,
      start_mileage: Number(mileageLog.start_mileage),
      end_mileage: Number(mileageLog.end_mileage),
      total_mileage: Number(mileageLog.total_mileage),
      total_business_miles: totalBusinessMiles,
      total_personal_miles: Number(mileageLog.total_personal_miles),
      business_deduction_rate: businessDeductionRate,
      business_deduction_amount: businessDeductionAmount,
      vehicle_info: mileageLog.vehicle_info || "My Vehicle",
      log_entries: mileageLog.log_entries,
    };

    // Insert the mileage log with all fields
    const { data, error } = await supabase
      .from("mileage_logs")
      .insert(preparedLog)
      .select("id")
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    revalidatePath("/saved-logs");
    return {
      success: true,
      message: "Mileage log saved successfully",
      logId: data.id,
    };
  } catch (error) {
    console.error("Error saving mileage log:", error);
    return {
      success: false,
      message: "Failed to save mileage log. Please try again.",
    };
  }
}
