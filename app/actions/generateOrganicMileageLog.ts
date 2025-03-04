"use server";

import { revalidatePath } from "next/cache";
import {
  HOLIDAYS,
  getBusinessMileageRate,
  MAX_FREE_ENTRIES,
} from "@/utils/constants";
import type {
  MileageEntry as MileageEntryType,
  MileageLog,
} from "@/types/mileage";
import {
  type MileageParams,
  type DailyMileageDistribution,
  type TripEntry,
  roundToOneDecimal,
  roundToTwoDecimals,
  getAllDatesInRange,
  isWorkday,
  getRandomInt,
  getRandomBusinessPurpose,
  getRandomPersonalPurpose,
  BUSINESS_TYPES,
} from "@/utils/mileageUtils";

// Generate a distribution of trips across the date range
function generateDailyDistribution(
  dates: Date[],
  totalBusinessMiles: number,
  totalPersonalMiles: number,
  startMileage: number,
  businessType?: string
): DailyMileageDistribution[] {
  // Verify we have valid dates to work with
  if (dates.length === 0) {
    console.error("No dates provided for mileage distribution");
    return [];
  }

  // Sort dates chronologically
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

  // Create a weighted distribution of miles across days
  // Workdays get more business miles, weekends get more personal miles
  const dailyDistributions: DailyMileageDistribution[] = [];

  // Calculate workday count for business miles distribution
  const workdays = dates.filter((date) => isWorkday(date));
  const weekends = dates.filter((date) => !isWorkday(date));

  // Allocate business miles: 90% to workdays, 10% to weekends
  let remainingBusinessMiles = totalBusinessMiles;
  let remainingPersonalMiles = totalPersonalMiles;

  // Business miles distribution
  const workdayBusinessMiles = roundToOneDecimal(totalBusinessMiles * 0.9);
  const weekendBusinessMiles = roundToOneDecimal(totalBusinessMiles * 0.1);

  // Personal miles distribution - 40% to workdays, 60% to weekends
  const workdayPersonalMiles = roundToOneDecimal(totalPersonalMiles * 0.4);
  const weekendPersonalMiles = roundToOneDecimal(totalPersonalMiles * 0.6);

  // Average miles per day
  const avgWorkdayBusinessMiles =
    workdays.length > 0
      ? roundToOneDecimal(workdayBusinessMiles / workdays.length)
      : 0;
  const avgWeekendBusinessMiles =
    weekends.length > 0
      ? roundToOneDecimal(weekendBusinessMiles / weekends.length)
      : 0;
  const avgWorkdayPersonalMiles =
    workdays.length > 0
      ? roundToOneDecimal(workdayPersonalMiles / workdays.length)
      : 0;
  const avgWeekendPersonalMiles =
    weekends.length > 0
      ? roundToOneDecimal(weekendPersonalMiles / weekends.length)
      : 0;

  // Current odometer reading
  let currentMileage = startMileage;

  // Distribute miles across days with some randomness
  for (const date of dates) {
    const isWorkDay = isWorkday(date);

    // Determine how many business and personal miles for this day
    let dayBusinessMiles = 0;
    let dayPersonalMiles = 0;

    if (isWorkDay) {
      // Workday - more business miles, fewer personal miles
      // Add some randomness: 70-130% of average
      const businessVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      const personalVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

      dayBusinessMiles = roundToOneDecimal(
        Math.min(
          remainingBusinessMiles,
          avgWorkdayBusinessMiles * businessVariation
        )
      );
      dayPersonalMiles = roundToOneDecimal(
        Math.min(
          remainingPersonalMiles,
          avgWorkdayPersonalMiles * personalVariation
        )
      );
    } else {
      // Weekend - more personal miles, fewer business miles
      // Add some randomness: 70-130% of average
      const businessVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      const personalVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

      dayBusinessMiles = roundToOneDecimal(
        Math.min(
          remainingBusinessMiles,
          avgWeekendBusinessMiles * businessVariation
        )
      );
      dayPersonalMiles = roundToOneDecimal(
        Math.min(
          remainingPersonalMiles,
          avgWeekendPersonalMiles * personalVariation
        )
      );
    }

    // Update remaining miles
    remainingBusinessMiles = roundToOneDecimal(
      remainingBusinessMiles - dayBusinessMiles
    );
    remainingPersonalMiles = roundToOneDecimal(
      remainingPersonalMiles - dayPersonalMiles
    );

    // Generate trips for this day
    const businessTrips: TripEntry[] = [];
    const personalTrips: TripEntry[] = [];

    // Distribute business miles into 1-4 trips
    if (dayBusinessMiles > 0) {
      let businessMilesLeft = dayBusinessMiles;
      const numBusinessTrips = getRandomInt(
        1,
        Math.min(4, Math.ceil(dayBusinessMiles / 5))
      );

      for (let i = 0; i < numBusinessTrips; i++) {
        let tripMiles: number;

        if (i === numBusinessTrips - 1) {
          // Last trip gets all remaining miles
          tripMiles = roundToOneDecimal(businessMilesLeft);
        } else {
          // Random portion of remaining miles (between 20-60%)
          const portion = 0.2 + Math.random() * 0.4;
          tripMiles = roundToOneDecimal(businessMilesLeft * portion);
          businessMilesLeft = roundToOneDecimal(businessMilesLeft - tripMiles);
        }

        if (tripMiles > 0) {
          const tripStartMileage = roundToOneDecimal(currentMileage);
          const tripEndMileage = roundToOneDecimal(
            tripStartMileage + tripMiles
          );

          businessTrips.push({
            startMileage: tripStartMileage,
            endMileage: tripEndMileage,
            miles: tripMiles,
            purpose: getRandomBusinessPurpose(businessType),
          });

          currentMileage = tripEndMileage;
        }
      }
    }

    // Distribute personal miles into 1-2 trips
    if (dayPersonalMiles > 0) {
      let personalMilesLeft = dayPersonalMiles;
      const numPersonalTrips = getRandomInt(
        1,
        Math.min(2, Math.ceil(dayPersonalMiles / 5))
      );

      for (let i = 0; i < numPersonalTrips; i++) {
        let tripMiles: number;

        if (i === numPersonalTrips - 1) {
          // Last trip gets all remaining miles
          tripMiles = roundToOneDecimal(personalMilesLeft);
        } else {
          // Random portion of remaining miles (between 30-70%)
          const portion = 0.3 + Math.random() * 0.4;
          tripMiles = roundToOneDecimal(personalMilesLeft * portion);
          personalMilesLeft = roundToOneDecimal(personalMilesLeft - tripMiles);
        }

        if (tripMiles > 0) {
          const tripStartMileage = roundToOneDecimal(currentMileage);
          const tripEndMileage = roundToOneDecimal(
            tripStartMileage + tripMiles
          );

          personalTrips.push({
            startMileage: tripStartMileage,
            endMileage: tripEndMileage,
            miles: tripMiles,
            purpose: getRandomPersonalPurpose(),
          });

          currentMileage = tripEndMileage;
        }
      }
    }

    // Interleave business and personal trips for more natural ordering
    if (businessTrips.length > 0 && personalTrips.length > 0) {
      // 70% chance to start with business trip on workdays, 30% on weekends
      const startWithBusiness = Math.random() < (isWorkDay ? 0.7 : 0.3);

      if (!startWithBusiness) {
        // Move a personal trip to the beginning
        const firstPersonalTrip = personalTrips.shift();
        if (firstPersonalTrip) {
          // Adjust mileage for all trips
          const mileageOffset =
            firstPersonalTrip.endMileage - businessTrips[0].startMileage;

          // Adjust business trips
          for (const trip of businessTrips) {
            trip.startMileage = roundToOneDecimal(
              trip.startMileage + mileageOffset
            );
            trip.endMileage = roundToOneDecimal(
              trip.endMileage + mileageOffset
            );
          }

          // Adjust remaining personal trips
          for (const trip of personalTrips) {
            trip.startMileage = roundToOneDecimal(
              trip.startMileage + mileageOffset
            );
            trip.endMileage = roundToOneDecimal(
              trip.endMileage + mileageOffset
            );
          }

          personalTrips.unshift(firstPersonalTrip);
        }
      }
    }

    dailyDistributions.push({
      date,
      businessTrips,
      personalTrips,
      totalBusinessMiles: roundToOneDecimal(dayBusinessMiles),
      totalPersonalMiles: roundToOneDecimal(dayPersonalMiles),
    });
  }

  // Distribute remaining business miles iteratively
  while (remainingBusinessMiles > 0) {
    for (const day of dailyDistributions) {
      if (remainingBusinessMiles <= 0) break;
      if (day.businessTrips.length > 0) {
        // Add to existing trip if possible
        day.businessTrips[0].miles = roundToOneDecimal(
          day.businessTrips[0].miles + 0.1
        );
        day.businessTrips[0].endMileage = roundToOneDecimal(
          day.businessTrips[0].endMileage + 0.1
        );
        day.totalBusinessMiles = roundToOneDecimal(
          day.totalBusinessMiles + 0.1
        );
        remainingBusinessMiles = roundToOneDecimal(
          remainingBusinessMiles - 0.1
        );
        currentMileage = roundToOneDecimal(currentMileage + 0.1);
      } else {
        // Create a new trip if needed.
        const tripStartMileage = roundToOneDecimal(currentMileage);
        const tripEndMileage = roundToOneDecimal(tripStartMileage + 0.1);
        day.businessTrips.push({
          startMileage: tripStartMileage,
          endMileage: tripEndMileage,
          miles: 0.1,
          purpose: getRandomBusinessPurpose(businessType),
        });
        day.totalBusinessMiles = roundToOneDecimal(
          day.totalBusinessMiles + 0.1
        );
        remainingBusinessMiles = roundToOneDecimal(
          remainingBusinessMiles - 0.1
        );
        currentMileage = tripEndMileage;
      }
    }
  }

  // Distribute remaining personal miles iteratively
  while (remainingPersonalMiles > 0) {
    for (const day of dailyDistributions) {
      if (remainingPersonalMiles <= 0) break;
      if (day.personalTrips.length > 0) {
        day.personalTrips[0].miles = roundToOneDecimal(
          day.personalTrips[0].miles + 0.1
        );
        day.personalTrips[0].endMileage = roundToOneDecimal(
          day.personalTrips[0].endMileage + 0.1
        );
        day.totalPersonalMiles = roundToOneDecimal(
          day.totalPersonalMiles + 0.1
        );
        remainingPersonalMiles = roundToOneDecimal(
          remainingPersonalMiles - 0.1
        );
        currentMileage = roundToOneDecimal(currentMileage + 0.1);
      } else {
        const tripStartMileage = roundToOneDecimal(currentMileage);
        const tripEndMileage = roundToOneDecimal(tripStartMileage + 0.1);
        day.personalTrips.push({
          startMileage: tripStartMileage,
          endMileage: tripEndMileage,
          miles: 0.1,
          purpose: getRandomPersonalPurpose(),
        });
        day.totalPersonalMiles = roundToOneDecimal(
          day.totalPersonalMiles + 0.1
        );
        remainingPersonalMiles = roundToOneDecimal(
          remainingPersonalMiles - 0.1
        );
        currentMileage = tripEndMileage;
      }
    }
  }

  return dailyDistributions;
}

// Convert daily distributions to MileageEntry objects
function convertToMileageEntries(
  distributions: DailyMileageDistribution[],
  vehicle: string,
  businessType?: string
): MileageEntryType[] {
  const entries: MileageEntryType[] = [];

  // Process each day's distribution
  for (const day of distributions) {
    const date = day.date;

    // Process business trips
    for (const trip of day.businessTrips) {
      entries.push({
        date: new Date(date),
        start_mileage: trip.startMileage,
        end_mileage: trip.endMileage,
        miles: trip.miles,
        purpose: trip.purpose,
        type: "business",
        vehicle_info: vehicle,
        business_type: businessType,
      });
    }

    // Process personal trips
    for (const trip of day.personalTrips) {
      entries.push({
        date: new Date(date),
        start_mileage: trip.startMileage,
        end_mileage: trip.endMileage,
        miles: trip.miles,
        purpose: trip.purpose,
        type: "personal",
        vehicle_info: vehicle,
      });
    }
  }

  // Sort entries by date and start_mileage
  return entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return a.start_mileage - b.start_mileage;
  });
}

export async function generateOrganicMileageLog({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  vehicle,
  businessType,
  subscriptionStatus,
  currentEntryCount,
}: MileageParams): Promise<{
  mileageLog: MileageLog;
}> {
  console.log("Starting generateOrganicMileageLog with params:", {
    startMileage,
    endMileage,
    startDate,
    endDate,
    totalPersonalMiles,
    vehicle,
    businessType,
    subscriptionStatus,
    currentEntryCount,
  });

  // Validate inputs
  if (!startDate || !endDate) {
    throw new Error("Start and end dates are required");
  }

  // Check subscription status for entry limits
  if (
    subscriptionStatus !== "active" &&
    currentEntryCount >= MAX_FREE_ENTRIES
  ) {
    throw new Error(
      "You have reached the maximum number of free entries. Please subscribe to generate more mileage logs."
    );
  }

  // Calculate total miles
  const totalMiles = endMileage - startMileage;
  if (totalMiles <= 0) {
    throw new Error("End mileage must be greater than start mileage");
  }

  // Ensure personal miles doesn't exceed total miles
  if (totalPersonalMiles > totalMiles) {
    throw new Error("Personal miles cannot exceed total miles");
  }

  // Calculate business miles
  const totalBusinessMiles = totalMiles - totalPersonalMiles;

  // Get all dates in the range
  const dates = getAllDatesInRange(startDate, endDate);
  if (dates.length === 0) {
    throw new Error("No valid dates in the selected range");
  }

  // Generate daily mileage distribution
  const dailyDistributions = generateDailyDistribution(
    dates,
    totalBusinessMiles,
    totalPersonalMiles,
    startMileage,
    businessType
  );

  // Convert to mileage entries
  const mileageEntries = convertToMileageEntries(
    dailyDistributions,
    vehicle,
    businessType
  );

  // Calculate business deduction
  const businessDeductionRate = getBusinessMileageRate(startDate.getFullYear());
  const businessDeductionAmount = roundToTwoDecimals(
    totalBusinessMiles * businessDeductionRate
  );

  // Create mileage log
  const mileageLog: MileageLog = {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    start_mileage: startMileage,
    end_mileage: endMileage,
    total_mileage: totalMiles,
    total_business_miles: totalBusinessMiles,
    total_personal_miles: totalPersonalMiles,
    business_deduction_rate: businessDeductionRate,
    business_deduction_amount: businessDeductionAmount,
    vehicle_info: vehicle,
    log_entries: mileageEntries,
    business_type: businessType,
  };

  console.log("Generated mileage log with entries:", mileageEntries.length);

  // Return the generated mileage log
  return {
    mileageLog,
  };
}
