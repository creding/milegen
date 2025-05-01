"use server";

import { revalidatePath } from "next/cache";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { createClient } from "@/lib/supabaseServerClient";
import { logger } from "@/lib/logger";
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
      // log_entries will be saved separately in the mileage_log_entries table
      log_entries: mileageLog.log_entries, // Keep this temporarily for the RPC function
    };

    // Start a transaction to save both log and entries
    const { data, error } = await supabase.rpc(
      "save_mileage_log_with_entries",
      {
        log_data: {
          year: preparedLog.year,
          start_date: preparedLog.start_date,
          end_date: preparedLog.end_date,
          start_mileage: preparedLog.start_mileage,
          end_mileage: preparedLog.end_mileage,
          total_mileage: preparedLog.total_mileage,
          total_business_miles: preparedLog.total_business_miles,
          total_personal_miles: preparedLog.total_personal_miles,
          business_deduction_rate: preparedLog.business_deduction_rate,
          business_deduction_amount: preparedLog.business_deduction_amount,
          vehicle_info: preparedLog.vehicle_info,
          // Set log_entries to empty array since we're using the new table
          log_entries: [],
        },
        entries_data: preparedLog.log_entries,
      }
    );

    if (error) {
      logger.error({ err: error }, "Database error saving mileage log");
      throw error;
    }

    revalidatePath("/saved-logs");
    return {
      success: true,
      message: "Mileage log saved successfully",
      logId: data,
    };
  } catch (error) {
    logger.error({ err: error }, "Error saving mileage log");
    return {
      success: false,
      message: "Failed to save mileage log. Please try again.",
    };
  }
}
