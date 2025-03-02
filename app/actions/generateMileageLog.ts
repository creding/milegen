"use server";

import { revalidatePath } from "next/cache";
import { HOLIDAYS, getBusinessMileageRate } from "@/utils/constants";
import type { MileageEntry as MileageEntryType, MileageLog } from "@/types/mileage";

const MAX_FREE_ENTRIES = 10;
const BUSINESS_DEDUCTION_RATE = 0.655; // 2023 standard mileage rate

interface MileageParams {
  startMileage: number;
  endMileage: number;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: number;
  location: string;
  vehicle: string;
  businessPurpose: string;
  subscriptionStatus: string;
  currentEntryCount: number;
}

interface WorkdayMileage {
  date: Date;
  startMileage: number;
  endMileage: number;
  dailyMileage: number;
  businessMiles: number;
  personalMiles: number;
  extraMileage: number; // Random personal miles to add between days
}

function getWorkdaysInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const isWeekday = currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
    if (isWeekday) {
      const dateString = currentDate.toISOString().split("T")[0];
      const year = currentDate.getFullYear();
      const isNotHoliday =
        year in HOLIDAYS &&
        !HOLIDAYS[year as keyof typeof HOLIDAYS]?.includes(dateString);

      if (isNotHoliday) {
        dates.push(new Date(currentDate));
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function generateMileageEntries(
  workdays: Date[],
  maxEntries: number,
  totalMiles: number,
  totalPersonalMiles: number,
  startMileage: number
): WorkdayMileage[] {
  console.log("generateMileageEntries params:", {
    workdaysCount: workdays.length,
    maxEntries,
    totalMiles,
    totalPersonalMiles,
    startMileage,
  });
  
  // Take a random subset of workdays if we have more than maxEntries
  let selectedWorkdays = [...workdays];
  if (workdays.length > maxEntries) {
    selectedWorkdays = [];
    const indices = new Set<number>();
    while (indices.size < maxEntries) {
      const index = Math.floor(Math.random() * workdays.length);
      if (!indices.has(index)) {
        indices.add(index);
        selectedWorkdays.push(workdays[index]);
      }
    }
    // Sort by date
    selectedWorkdays.sort((a, b) => a.getTime() - b.getTime());
  }

  console.log("Selected workdays:", selectedWorkdays);

  // Calculate business miles (total - personal)
  const totalBusinessMiles = totalMiles - totalPersonalMiles;
  console.log("Total business miles:", totalBusinessMiles);
  
  // Distribute business miles evenly across workdays
  const businessMilesPerDay = Math.floor(totalBusinessMiles / selectedWorkdays.length);
  let remainingBusinessMiles = totalBusinessMiles % selectedWorkdays.length;
  console.log("Business miles per day:", businessMilesPerDay, "Remaining:", remainingBusinessMiles);

  // Distribute personal miles randomly, ensuring total matches
  let remainingPersonalMiles = totalPersonalMiles;
  console.log("Total personal miles to distribute:", remainingPersonalMiles);

  // Create mileage entries
  const entries: WorkdayMileage[] = [];
  let currentMileage = startMileage;

  for (let i = 0; i < selectedWorkdays.length; i++) {
    // Calculate business miles for this day
    let dayBusinessMiles = businessMilesPerDay;
    if (remainingBusinessMiles > 0) {
      dayBusinessMiles += 1;
      remainingBusinessMiles -= 1;
    }

    // Calculate personal miles for this day
    let dayPersonalMiles = 0;
    if (i < selectedWorkdays.length - 1) {
      // For all days except the last, assign random personal miles
      const maxPersonalForDay = Math.min(
        remainingPersonalMiles,
        Math.ceil(totalPersonalMiles / selectedWorkdays.length * 2)
      );
      dayPersonalMiles = Math.max(0, Math.floor(Math.random() * maxPersonalForDay));
      remainingPersonalMiles -= dayPersonalMiles;
    } else {
      // On the last day, assign all remaining personal miles
      dayPersonalMiles = remainingPersonalMiles;
    }

    // Calculate total miles for the day
    const dayTotalMiles = dayBusinessMiles + dayPersonalMiles;
    
    // Calculate odometer readings
    const dayStartMileage = currentMileage;
    const dayEndMileage = dayStartMileage + dayTotalMiles;
    currentMileage = dayEndMileage;

    entries.push({
      date: selectedWorkdays[i],
      startMileage: Number(dayStartMileage),
      endMileage: Number(dayEndMileage),
      dailyMileage: Number(dayTotalMiles),
      businessMiles: Number(dayBusinessMiles),
      personalMiles: Number(dayPersonalMiles),
      extraMileage: 0, // Not used anymore
    });
  }

  console.log("Generated entries:", entries);
  return entries;
}

function convertToMileageEntry(
  entry: WorkdayMileage,
  currentMileage: number,
  location: string,
  vehicle: string,
  businessPurpose: string
): MileageEntryType {
  const date = entry.date.toISOString().split("T")[0];
  console.log("Entry types before conversion:", {
    startMileage: typeof entry.startMileage,
    endMileage: typeof entry.endMileage,
    dailyMileage: typeof entry.dailyMileage,
    personalMiles: typeof entry.personalMiles,
    businessMiles: typeof entry.businessMiles,
  });
  
  const mileageEntry = {
    date,
    startMileage: Number(entry.startMileage),
    endMileage: Number(entry.endMileage),
    totalMiles: Number(entry.dailyMileage),
    personalMiles: Number(entry.personalMiles),
    businessMiles: Number(entry.businessMiles),
    location,
    vehicle,
    businessPurpose,
    recordedAt: new Date().toISOString(),
  };
  
  console.log("Entry types after conversion:", {
    startMileage: typeof mileageEntry.startMileage,
    endMileage: typeof mileageEntry.endMileage,
    totalMiles: typeof mileageEntry.totalMiles,
    personalMiles: typeof mileageEntry.personalMiles,
    businessMiles: typeof mileageEntry.businessMiles,
  });
  
  return mileageEntry;
}

export async function generateMileageLog({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  location,
  vehicle,
  businessPurpose,
  subscriptionStatus,
  currentEntryCount,
}: MileageParams): Promise<{
  mileageLog: MileageLog;
}> {
  console.log("Starting generateMileageLog with params:", {
    startMileage,
    endMileage,
    startDate,
    endDate,
    totalPersonalMiles,
    location,
    vehicle,
    businessPurpose,
    subscriptionStatus,
    currentEntryCount,
  });

  // Check subscription limits
  const maxEntries =
    subscriptionStatus === "active"
      ? Number.POSITIVE_INFINITY
      : MAX_FREE_ENTRIES;

  if (currentEntryCount >= maxEntries) {
    console.log("Max entries reached:", currentEntryCount, maxEntries);
    throw new Error(
      "You have reached the maximum number of free entries. Please upgrade to continue."
    );
  }

  // Validate input
  if (!startDate || !endDate) {
    console.log("Missing dates:", startDate, endDate);
    throw new Error("Start date and end date are required");
  }

  if (startDate > endDate) {
    console.log("Invalid date range:", startDate, endDate);
    throw new Error("Start date must be before end date");
  }

  const totalMiles = endMileage - startMileage;
  console.log("Total miles calculated:", totalMiles);
  
  if (totalMiles <= 0) {
    console.log("Invalid mileage range:", startMileage, endMileage);
    throw new Error("End mileage must be greater than start mileage");
  }

  if (totalPersonalMiles >= totalMiles) {
    console.log("Personal miles exceed total:", totalPersonalMiles, totalMiles);
    throw new Error("Personal miles cannot exceed total miles");
  }

  // Get workdays in range
  const workdays = getWorkdaysInRange(startDate, endDate);
  console.log("Workdays found:", workdays.length, workdays);
  
  if (workdays.length === 0) {
    console.log("No workdays found in range:", startDate, endDate);
    throw new Error("No workdays found in the selected date range");
  }

  // Generate entries
  console.log("Generating entries with params:", {
    workdaysCount: workdays.length,
    maxEntries: Math.min(workdays.length, maxEntries - currentEntryCount),
    totalMiles,
    totalPersonalMiles,
    startMileage,
  });
  
  const workdayMileages = generateMileageEntries(
    workdays,
    Math.min(workdays.length, maxEntries - currentEntryCount),
    totalMiles,
    totalPersonalMiles,
    startMileage
  );
  
  console.log("Generated workday mileages:", workdayMileages);

  // Convert to MileageEntry objects
  const logEntries: MileageEntryType[] = [];

  for (const entry of workdayMileages) {
    console.log("Converting entry:", entry);
    const mileageEntry = convertToMileageEntry(
      entry,
      0, // Not used anymore
      location,
      vehicle,
      businessPurpose
    );
    console.log("Converted to mileage entry:", mileageEntry);
    logEntries.push(mileageEntry);
  }

  // Calculate business miles and deduction amount
  const totalBusinessMiles = totalMiles - totalPersonalMiles;
  const year = startDate.getFullYear();
  const businessDeductionRate = getBusinessMileageRate(year);
  const businessDeductionAmount = totalBusinessMiles * businessDeductionRate;

  // Create the full mileage log object
  const mileageLog: MileageLog = {
    year: year,
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    start_mileage: startMileage,
    end_mileage: endMileage,
    total_mileage: totalMiles,
    total_business_miles: totalBusinessMiles,
    total_personal_miles: totalPersonalMiles,
    business_deduction_rate: businessDeductionRate,
    business_deduction_amount: businessDeductionAmount,
    vehicle_info: {
      name: vehicle
    },
    log_entries: logEntries
  };

  console.log("Final mileage log:", mileageLog);
  revalidatePath("/generator");
  return {
    mileageLog
  };
}
