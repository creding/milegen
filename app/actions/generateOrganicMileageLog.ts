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
  getWeightedPersonalPurpose,
  BUSINESS_TYPES,
} from "@/utils/mileageUtils";
import { generateSmartLocation } from "@/utils/locationUtils";

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

    // Generate business trips
    const { trips: businessTripEntries, totalMiles: businessTripMiles } = generateBusinessTrips(
      date,
      dayBusinessMiles,
      currentMileage,
      businessType
    );
    businessTrips.push(...businessTripEntries);
    currentMileage = roundToOneDecimal(currentMileage + businessTripMiles);

    // Generate personal trips
    const { trips: personalTripEntries, totalMiles: personalTripMiles } = generatePersonalTrips(
      date,
      dayPersonalMiles,
      currentMileage
    );
    personalTrips.push(...personalTripEntries);
    currentMileage = roundToOneDecimal(currentMileage + personalTripMiles);

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
          purpose: getWeightedPersonalPurpose(day.date),
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

// Generate a trip mileage based on purpose
function generatePurposeBasedMileage(purpose: string, type: 'business' | 'personal'): number {
  // Define purpose-specific distance ranges
  const purposeDistanceRanges: Record<string, {min: number, max: number}> = {
    // Personal purposes
    "Vacation": { min: 50, max: 500 },
    "Family Visit": { min: 10, max: 200 },
    "Entertainment": { min: 5, max: 50 },
    "Commuting": { min: 5, max: 30 },
    "School Drop-off/Pick-up": { min: 1, max: 10 },
    "Grocery Shopping": { min: 1, max: 8 },
    "Shopping": { min: 3, max: 20 },
    "Medical Appointment": { min: 2, max: 25 },
    "Gym/Fitness": { min: 1, max: 10 },
    "Restaurant": { min: 2, max: 15 },
    "Errands": { min: 1, max: 10 },
    "Religious Activity": { min: 2, max: 15 },
    "Volunteer Work": { min: 3, max: 20 },
    "Home Improvement": { min: 2, max: 15 },
    "Pet Care": { min: 1, max: 10 },
    "Hobby": { min: 3, max: 25 },
    "Personal Visit": { min: 3, max: 30 },
    
    // Business purposes
    "Conference": { min: 15, max: 300 },
    "Client Visit": { min: 5, max: 50 },
    "Client Meeting": { min: 5, max: 50 },
    "Business Lunch": { min: 3, max: 20 },
    "Site Inspection": { min: 10, max: 60 },
    "Sales Presentation": { min: 5, max: 50 },
    "Project Planning": { min: 5, max: 30 },
    "Property Showing": { min: 5, max: 30 },
    "Property Inspection": { min: 5, max: 30 },
    "Medical Conference": { min: 20, max: 300 },
    "Patient Visit": { min: 5, max: 40 },
    "Food Delivery": { min: 2, max: 15 },
    "Passenger Pickup": { min: 2, max: 20 },
    "Package Delivery": { min: 3, max: 25 },
    "Sales Call": { min: 5, max: 50 },
    "Job Site Visit": { min: 10, max: 60 },
    "Material Pickup": { min: 5, max: 30 },
    "Tax Preparation": { min: 5, max: 40 }
  };
  
  // Get the appropriate distance range for this purpose
  const range = purposeDistanceRanges[purpose] || {
    min: type === 'business' ? 5 : 2,
    max: type === 'business' ? 30 : 15
  };
  
  // Generate mileage within the appropriate range with some variation
  const baseMileage = getRandomInt(range.min, range.max);
  
  // Add some randomness but keep within realistic bounds
  const variation = 0.8 + Math.random() * 0.4; // 80-120% variation
  return roundToOneDecimal(baseMileage * variation);
}

// Generate business trips for a day
function generateBusinessTrips(
  date: Date,
  targetMiles: number,
  currentMileage: number,
  businessType?: string
): { trips: TripEntry[]; totalMiles: number } {
  const trips: TripEntry[] = [];
  let totalMiles = 0;
  let remainingMiles = targetMiles;

  // Generate 1-3 business trips for this day
  const numTrips = Math.min(
    getRandomInt(1, 3),
    Math.ceil(targetMiles / 5) // At least 5 miles per trip on average
  );

  for (let i = 0; i < numTrips && remainingMiles > 0; i++) {
    // Generate a purpose first
    const purpose = getRandomBusinessPurpose(businessType, date);
    
    // Generate a realistic mileage based on the purpose
    let tripMiles = generatePurposeBasedMileage(purpose, 'business');
    
    // Adjust if needed to stay within remaining miles
    if (tripMiles > remainingMiles) {
      tripMiles = remainingMiles;
    }
    
    // Ensure minimum trip distance
    if (tripMiles < 0.5) {
      tripMiles = 0.5;
    }
    
    tripMiles = roundToOneDecimal(tripMiles);
    
    const tripStartMileage = roundToOneDecimal(currentMileage);
    const tripEndMileage = roundToOneDecimal(tripStartMileage + tripMiles);

    trips.push({
      startMileage: tripStartMileage,
      endMileage: tripEndMileage,
      miles: tripMiles,
      purpose: purpose,
    });

    totalMiles = roundToOneDecimal(totalMiles + tripMiles);
    remainingMiles = roundToOneDecimal(remainingMiles - tripMiles);
    currentMileage = tripEndMileage;
  }

  return { trips, totalMiles };
}

// Generate personal trips for a day
function generatePersonalTrips(
  date: Date,
  targetMiles: number,
  currentMileage: number
): { trips: TripEntry[]; totalMiles: number } {
  const trips: TripEntry[] = [];
  let totalMiles = 0;
  let remainingMiles = targetMiles;

  // Generate 1-2 personal trips for this day
  const numTrips = Math.min(
    getRandomInt(1, 2),
    Math.ceil(targetMiles / 5) // At least 5 miles per trip on average
  );

  for (let i = 0; i < numTrips && remainingMiles > 0; i++) {
    // Generate a purpose first
    const purpose = getWeightedPersonalPurpose(date);
    
    // Generate a realistic mileage based on the purpose
    let tripMiles = generatePurposeBasedMileage(purpose, 'personal');
    
    // Adjust if needed to stay within remaining miles
    if (tripMiles > remainingMiles) {
      tripMiles = remainingMiles;
    }
    
    // Ensure minimum trip distance
    if (tripMiles < 0.5) {
      tripMiles = 0.5;
    }
    
    tripMiles = roundToOneDecimal(tripMiles);
    
    const tripStartMileage = roundToOneDecimal(currentMileage);
    const tripEndMileage = roundToOneDecimal(tripStartMileage + tripMiles);

    trips.push({
      startMileage: tripStartMileage,
      endMileage: tripEndMileage,
      miles: tripMiles,
      purpose: purpose,
    });

    totalMiles = roundToOneDecimal(totalMiles + tripMiles);
    remainingMiles = roundToOneDecimal(remainingMiles - tripMiles);
    currentMileage = tripEndMileage;
  }

  return { trips, totalMiles };
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
      // Generate a smart location based on purpose, miles, and business type
      const location = generateSmartLocation(
        trip.purpose,
        trip.miles,
        "business",
        businessType,
        date
      );

      // Create the entry without vehicle_info (will be inherited from top level)
      const entry: MileageEntryType = {
        date: new Date(date),
        start_mileage: trip.startMileage,
        end_mileage: trip.endMileage,
        miles: trip.miles,
        purpose: trip.purpose,
        type: "business",
        location: location,
      };

      // Only add business_type if it exists
      if (businessType) {
        entry.business_type = businessType;
      }

      entries.push(entry);
    }

    // Process personal trips
    for (const trip of day.personalTrips) {
      // Generate a smart location for personal trips
      const location = generateSmartLocation(
        trip.purpose,
        trip.miles,
        "personal",
        undefined,
        date
      );

      // Create the entry without vehicle_info (will be inherited from top level)
      entries.push({
        date: new Date(date),
        start_mileage: trip.startMileage,
        end_mileage: trip.endMileage,
        miles: trip.miles,
        purpose: trip.purpose,
        type: "personal",
        location: location,
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
