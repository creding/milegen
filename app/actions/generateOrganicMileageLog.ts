"use server";

import { revalidatePath } from "next/cache";
import { HOLIDAYS, getBusinessMileageRate } from "@/utils/constants";
import type {
  MileageEntry as MileageEntryType,
  MileageLog,
} from "@/types/mileage";
import {
  MAX_FREE_ENTRIES,
  type MileageParams,
  type DailyMileageDistribution,
  type TripEntry,
  roundToOneDecimal,
  roundToTwoDecimals,
  getAllDatesInRange,
  isWorkday,
  getRandomInt,
  getRandomBusinessPurpose,
} from "@/utils/mileageUtils";

// Generate a distribution of trips across the date range
function generateDailyDistribution(
  dates: Date[],
  totalBusinessMiles: number,
  totalPersonalMiles: number,
  startMileage: number
): DailyMileageDistribution[] {
  console.log("Distributing mileage across dates:", {
    dateCount: dates.length,
    totalBusinessMiles,
    totalPersonalMiles,
    startMileage,
  });

  // Verify we have valid dates to work with
  if (dates.length === 0) {
    console.error("No dates provided for mileage distribution");
    return [];
  }

  // Sort dates chronologically
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

  // Log the dates we're using
  console.log(
    "Sorted dates for distribution:",
    sortedDates.map((d) => d.toISOString().split("T")[0])
  );

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
            purpose: getRandomBusinessPurpose(),
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
            purpose: "Personal Visit",
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
          purpose: getRandomBusinessPurpose(),
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
          purpose: "Personal Visit",
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
} // This is the closing brace of generateDailyDistribution

// Convert daily distributions to MileageEntry objects
function convertToMileageEntries(
  distributions: DailyMileageDistribution[],
  location: string,
  vehicle: string
): MileageEntryType[] {
  const entries: MileageEntryType[] = [];
  let entryId = 1; // Add a unique ID counter

  for (const day of distributions) {
    // Format date for display (MM/DD/YYYY)
    const date = day.date;
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();
    const formattedDate = `${month}/${dayOfMonth}/${year}`;

    // Check if this is January 1st
    if (month === 1 && dayOfMonth === 1) {
      console.log(
        `Skipping January 1st (${formattedDate}) in convertToMileageEntries`
      );
      continue; // Skip this day entirely
    }

    // Check if this is a holiday
    const dateStr = date.toISOString().split("T")[0];
    const yearHolidays = HOLIDAYS[year as keyof typeof HOLIDAYS] || [];
    if (yearHolidays.includes(dateStr)) {
      console.log(
        `Skipping holiday (${formattedDate}) in convertToMileageEntries`
      );
      continue; // Skip this day entirely
    }

    // Add business trips
    for (const trip of day.businessTrips) {
      entries.push({
        id: `${formattedDate}-${entryId++}`,
        date: formattedDate,
        vehicle: vehicle,
        startMileage: roundToOneDecimal(trip.startMileage),
        endMileage: roundToOneDecimal(trip.endMileage),
        totalMiles: roundToOneDecimal(trip.miles),
        businessMiles: roundToOneDecimal(trip.miles),
        personalMiles: 0,
        location: location,
        businessPurpose: trip.purpose,
        recordedAt: new Date().toISOString(),
      });
    }

    // Add personal trips
    for (const trip of day.personalTrips) {
      entries.push({
        id: `${formattedDate}-${entryId++}`,
        date: formattedDate,
        vehicle: vehicle,
        startMileage: roundToOneDecimal(trip.startMileage),
        endMileage: roundToOneDecimal(trip.endMileage),
        totalMiles: roundToOneDecimal(trip.miles),
        businessMiles: 0,
        personalMiles: roundToOneDecimal(trip.miles),
        location: location,
        businessPurpose: "Personal",
        recordedAt: new Date().toISOString(),
      });
    }
  }

  // Sort entries by date and then by starting mileage
  entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return a.startMileage - b.startMileage;
  });

  return entries;
}

export async function generateOrganicMileageLog({
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
  console.log("generateOrganicMileageLog called with params:", {
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
  if (
    subscriptionStatus !== "active" &&
    currentEntryCount >= MAX_FREE_ENTRIES
  ) {
    throw new Error(
      `Free tier limited to ${MAX_FREE_ENTRIES} entries. Please subscribe for unlimited entries.`
    );
  }

  // Validate inputs
  if (!startDate || !endDate) {
    throw new Error("Start and end dates are required");
  }

  // Ensure dates are properly formatted
  const formattedStartDate = new Date(startDate);
  const formattedEndDate = new Date(endDate);

  console.log("Formatted dates:", {
    formattedStartDate,
    formattedEndDate,
    startDateValid: !isNaN(formattedStartDate.getTime()),
    endDateValid: !isNaN(formattedEndDate.getTime()),
  });

  if (
    isNaN(formattedStartDate.getTime()) ||
    isNaN(formattedEndDate.getTime())
  ) {
    throw new Error("Invalid date format");
  }

  if (formattedStartDate > formattedEndDate) {
    throw new Error("Start date must be before end date");
  }

  // Parse and round input values to ensure consistent precision
  const parsedStartMileage = parseFloat(startMileage.toString());
  const parsedEndMileage = parseFloat(endMileage.toString());
  const parsedPersonalMiles = parseFloat(totalPersonalMiles.toString());

  const totalMiles = roundToOneDecimal(parsedEndMileage - parsedStartMileage);
  console.log("Total miles calculated:", totalMiles);

  if (totalMiles <= 0) {
    console.log("Invalid mileage range:", parsedStartMileage, parsedEndMileage);
    throw new Error("End mileage must be greater than start mileage");
  }

  if (parsedPersonalMiles >= totalMiles) {
    console.log(
      "Personal miles exceed total:",
      parsedPersonalMiles,
      totalMiles
    );
    throw new Error("Personal miles cannot exceed total miles");
  }

  // Calculate business miles
  const totalBusinessMiles = roundToOneDecimal(
    totalMiles - parsedPersonalMiles
  );

  // Get all dates in range
  const allDates = getAllDatesInRange(formattedStartDate, formattedEndDate);
  console.log("All dates in range:", allDates.length, allDates);

  if (allDates.length === 0) {
    throw new Error("No valid workdays found in the selected date range");
  }

  // Generate daily distribution of miles
  const mileageDistribution = generateDailyDistribution(
    allDates,
    totalBusinessMiles,
    totalPersonalMiles,
    parsedStartMileage
  );

  console.log("Generated daily distributions:", mileageDistribution);

  // Convert to MileageEntry objects
  const logEntries = convertToMileageEntries(
    mileageDistribution,
    location,
    vehicle
  );

  console.log("Generated log entries:", logEntries);

  // Calculate business deduction
  const year = formattedStartDate.getFullYear();
  const businessDeductionRate = getBusinessMileageRate(year);
  const businessDeduction = roundToTwoDecimals(
    totalBusinessMiles * businessDeductionRate
  );

  // Verify total mileage is preserved
  const totalLogMiles = logEntries.reduce(
    (sum, entry) => sum + entry.totalMiles,
    0
  );
  const expectedTotalMiles = parsedEndMileage - parsedStartMileage;
  console.log(
    `Total miles in log: ${totalLogMiles}, Expected total miles: ${expectedTotalMiles}`
  );

  if (Math.abs(totalLogMiles - expectedTotalMiles) > 1) {
    console.warn(
      `Warning: Total miles in log (${totalLogMiles}) differs from expected miles (${expectedTotalMiles})`
    );
    // We'll adjust the last entry to match the expected total if needed
    if (logEntries.length > 0) {
      const lastEntry = logEntries[logEntries.length - 1];
      const difference = expectedTotalMiles - totalLogMiles;

      // Update the last entry to account for the difference
      lastEntry.totalMiles = roundToOneDecimal(
        lastEntry.totalMiles + difference
      );
      lastEntry.endMileage = roundToOneDecimal(
        lastEntry.startMileage + lastEntry.totalMiles
      );

      // Update business or personal miles based on the entry type
      if (lastEntry.businessMiles > 0) {
        lastEntry.businessMiles = roundToOneDecimal(
          lastEntry.businessMiles + difference
        );
      } else {
        lastEntry.personalMiles = roundToOneDecimal(
          lastEntry.personalMiles + difference
        );
      }

      console.log(
        `Adjusted last entry to account for ${difference} miles difference`
      );
    }
  }

  // Create the final mileage log
  const mileageLog: MileageLog = {
    year: year,
    start_date: formattedStartDate.toISOString().split("T")[0],
    end_date: formattedEndDate.toISOString().split("T")[0],
    start_mileage: parsedStartMileage,
    end_mileage: parsedEndMileage,
    total_mileage: totalMiles,
    total_business_miles: totalBusinessMiles,
    total_personal_miles: parsedPersonalMiles,
    business_deduction_rate: businessDeductionRate,
    business_deduction_amount: businessDeduction,
    vehicle_info: {
      name: vehicle,
    },
    log_entries: logEntries,
  };

  console.log("Final mileage log:", mileageLog);
  revalidatePath("/generator");
  return {
    mileageLog,
  };
}
