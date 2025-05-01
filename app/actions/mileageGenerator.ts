"use server";

import { addDays, format, isWeekend } from "date-fns";
import { BUSINESS_TYPES } from "@/utils/mileageUtils"; // Assuming BUSINESS_TYPES is static data
import { HOLIDAYS, getBusinessMileageRate } from "@/utils/constants"; // Assuming HOLIDAYS is static data
import {
  getBusinessLocation,
  getPersonalLocation,
} from "@/utils/locationUtils";
import { saveMileageLog } from "./saveMileageLog"; // Assuming this exists
import { isHoliday } from "@/utils/mileageUtils"; // Import isHoliday function
import { createClient } from "@/lib/supabaseServerClient"; // Corrected import path
import { Tables } from "@/types/database.types";
import { mileageGeneratorParamsSchema } from "@/features/mileage-generator/utils/inputValidation.utils";
import { logger } from "@/lib/logger";

// --- Interfaces ---

interface MileageGeneratorParams {
  startDate: Date;
  endDate: Date;
  startMileage: number;
  endMileage: number;
  vehicle: string;
  businessType?: string;
  subscriptionStatus: string; // Keep for subscription logic
  currentEntryCount?: number; // Keep if used elsewhere, not used in generation itself
  totalPersonalMiles: number;
}

export interface MileageLog {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_mileage: number;
  end_mileage: number;
  total_mileage: number;
  total_business_miles: number;
  total_personal_miles: number;
  business_deduction_rate: number;
  business_deduction_amount: number;
  vehicle_info: string;
  business_type: string;
  id?: string;
  user_id?: string;
  // Temporarily hold entries for saving; remove before final storage if needed
  log_entries?: Tables<"mileage_log_entries">[];
}

interface DailyMileage {
  date: Date;
  targetMiles: number;
  targetBusinessMiles: number;
  isWorkday: boolean;
}

// --- Configuration ---

const CONFIG = {
  // Realistic trip lengths (adjust as needed)
  MILES_PER_TRIP: {
    business: {
      min: 2.3,
      max: 25.7,
    },
    personal: {
      min: 1.8,
      max: 40.4,
    },
  },
  // Mileage distribution parameters
  MILEAGE_DISTRIBUTION: {
    // Ratio of personal miles driven on workdays vs. non-workdays
    PERSONAL_ON_WORKDAYS_RATIO: 0.3,
    // Random variation added/subtracted from daily calculated averages
    BUSINESS_MILES_VARIATION: 0.1, // +/- 10%
    WORKDAY_PERSONAL_MILES_VARIATION: 0.2, // +/- 20%
    NON_WORKDAY_PERSONAL_MILES_VARIATION: 0.3, // +/- 30%
    // Chance to have zero miles on a non-workday
    NON_WORKDAY_SKIP_CHANCE: 0.2, // 20% chance
  },
  // Rounding precision
  DECIMAL_PLACES: 1,
  // Smallest mileage increment for distributing remainders
  REMAINDER_INCREMENT: 0.1,
  // Floating point precision threshold
  FLOAT_PRECISION_THRESHOLD: 0.01,
  // Default business type if not provided
  DEFAULT_BUSINESS_TYPE: "General Business",
};

// --- Helper Functions ---

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @param array Array to shuffle.
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

/**
 * Selects a random business purpose based on the business type.
 * Assumes BUSINESS_TYPES is a static array.
 * @param businessType The category of business.
 * @returns A random purpose string.
 */
function getRandomBusinessPurpose(businessType: string): string {
  const type = BUSINESS_TYPES.find((t) => t.name === businessType);
  if (type?.purposes?.length) {
    return type.purposes[Math.floor(Math.random() * type.purposes.length)];
  }
  // Fallback if type not found or has no purposes
  return "Business Meeting";
}

/**
 * Rounds miles to the configured number of decimal places.
 * @param miles The number of miles.
 * @returns Rounded miles.
 */
function roundMiles(miles: number): number {
  return Number(miles.toFixed(CONFIG.DECIMAL_PLACES));
}

// --- Core Generation Functions ---

/**
 * Generates the main mileage log structure and its entries.
 * @param startDate The starting date of the log period.
 * @param endDate The ending date of the log period.
 * @param startMileage The starting odometer reading.
 * @param endMileage The ending odometer reading.
 * @param businessType The type of business.
 * @param vehicleInfo Description of the vehicle used.
 * @param totalPersonalMiles The user-specified total personal miles for the period.
 * @returns A Promise resolving to the generated MileageLog object.
 */
async function generateMileageLog(
  startDate: Date,
  endDate: Date,
  startMileage: number,
  endMileage: number,
  businessType: string,
  vehicleInfo: string,
  totalPersonalMiles: number
): Promise<MileageLog> {
  const totalMileage = roundMiles(endMileage - startMileage);
  const targetBusinessMiles = roundMiles(totalMileage - totalPersonalMiles);

  // Ensure targets are non-negative after calculation
  if (targetBusinessMiles < 0 || totalPersonalMiles < 0) {
    throw new Error(
      "Calculated negative miles (business or personal). Check inputs."
    );
  }

  const dailyMileageTargets = distributeMileageAcrossDays(
    startDate,
    endDate,
    totalMileage,
    targetBusinessMiles,
    totalPersonalMiles
  );

  const entries: Tables<"mileage_log_entries">[] = [];
  let currentMileage = startMileage;

  for (const dailyTarget of dailyMileageTargets) {
    // Skip days with zero target miles explicitly
    if (dailyTarget.targetMiles <= CONFIG.FLOAT_PRECISION_THRESHOLD) {
      continue;
    }

    const tripsForDay = generateTripsForDay(
      dailyTarget.date,
      dailyTarget.targetMiles,
      dailyTarget.targetBusinessMiles,
      currentMileage,
      businessType,
      vehicleInfo
    );

    entries.push(...tripsForDay);
    // Ensure end mileage of the last trip matches the start of the next day's target
    if (tripsForDay.length > 0) {
      currentMileage = roundMiles(
        tripsForDay[tripsForDay.length - 1].end_mileage
      );
    } else {
      // If no trips were generated (shouldn't happen with targetMiles > 0), mileage doesn't advance
      currentMileage = roundMiles(currentMileage);
    }
  }

  // Recalculate totals from generated entries for accuracy
  const finalTotalBusinessMiles = roundMiles(
    entries.reduce(
      (sum, entry) => sum + (entry.type === "business" ? entry.miles : 0),
      0
    )
  );
  const finalTotalPersonalMiles = roundMiles(
    totalMileage - finalTotalBusinessMiles
  );

  // Get the correct mileage rate based on the log's end date year
  const logEndDateYear = endDate.getFullYear();
  const businessRate = getBusinessMileageRate(logEndDateYear); // Assumes getBusinessMileageRate handles the year correctly

  // Create the final log object
  const log: MileageLog = {
    start_date: format(startDate, "yyyy-MM-dd"),
    end_date: format(endDate, "yyyy-MM-dd"),
    start_mileage: startMileage,
    // Adjust end_mileage slightly if rounding caused drift, though recalculating from entries is better
    end_mileage: roundMiles(
      startMileage + finalTotalBusinessMiles + finalTotalPersonalMiles
    ),
    total_mileage: roundMiles(
      finalTotalBusinessMiles + finalTotalPersonalMiles
    ),
    total_business_miles: finalTotalBusinessMiles,
    total_personal_miles: finalTotalPersonalMiles,
    business_deduction_rate: businessRate,
    business_deduction_amount: roundMiles(
      businessRate * finalTotalBusinessMiles
    ),
    vehicle_info: vehicleInfo,
    business_type: businessType,
    log_entries: entries, // Keep entries for saving
  };

  // Final validation check
  const calculatedEndMileage = roundMiles(
    log.start_mileage + log.total_mileage
  );
  if (
    Math.abs(calculatedEndMileage - log.end_mileage) >
    CONFIG.REMAINDER_INCREMENT
  ) {
    // Allow small tolerance
    logger.error(
      `Final calculated end mileage (${calculatedEndMileage}) differs slightly from target end mileage (${log.end_mileage}). Adjusting log end mileage.`
    );
    log.end_mileage = calculatedEndMileage;
  }

  return log;
}

/**
 * Distributes total business and personal miles across the days in the period.
 * Prioritizes business miles on workdays and personal miles more on non-workdays.
 * Handles remainders by distributing small increments.
 * @param startDate Start date.
 * @param endDate End date.
 * @param totalMileage Total miles for the period.
 * @param targetBusinessMiles Target business miles for the period.
 * @param totalPersonalMiles Target personal miles for the period.
 * @returns An array of daily mileage targets.
 */
function distributeMileageAcrossDays(
  startDate: Date,
  endDate: Date,
  totalMileage: number,
  targetBusinessMiles: number,
  totalPersonalMiles: number
): DailyMileage[] {
  let currentDate = new Date(startDate);
  const dates: { date: Date; isWorkday: boolean; isHoliday: boolean }[] = []; // Add isHoliday flag

  // 1. Generate all dates in the range and mark workdays/non-workdays/holidays
  while (currentDate <= endDate) {
    const holidayCheck = isHoliday(currentDate, HOLIDAYS); // Pass HOLIDAYS constant
    dates.push({
      date: new Date(currentDate),
      isWorkday: !isWeekend(currentDate) && !holidayCheck, // Treat holidays like non-workdays
      isHoliday: holidayCheck, // Store holiday status
    });
    currentDate = addDays(currentDate, 1);
  }

  // Separate workdays and non-workdays (including holidays)
  const workdays = dates.filter((d) => d.isWorkday);
  const nonWorkdays = dates.filter((d) => !d.isWorkday);

  // Handle edge case: no workdays in the period
  if (workdays.length === 0 && targetBusinessMiles > 0) {
    logger.error(
      "Warning: No workdays found in the selected period, distributing business miles across all days."
    );
    // Treat all days as workdays for business mile distribution if necessary
    workdays.push(...dates);
    nonWorkdays.length = 0;
  }

  // 2. Calculate base daily mileage distribution
  let dailyBusinessMilesAvg = 0;
  if (workdays.length > 0) {
    dailyBusinessMilesAvg = targetBusinessMiles / workdays.length;
  } else if (targetBusinessMiles > CONFIG.FLOAT_PRECISION_THRESHOLD) {
    logger.error(
      `Target business miles (${targetBusinessMiles}) specified, but no workdays found in the date range. Business miles cannot be assigned.`
    );
    // Potentially throw an error here if business miles are mandatory
    targetBusinessMiles = 0; // Cannot assign these miles
  }

  // Distribute personal miles, adjusting if no workdays or non-workdays exist
  const personalWorkdayRatio =
    nonWorkdays.length === 0
      ? 1.0
      : CONFIG.MILEAGE_DISTRIBUTION.PERSONAL_ON_WORKDAYS_RATIO;
  const personalNonWorkdayRatio =
    workdays.length === 0 ? 1.0 : 1.0 - personalWorkdayRatio;

  const workdayPersonalMilesAvg =
    workdays.length > 0
      ? (totalPersonalMiles * personalWorkdayRatio) / workdays.length
      : 0;
  const nonWorkdayPersonalMilesAvg =
    nonWorkdays.length > 0
      ? (totalPersonalMiles * personalNonWorkdayRatio) / nonWorkdays.length
      : 0;

  let totalBusinessAssigned = 0;
  let totalPersonalAssigned = 0;
  const tempTargets: {
    date: Date;
    targetMiles: number;
    targetBusinessMiles: number;
    isWorkday: boolean;
  }[] = [];

  // 3. Generate initial daily targets with variation
  dates.forEach((day) => {
    // Assume loop variable is 'day'
    let dailyBusinessMiles = 0;
    let dailyPersonalMiles = 0;
    const distConfig = CONFIG.MILEAGE_DISTRIBUTION;

    if (day.isWorkday && workdays.length > 0) {
      // Assign business miles with variation
      const businessVariation = distConfig.BUSINESS_MILES_VARIATION;
      dailyBusinessMiles = Math.max(
        0,
        dailyBusinessMilesAvg *
          (1 - businessVariation + Math.random() * 2 * businessVariation)
      );

      // Assign some personal miles with variation
      const personalVariation = distConfig.WORKDAY_PERSONAL_MILES_VARIATION;
      dailyPersonalMiles = Math.max(
        0,
        workdayPersonalMilesAvg *
          (1 - personalVariation + Math.random() * 2 * personalVariation)
      );
    } else if (!day.isWorkday && nonWorkdays.length > 0) {
      // *** Explicitly ensure business miles are 0 for non-workdays ***
      dailyBusinessMiles = 0;

      // Assign more personal miles on non-workdays with variation
      const personalVariation = distConfig.NON_WORKDAY_PERSONAL_MILES_VARIATION;
      dailyPersonalMiles = Math.max(
        0,
        nonWorkdayPersonalMilesAvg *
          (1 - personalVariation + Math.random() * 2 * personalVariation)
      );

      // Randomly skip some non-workdays entirely
      if (Math.random() < distConfig.NON_WORKDAY_SKIP_CHANCE) {
        dailyPersonalMiles = 0;
      }
    } else {
      // Handle edge cases where only workdays or only non-workdays exist and personal miles need assigning
      if (day.isWorkday && workdays.length > 0 && nonWorkdays.length === 0) {
        // All personal miles on workdays
        const personalVariation = distConfig.WORKDAY_PERSONAL_MILES_VARIATION;
        dailyPersonalMiles = Math.max(
          0,
          workdayPersonalMilesAvg *
            (1 - personalVariation + Math.random() * 2 * personalVariation)
        );
      } else if (
        !day.isWorkday &&
        nonWorkdays.length > 0 &&
        workdays.length === 0
      ) {
        // *** Explicitly ensure business miles are 0 for non-workdays in edge case ***
        dailyBusinessMiles = 0;

        // All personal miles on non-workdays
        const personalVariation =
          distConfig.NON_WORKDAY_PERSONAL_MILES_VARIATION;
        dailyPersonalMiles = Math.max(
          0,
          nonWorkdayPersonalMilesAvg *
            (1 - personalVariation + Math.random() * 2 * personalVariation)
        );
        if (Math.random() < distConfig.NON_WORKDAY_SKIP_CHANCE) {
          dailyPersonalMiles = 0;
        }
      }
    }

    // Round individual components before summing
    dailyBusinessMiles = roundMiles(dailyBusinessMiles);
    dailyPersonalMiles = roundMiles(dailyPersonalMiles);

    // Ensure we don't exceed overall targets yet (remainders handled later)
    const tempBusinessTotal = roundMiles(
      totalBusinessAssigned + dailyBusinessMiles
    );
    if (tempBusinessTotal > targetBusinessMiles) {
      dailyBusinessMiles = roundMiles(
        Math.max(0, targetBusinessMiles - totalBusinessAssigned)
      );
    }

    const tempPersonalTotal = roundMiles(
      totalPersonalAssigned + dailyPersonalMiles
    );
    if (tempPersonalTotal > totalPersonalMiles) {
      dailyPersonalMiles = roundMiles(
        Math.max(0, totalPersonalMiles - totalPersonalAssigned)
      );
    }

    const totalMiles = roundMiles(dailyBusinessMiles + dailyPersonalMiles);
    tempTargets.push({
      date: day.date,
      targetMiles: totalMiles,
      targetBusinessMiles: dailyBusinessMiles,
      isWorkday: day.isWorkday,
    });

    totalBusinessAssigned = roundMiles(
      totalBusinessAssigned + dailyBusinessMiles
    );
    totalPersonalAssigned = roundMiles(
      totalPersonalAssigned + dailyPersonalMiles
    );
  });

  // 4. Distribute remaining miles due to rounding/variation
  let remainingBusiness = roundMiles(
    targetBusinessMiles - totalBusinessAssigned
  );
  let remainingPersonal = roundMiles(
    totalPersonalMiles - totalPersonalAssigned
  );
  const increment = CONFIG.REMAINDER_INCREMENT;
  const precision = CONFIG.FLOAT_PRECISION_THRESHOLD;

  // Distribute remaining business miles across workdays
  const workdayIndices = tempTargets
    .map((t, i) => (t.isWorkday ? i : -1))
    .filter((i) => i !== -1);
  let currentWorkdayIdx = 0;
  while (remainingBusiness > precision && workdayIndices.length > 0) {
    const targetIdx = workdayIndices[currentWorkdayIdx % workdayIndices.length];
    tempTargets[targetIdx].targetMiles = roundMiles(
      tempTargets[targetIdx].targetMiles + increment
    );
    tempTargets[targetIdx].targetBusinessMiles = roundMiles(
      tempTargets[targetIdx].targetBusinessMiles + increment
    );
    remainingBusiness = roundMiles(remainingBusiness - increment);
    currentWorkdayIdx++;
  }

  // Distribute remaining personal miles across *any* day (cycling through)
  const allDayIndices = tempTargets.map((_, i) => i);
  let currentDayIdx = 0;
  while (remainingPersonal > precision && allDayIndices.length > 0) {
    const targetIdx = allDayIndices[currentDayIdx % allDayIndices.length];
    // Only add personal miles; business miles for the day remain fixed
    tempTargets[targetIdx].targetMiles = roundMiles(
      tempTargets[targetIdx].targetMiles + increment
    );
    // Note: We don't add to targetBusinessMiles here
    remainingPersonal = roundMiles(remainingPersonal - increment);
    currentDayIdx++;
  }

  // --- Final Adjustments & Holiday Check ---
  // Explicitly set business miles to ZERO for all holidays to avoid floating point issues
  tempTargets.forEach((target) => {
    if (isHoliday(target.date, HOLIDAYS)) {
      target.targetBusinessMiles = 0;
      // Recalculate targetMiles if business miles were zeroed out
      target.targetMiles = roundMiles(
        target.targetMiles - target.targetBusinessMiles
      ); // Should subtract 0 if already 0
    }
  });

  return tempTargets;
}

/**
 * Generates individual trips (business and personal) for a single day
 * to match the target miles for that day. Trips are shuffled randomly.
 * @param date The date of the trips.
 * @param targetMiles Total miles to generate for the day.
 * @param targetBusinessMiles Business miles to generate for the day.
 * @param startMileage Odometer reading at the start of the day.
 * @param businessType The category of business.
 * @param vehicleInfo Description of the vehicle.
 * @returns An array of mileage entries for the day.
 */
function generateTripsForDay(
  date: Date,
  targetMiles: number,
  targetBusinessMiles: number,
  startMileage: number,
  businessType: string,
  vehicleInfo: string
): Tables<"mileage_log_entries">[] {
  const trips: Tables<"mileage_log_entries">[] = [];
  let currentMileage = startMileage;
  const targetPersonalMiles = roundMiles(targetMiles - targetBusinessMiles);

  const businessConfig = CONFIG.MILES_PER_TRIP.business;
  const personalConfig = CONFIG.MILES_PER_TRIP.personal;
  const precision = CONFIG.FLOAT_PRECISION_THRESHOLD;

  // Generate business trips only if there's a non-negligible amount
  if (targetBusinessMiles > precision) {
    let remainingBusiness = targetBusinessMiles;
    while (remainingBusiness > precision) {
      let miles = roundMiles(
        businessConfig.min +
          Math.random() * (businessConfig.max - businessConfig.min)
      );
      // Ensure last trip uses exactly the remaining miles, and prevent tiny trips
      if (
        remainingBusiness <= businessConfig.max ||
        remainingBusiness - miles < precision
      ) {
        miles = remainingBusiness;
      }
      miles = Math.max(CONFIG.REMAINDER_INCREMENT, miles); // Ensure minimum trip length

      const endM = roundMiles(currentMileage + miles);
      const purpose = getRandomBusinessPurpose(businessType);
      const location = getBusinessLocation(
        purpose,
        roundMiles(miles),
        businessType
      );
      trips.push({
        date: date.toISOString().split("T")[0], // Format Date
        type: "business",
        miles: roundMiles(miles),
        purpose: purpose, // Use generated purpose
        start_mileage: roundMiles(currentMileage),
        end_mileage: endM,
        vehicle_info: vehicleInfo,
        business_type: businessType,
        // Add missing fields
        id: "", // Placeholder ID
        location: location,
        created_at: null,
        updated_at: null,
        log_id: null,
      });

      remainingBusiness = roundMiles(remainingBusiness - miles);
      currentMileage = endM;
    }
  }

  // Generate personal trips
  let remainingPersonal = targetPersonalMiles;
  while (remainingPersonal > precision) {
    let miles = roundMiles(
      personalConfig.min +
        Math.random() * (personalConfig.max - personalConfig.min)
    );
    if (
      remainingPersonal <= personalConfig.max ||
      remainingPersonal - miles < precision
    ) {
      miles = remainingPersonal;
    }
    miles = Math.max(CONFIG.REMAINDER_INCREMENT, miles); // Ensure minimum trip length

    const endM = roundMiles(currentMileage + miles);
    const personalPurpose = "Personal";
    const personalLocation = getPersonalLocation(
      personalPurpose,
      roundMiles(miles)
    );
    trips.push({
      date: date.toISOString().split("T")[0], // Format Date
      type: "personal",
      miles: roundMiles(miles),
      purpose: personalPurpose, // Standard purpose for personal trips
      start_mileage: roundMiles(currentMileage),
      end_mileage: endM,
      vehicle_info: vehicleInfo,
      business_type: businessType, // Often good to keep context even for personal
      // Add missing fields
      id: "", // Placeholder ID
      location: personalLocation,
      created_at: null,
      updated_at: null,
      log_id: null,
    });

    remainingPersonal = roundMiles(remainingPersonal - miles);
    currentMileage = endM;
  }

  // Shuffle the generated trips for the day for better realism
  shuffleArray(trips);

  // Recalculate start/end mileage based on shuffled order
  let runningMileage = startMileage;
  for (const trip of trips) {
    trip.start_mileage = roundMiles(runningMileage);
    trip.end_mileage = roundMiles(runningMileage + trip.miles);
    runningMileage = trip.end_mileage;
  }

  return trips;
}

// --- Main Export Function (Entry Point) ---

export interface GenerateLogResult {
  logId?: string;
  success: boolean;
  message?: string;
}

/**
 * Handles form input, validates, generates the mileage log, applies subscription limits,
 * and saves the result.
 * @param params Input parameters from the form/client.
 * @returns A result object indicating success or failure.
 */
export async function generateMileageLogFromForm(
  params: MileageGeneratorParams
): Promise<GenerateLogResult> {
  // Input validation via Zod
  const validation = mileageGeneratorParamsSchema.safeParse(params);
  if (!validation.success) {
    const message = validation.error.errors.map((e) => e.message).join(", ");
    return { success: false, message };
  }
  const {
    startDate,
    endDate,
    startMileage,
    endMileage,
    totalPersonalMiles,
    vehicle,
    businessType = CONFIG.DEFAULT_BUSINESS_TYPE,
    subscriptionStatus,
  } = validation.data;

  try {
    // --- Core Logic ---
    const log = await generateMileageLog(
      // Now uses await as generateMileageLog is async
      startDate,
      endDate,
      startMileage,
      endMileage,
      businessType,
      vehicle,
      totalPersonalMiles
    );

    // Ensure log_entries exists (should always exist now unless error thrown)
    if (!log.log_entries) {
      // This case might indicate an error during generation that wasn't caught
      logger.error(
        "Log generation finished but log_entries array is missing."
      );
      return {
        success: false,
        message: "Internal error: Failed to generate log entries.",
      };
    }

    // --- Subscription Limiting ---
    if (subscriptionStatus !== "active") {
      const limit = 10;
      const totalEntries = log.log_entries.length;
      if (totalEntries > limit) {
        const limitedEntries = log.log_entries.slice(0, limit);
        // Add note to the *last entry shown*
        if (limitedEntries.length > 0) {
          const remainingCount = totalEntries - limit;
          limitedEntries[
            limit - 1
          ].purpose += ` (... and ${remainingCount} more entries available with subscription)`;
        }
        log.log_entries = limitedEntries;
        // Optional: Adjust summary figures if needed based on limited entries,
        // but typically you'd show the *potential* full log summary
        // and just limit the visible entries. For this example, we keep summary figs.
      }
    }

    // --- Saving ---
    const saveResult = await saveMileageLog(log); // Assuming saveMileageLog handles DB interaction
    return {
      logId: saveResult.logId, // Assuming saveResult provides these
      success: saveResult.success,
      message: saveResult.message,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Error during mileage log generation or saving");
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: `Generation failed: ${errorMessage}`,
    };
  }
}

/**
 * Fetches a specific page of mileage log entries for a given log ID.
 * Designed for use with React Query's useInfiniteQuery.
 * @param logId - The UUID of the mileage log.
 * @param pageParam - The starting row index for the page (offset).
 * @param pageSize - The number of entries per page.
 * @returns An object containing the entries for the page and the next page parameter.
 */
export async function getLogEntriesPage(
  logId: string,
  pageParam: number = 0, // Default to page 0 (offset 0)
  pageSize: number = 25 // Default page size
): Promise<{
  entries: Tables<"mileage_log_entries">[];
  nextPageParam: number | null;
}> {
  "use server";

  // Add await here
  const supabase = await createClient();

  const startIndex = pageParam;
  const endIndex = pageParam + pageSize - 1;

  const {
    data: entries,
    error,
    count,
  } = await supabase
    .from("mileage_log_entries") // Corrected table name
    .select("*", { count: "exact" }) // Fetch count for total calculation
    .eq("log_id", logId)
    .order("date", { ascending: true }) // Ensure consistent ordering
    .order("created_at", { ascending: true }) // Secondary sort for stability
    .range(startIndex, endIndex);

  if (error) {
    logger.error("Error fetching log entries page:", error);
    throw new Error(`Failed to fetch log entries: ${error.message}`);
  }

  // Determine if there's a next page
  const nextPageParam = endIndex + 1 < (count ?? 0) ? endIndex + 1 : null;

  return {
    entries: entries || [],
    nextPageParam,
  };
}
