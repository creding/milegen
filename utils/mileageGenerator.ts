"use server";

import {
  addDays,
  format,
  isWeekend,
  set,
  addMinutes,
  isBefore,
  isAfter,
  differenceInDays,
} from "date-fns";
import { BUSINESS_TYPES } from "./mileageUtils";
import { HOLIDAYS, getBusinessMileageRate } from "./constants";

interface MileageParams {
  startMileage: number;
  endMileage: number;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: number;
  vehicle: string;
  businessType?: string;
  subscriptionStatus: string;
  currentEntryCount: number;
  personalMilesRatio: number;
}

interface MileageGeneratorParams {
  startDate: Date;
  endDate: Date;
  startMileage: number;
  endMileage: number;
  vehicle: string;
  businessType?: string;
  subscriptionStatus: string;
  currentEntryCount: number;
  totalPersonalMiles: number;
}

interface TripEntry {
  startMileage: number;
  endMileage: number;
  miles: number;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface DailyMileageDistribution {
  date: Date;
  businessTrips: TripEntry[];
  personalTrips: TripEntry[];
  totalBusinessMiles: number;
  totalPersonalMiles: number;
}

export interface MileageLog {
  start_date: string;
  end_date: string;
  start_mileage: number;
  end_mileage: number;
  total_mileage: number;
  total_business_miles: number;
  total_personal_miles: number;
  business_deduction_rate: number;
  business_deduction_amount: number;
  vehicle_info: string;
  log_entries: {
    date: Date;
    start_mileage: number;
    end_mileage: number;
    miles: number;
    purpose: string;
    type: string;
    vehicle_info: string;
    business_type: string;
  }[];
  business_type: string;
}

export interface MileageEntry {
  date: Date;
  type: string;
  miles: number;
  purpose: string;
  start_mileage: number;
  end_mileage: number;
  vehicle_info: string;
  business_type: string;
}

interface DailyMileage {
  date: Date;
  targetMiles: number;
  targetBusinessMiles: number;
  isWorkday: boolean;
}

// Basic configuration
const CONFIG = {
  BUSINESS_HOURS: {
    start: 8,
    end: 21,
  },
  MILES_PER_TRIP: {
    business: {
      min: 2.3,
      max: 12.7,
    },
    personal: {
      min: 1.8,
      max: 8.4,
    },
  },
  WEEKEND_MILES_RATIO: 0.4,
  DECIMAL_PLACES: 1,
};

// Helper functions
async function getRandomInt(min: number, max: number): Promise<number> {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getRandomFloat(min: number, max: number): Promise<number> {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function generateTime(hour: number): Promise<string> {
  const minutes = (await getRandomInt(0, 3)) * 15; // 0, 15, 30, 45
  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

async function addMinutesToTime(
  time: string,
  minutes: number
): Promise<string> {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMinutes
    .toString()
    .padStart(2, "0")}`;
}

async function isHoliday(date: Date): Promise<boolean> {
  const year = date.getFullYear();
  const dateString = format(date, "yyyy-MM-dd");

  const yearHolidays = HOLIDAYS[year as keyof typeof HOLIDAYS];
  if (yearHolidays) {
    return yearHolidays.includes(dateString);
  }
  return false;
}

async function isWorkday(date: Date): Promise<boolean> {
  return !isWeekend(date) && !(await isHoliday(date));
}

async function getRandomBusinessPurpose(businessType: string): Promise<string> {
  const type = BUSINESS_TYPES.find((t) => t.name === businessType);
  if (!type) return "Business Meeting";
  return type.purposes[Math.floor(Math.random() * type.purposes.length)];
}

function roundMiles(miles: number): number {
  return Number(miles.toFixed(CONFIG.DECIMAL_PLACES));
}

// Core generation functions
async function generateMileageLog(
  startDate: Date,
  endDate: Date,
  startMileage: number,
  endMileage: number,
  businessType: string,
  vehicleInfo: string,
  totalPersonalMiles: number
): Promise<MileageLog> {
  const totalMileage = endMileage - startMileage;
  const targetBusinessMiles = totalMileage - totalPersonalMiles;

  const dailyMileageTargets = await distributeMileageAcrossDays(
    startDate,
    endDate,
    totalMileage,
    targetBusinessMiles,
    totalPersonalMiles
  );

  const entries: MileageEntry[] = [];
  let currentMileage = startMileage;

  for (const dailyTarget of dailyMileageTargets) {
    const tripsForDay = await generateTripsForDay(
      dailyTarget.date,
      dailyTarget.targetMiles,
      dailyTarget.targetBusinessMiles,
      currentMileage,
      businessType,
      vehicleInfo,
      dailyTarget.isWorkday
    );

    entries.push(...tripsForDay);
    currentMileage = roundMiles(currentMileage + dailyTarget.targetMiles);
  }

  const totalBusinessMiles = roundMiles(
    entries.reduce(
      (sum, entry) => sum + (entry.type === "business" ? entry.miles : 0),
      0
    )
  );

  return {
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    start_mileage: startMileage,
    end_mileage: endMileage,
    total_mileage: roundMiles(totalMileage),
    total_business_miles: totalBusinessMiles,
    total_personal_miles: roundMiles(totalMileage - totalBusinessMiles),
    business_deduction_rate: getBusinessMileageRate(new Date().getFullYear()),
    business_deduction_amount: roundMiles(
      getBusinessMileageRate(new Date().getFullYear()) * totalBusinessMiles
    ),
    vehicle_info: vehicleInfo,
    log_entries: entries,
    business_type: businessType,
  };
}

async function distributeMileageAcrossDays(
  startDate: Date,
  endDate: Date,
  totalMileage: number,
  targetBusinessMiles: number,
  totalPersonalMiles: number
): Promise<DailyMileage[]> {
  const dailyTargets: DailyMileage[] = [];
  let currentDate = new Date(startDate);

  // Count days
  let workdays = 0;
  let weekendDays = 0;
  while (currentDate <= endDate) {
    if (await isWorkday(currentDate)) {
      workdays++;
    } else {
      weekendDays++;
    }
    currentDate = addDays(currentDate, 1);
  }

  // Distribute personal miles - more on weekends
  const weekendPersonalMiles = roundMiles(
    (totalPersonalMiles * 0.6) / weekendDays
  ); // 60% on weekends
  const weekdayPersonalMiles = roundMiles(
    (totalPersonalMiles * 0.4) / workdays
  ); // 40% on workdays

  // Distribute business miles - more on workdays
  const weekdayBusinessMiles = roundMiles(
    (targetBusinessMiles * 0.9) / workdays
  ); // 90% on workdays
  const weekendBusinessMiles = roundMiles(
    (targetBusinessMiles * 0.1) / weekendDays
  ); // 10% on weekends

  // Reset for distribution
  currentDate = new Date(startDate);
  let totalPersonalAssigned = 0;
  let totalBusinessAssigned = 0;

  while (currentDate <= endDate) {
    const isWorkingDay = await isWorkday(currentDate);

    // Calculate base miles for this day
    let personalMiles = isWorkingDay
      ? weekdayPersonalMiles
      : weekendPersonalMiles;
    let businessMiles = isWorkingDay
      ? weekdayBusinessMiles
      : weekendBusinessMiles;

    // Add slight variation while ensuring we don't exceed targets
    const variation = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
    personalMiles = roundMiles(personalMiles * variation);
    businessMiles = roundMiles(businessMiles * variation);

    // Ensure we don't exceed total targets
    const remainingPersonal = roundMiles(
      totalPersonalMiles - totalPersonalAssigned
    );
    const remainingBusiness = roundMiles(
      targetBusinessMiles - totalBusinessAssigned
    );

    if (totalPersonalAssigned + personalMiles > totalPersonalMiles) {
      personalMiles = remainingPersonal;
    }
    if (totalBusinessAssigned + businessMiles > targetBusinessMiles) {
      businessMiles = remainingBusiness;
    }

    // Skip some weekend days entirely
    if (!isWorkingDay && Math.random() < 0.1) {
      personalMiles = 0;
      businessMiles = 0;
    }

    dailyTargets.push({
      date: new Date(currentDate),
      targetMiles: roundMiles(personalMiles + businessMiles),
      targetBusinessMiles: businessMiles,
      isWorkday: isWorkingDay,
    });

    totalPersonalAssigned = roundMiles(totalPersonalAssigned + personalMiles);
    totalBusinessAssigned = roundMiles(totalBusinessAssigned + businessMiles);
    currentDate = addDays(currentDate, 1);
  }

  // If we have any remaining miles due to rounding, add them to the last workday
  const remainingPersonal = roundMiles(
    totalPersonalMiles - totalPersonalAssigned
  );
  const remainingBusiness = roundMiles(
    targetBusinessMiles - totalBusinessAssigned
  );

  if (remainingPersonal > 0 || remainingBusiness > 0) {
    // Find the last workday
    for (let i = dailyTargets.length - 1; i >= 0; i--) {
      if (dailyTargets[i].isWorkday) {
        dailyTargets[i].targetMiles = roundMiles(
          dailyTargets[i].targetMiles + remainingPersonal + remainingBusiness
        );
        dailyTargets[i].targetBusinessMiles = roundMiles(
          dailyTargets[i].targetBusinessMiles + remainingBusiness
        );
        break;
      }
    }
  }

  return dailyTargets;
}

async function generateTripsForDay(
  date: Date,
  targetMiles: number,
  targetBusinessMiles: number,
  startMileage: number,
  businessType: string,
  vehicleInfo: string,
  isWorkday: boolean
): Promise<MileageEntry[]> {
  const trips: MileageEntry[] = [];
  let currentMileage = startMileage;
  const targetPersonalMiles = roundMiles(targetMiles - targetBusinessMiles);

  // Generate personal trips first to ensure exact match
  let remainingPersonal = targetPersonalMiles;
  while (remainingPersonal > 0) {
    const config = CONFIG.MILES_PER_TRIP.personal;
    let miles = Math.min(
      remainingPersonal,
      roundMiles(config.min + Math.random() * (config.max - config.min))
    );

    // For last trip, use all remaining miles
    if (remainingPersonal <= config.max) {
      miles = remainingPersonal;
    }

    trips.push({
      date,
      type: "personal",
      miles: roundMiles(miles),
      purpose: "Personal",
      start_mileage: roundMiles(currentMileage),
      end_mileage: roundMiles(currentMileage + miles),
      vehicle_info: vehicleInfo,
      business_type: businessType,
    });

    remainingPersonal = roundMiles(remainingPersonal - miles);
    currentMileage = roundMiles(currentMileage + miles);
  }

  // Then generate business trips
  let remainingBusiness = targetBusinessMiles;
  while (remainingBusiness > 0) {
    const config = CONFIG.MILES_PER_TRIP.business;
    let miles = Math.min(
      remainingBusiness,
      roundMiles(config.min + Math.random() * (config.max - config.min))
    );

    // For last trip, use all remaining miles
    if (remainingBusiness <= config.max) {
      miles = remainingBusiness;
    }

    trips.push({
      date,
      type: "business",
      miles: roundMiles(miles),
      purpose: await getRandomBusinessPurpose(businessType),
      start_mileage: roundMiles(currentMileage),
      end_mileage: roundMiles(currentMileage + miles),
      vehicle_info: vehicleInfo,
      business_type: businessType,
    });

    remainingBusiness = roundMiles(remainingBusiness - miles);
    currentMileage = roundMiles(currentMileage + miles);
  }

  return trips;
}

export async function generateMileageLogFromForm(
  params: MileageGeneratorParams
): Promise<MileageLog> {
  // Validate input
  if (!params.startDate || !params.endDate) {
    throw new Error("Start and end dates are required");
  }

  if (params.endMileage <= params.startMileage) {
    throw new Error("End mileage must be greater than start mileage");
  }

  if (params.totalPersonalMiles >= params.endMileage - params.startMileage) {
    throw new Error("Personal miles cannot exceed total miles");
  }

  // Generate daily distributions
  const log = await generateMileageLog(
    params.startDate,
    params.endDate,
    params.startMileage,
    params.endMileage,
    params.businessType || "Other",
    params.vehicle,
    params.totalPersonalMiles
  );

  return log;
}
