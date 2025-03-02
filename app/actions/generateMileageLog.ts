"use server";

import { revalidatePath } from "next/cache";
import { HOLIDAYS } from "@/utils/constants";
import type { MileageEntry as MileageEntryType } from "@/types/mileage";

const MAX_FREE_ENTRIES = 10;

interface MileageParams {
  startMileage: number;
  endMileage: number;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: number;
  destination: string;
  businessPurpose: string;
  subscriptionStatus: string;
  currentEntryCount: number;
}

interface WorkdayMileage {
  date: Date;
  startMileage: number;
  endMileage: number;
  dailyMileage: number;
  personalMiles: number;
  businessMiles: number;
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

function calculateRandomMiles(
  remaining: number,
  min: number,
  max: number,
  isLast: boolean
): number {
  if (isLast) return remaining;
  const amount = Math.floor(min + Math.random() * (max - min));
  return Math.min(remaining, Math.max(1, amount)); // Ensure at least 1 mile
}

function generateMileageEntries(
  workdays: Date[],
  numberOfEntries: number,
  totalMiles: number,
  totalPersonalMiles: number,
  startMileage: number
): WorkdayMileage[] {
  const entries: WorkdayMileage[] = [];
  let currentMileage = startMileage;
  let remainingBusinessMiles = totalMiles - totalPersonalMiles;
  let remainingPersonalMiles = totalPersonalMiles;
  let daysRemaining = numberOfEntries;

  // Calculate average miles to help with distribution
  const avgBusinessPerDay = remainingBusinessMiles / numberOfEntries;
  const avgPersonalPerDay = remainingPersonalMiles / numberOfEntries;

  for (let i = 0; i < workdays.length && remainingBusinessMiles > 0; i++) {
    const isLastEntry = daysRemaining === 1;
    const isWeekend = workdays[i].getDay() === 0 || workdays[i].getDay() === 6;

    // Calculate business miles for this day
    // On weekends, tend towards lower business miles
    const businessMin = isWeekend
      ? Math.max(1, avgBusinessPerDay * 0.3)
      : Math.max(2, avgBusinessPerDay * 0.5);
    const businessMax = isWeekend
      ? Math.max(15, avgBusinessPerDay * 0.7)
      : Math.max(30, avgBusinessPerDay * 1.5);

    const businessMiles = calculateRandomMiles(
      remainingBusinessMiles,
      businessMin,
      businessMax,
      isLastEntry
    );

    // Skip days with no business miles
    if (businessMiles === 0) continue;

    // Calculate personal miles for this day
    // On weekends, tend towards higher personal miles
    const personalMin = isWeekend
      ? Math.max(5, avgPersonalPerDay * 0.8)
      : Math.max(2, avgPersonalPerDay * 0.3);
    const personalMax = isWeekend
      ? Math.max(100, avgPersonalPerDay * 2)
      : Math.max(30, avgPersonalPerDay * 1.2);

    const personalMiles = !isLastEntry
      ? calculateRandomMiles(
          remainingPersonalMiles,
          personalMin,
          personalMax,
          false
        )
      : remainingPersonalMiles;

    entries.push({
      date: workdays[i],
      startMileage: currentMileage,
      endMileage: currentMileage + businessMiles,
      dailyMileage: businessMiles,
      personalMiles: personalMiles,
      businessMiles: businessMiles,
      extraMileage: personalMiles,
    });

    // Update running totals
    currentMileage += businessMiles + personalMiles;
    remainingBusinessMiles -= businessMiles;
    remainingPersonalMiles -= personalMiles;
    daysRemaining--;
  }

  return entries;
}

function convertToMileageEntry(
  entry: WorkdayMileage,
  currentMileage: number,
  destination: string,
  businessPurpose: string
): MileageEntryType {
  return {
    date: entry.date.toISOString().split("T")[0],
    startMileage: entry.startMileage.toString(),
    endMileage: entry.endMileage.toString(),
    milesDriven: entry.businessMiles.toString(),
    businessMiles: entry.businessMiles.toString(),
    destination: destination || "Various locations",
    businessPurpose: businessPurpose || "Business travel",
    recordedAt: new Date().toISOString(),
  };
}

export async function generateMileageLog({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  destination,
  businessPurpose,
  subscriptionStatus,
  currentEntryCount,
}: MileageParams): Promise<{
  mileageLog: MileageEntryType[];
  totalMileage: number;
}> {
  // Check subscription limits
  const maxEntries =
    subscriptionStatus === "active"
      ? Number.POSITIVE_INFINITY
      : MAX_FREE_ENTRIES;

  if (currentEntryCount >= maxEntries) {
    throw new Error(
      "You have reached the maximum number of free entries. Please upgrade to continue."
    );
  }

  // Validate input
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  if (startDate > endDate) {
    throw new Error("Start date must be before end date");
  }

  const totalMiles = endMileage - startMileage;
  if (totalMiles <= 0) {
    throw new Error("End mileage must be greater than start mileage");
  }

  if (totalPersonalMiles >= totalMiles) {
    throw new Error("Personal miles cannot exceed total miles");
  }

  // Get workdays in range
  const workdays = getWorkdaysInRange(startDate, endDate);
  if (workdays.length === 0) {
    throw new Error("No workdays found in the selected date range");
  }

  // Generate entries
  const mileageEntries = generateMileageEntries(
    workdays,
    Math.min(workdays.length, maxEntries - currentEntryCount),
    totalMiles,
    totalPersonalMiles,
    startMileage
  );

  // Convert to final format
  const mileageLog = mileageEntries.map((entry) => {
    return convertToMileageEntry(entry, 0, destination, businessPurpose);
  });
  revalidatePath("/generator");
  return {
    mileageLog,
    totalMileage: totalMiles,
  };
}
