"use server";

import { revalidatePath } from "next/cache";
import type { MileageLog } from "@/app/actions/mileageGenerator";
import { createClient } from "@/lib/supabaseServerClient";
import { logger } from "@/lib/logger";
import { getBusinessMileageRate } from "@/utils/constants";
import { saveMileageLogAndEntries } from "@/lib/data/mileage";

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
    // Prepare the log data structure expected by the data layer function (RpcLogData)
    const logDataForDb = {
      // user_id is handled by RLS
      // TODO: Get actual log_name from input (update MileageLog interface?)
      log_name: `Log ${mileageLog.start_date} to ${mileageLog.end_date}`,
      year: Number(year),
      start_date: mileageLog.start_date,
      end_date: mileageLog.end_date,
      start_mileage: Number(mileageLog.start_mileage),
      end_mileage: Number(mileageLog.end_mileage),
      total_mileage: Number(mileageLog.total_mileage),
      total_business_miles: totalBusinessMiles,
      total_personal_miles: Number(mileageLog.total_personal_miles),
      business_deduction_rate: businessDeductionRate,
      business_type: mileageLog.business_type, // Add missing property
      business_deduction_amount: businessDeductionAmount,
      vehicle_info: mileageLog.vehicle_info || "My Vehicle",
      // Set log_entries to empty array as per the RPC structure expected by data layer
      log_entries: [] as [], // Explicitly type as empty tuple
    };

    // Prepare entries data, converting null location/business_type to undefined
    const entriesDataForDb = mileageLog.log_entries?.map(entry => ({
      // Map required fields directly
      date: entry.date,
      start_mileage: entry.start_mileage,
      end_mileage: entry.end_mileage,
      miles: entry.miles,
      purpose: entry.purpose,
      type: entry.type,
      vehicle_info: entry.vehicle_info,
      // Convert null to undefined for optional fields expected by RPC type
      location: entry.location ?? undefined,
      business_type: entry.business_type ?? undefined,
    })) ?? []; // Default to empty array if no entries

    // Call the data layer function to save log and entries
    const { data: logId, error } = await saveMileageLogAndEntries(
      supabase, // Pass the client instance
      logDataForDb,
      entriesDataForDb
    );

    if (error) {
      // Log the error from the data layer
      logger.error({ err: error }, "Action: Error saving mileage log via data layer");
      // Throw the error to be caught by the outer catch block
      throw error;
    }

    revalidatePath("/saved-logs");
    return {
      success: true,
      message: "Mileage log saved successfully",
      logId: logId ?? undefined, // Convert null to undefined
    };
  } catch (error) {
    logger.error({ err: error }, "Error saving mileage log");
    return {
      success: false,
      message: "Failed to save mileage log. Please try again.",
    };
  }
}
