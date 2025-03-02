import { MileageEntry, MileageLog } from "@/types/mileage";

/**
 * Migrates legacy mileage log entries to the new format
 * This is needed because the database may contain entries with the old structure
 */
export function migrateLegacyEntries(mileageLog: MileageLog): MileageLog {
  // Create a deep copy to avoid mutating the original
  const updatedLog: MileageLog = JSON.parse(JSON.stringify(mileageLog));
  
  // Ensure total_business_miles exists
  if (updatedLog.total_business_miles === undefined) {
    updatedLog.total_business_miles = 
      updatedLog.total_mileage - Number(updatedLog.total_personal_miles);
  }
  
  // Ensure business_deduction_rate exists
  if (updatedLog.business_deduction_rate === undefined) {
    updatedLog.business_deduction_rate = 0.655; // 2023 standard mileage rate
  }
  
  // Ensure business_deduction_amount exists
  if (updatedLog.business_deduction_amount === undefined) {
    updatedLog.business_deduction_amount = 
      updatedLog.total_business_miles * updatedLog.business_deduction_rate;
  }
  
  // Ensure vehicle_info exists
  if (updatedLog.vehicle_info === undefined) {
    updatedLog.vehicle_info = { name: "My Vehicle" };
  }
  
  // Migrate each entry
  updatedLog.log_entries = updatedLog.log_entries.map((entry: any): MileageEntry => {
    const updatedEntry: MileageEntry = {
      date: entry.date,
      startMileage: Number(entry.startMileage),
      endMileage: Number(entry.endMileage),
      totalMiles: entry.totalMiles !== undefined 
        ? Number(entry.totalMiles) 
        : entry.milesDriven !== undefined 
          ? Number(entry.milesDriven) 
          : Number(entry.endMileage) - Number(entry.startMileage),
      businessMiles: entry.businessMiles !== undefined 
        ? Number(entry.businessMiles) 
        : Number(entry.milesDriven),
      personalMiles: entry.personalMiles !== undefined 
        ? Number(entry.personalMiles) 
        : 0,
      location: entry.location || entry.destination || "",
      vehicle: entry.vehicle || updatedLog.vehicle_info.name || "",
      businessPurpose: entry.businessPurpose || "Business travel",
      recordedAt: entry.recordedAt || new Date().toISOString(),
    };
    
    return updatedEntry;
  });
  
  return updatedLog;
}

/**
 * Checks if a mileage log needs migration
 */
export function needsMigration(mileageLog: MileageLog): boolean {
  if (mileageLog.total_business_miles === undefined) return true;
  if (mileageLog.business_deduction_rate === undefined) return true;
  if (mileageLog.business_deduction_amount === undefined) return true;
  if (mileageLog.vehicle_info === undefined) return true;
  
  // Check if any entries need migration
  if (mileageLog.log_entries.some((entry: any) => 
    entry.totalMiles === undefined || 
    entry.location === undefined ||
    entry.vehicle === undefined ||
    entry.personalMiles === undefined
  )) {
    return true;
  }
  
  return false;
}
