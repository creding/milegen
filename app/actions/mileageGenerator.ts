"use server";

import { addDays, format, isWeekend } from "date-fns";
import { BUSINESS_TYPES } from "@/utils/mileageUtils";
import { HOLIDAYS, getBusinessMileageRate } from "@/utils/constants";

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
  id?: string;
  user_id?: string;
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
      max: 25.7,
    },
    personal: {
      min: 1.8,
      max: 40.4,
    },
  },
  WEEKEND_MILES_RATIO: 0.4,
  DECIMAL_PLACES: 1,
};

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
      vehicleInfo
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

  // Count workdays and non-workdays
  let workdays = 0;
  let nonWorkdays = 0;
  const dates: { date: Date; isWorkday: boolean }[] = [];

  while (currentDate <= endDate) {
    const isWorkingDay = await isWorkday(currentDate);
    dates.push({ date: new Date(currentDate), isWorkday: isWorkingDay });

    if (isWorkingDay) {
      workdays++;
    } else {
      nonWorkdays++;
    }
    currentDate = addDays(currentDate, 1);
  }

  // Distribute business miles only on workdays
  const dailyBusinessMiles = roundMiles(targetBusinessMiles / workdays);

  // Distribute personal miles with more on non-workdays
  const workdayPersonalMiles = roundMiles(
    (totalPersonalMiles * 0.3) / workdays
  ); // 30% on workdays
  const nonWorkdayPersonalMiles = roundMiles(
    (totalPersonalMiles * 0.7) / nonWorkdays
  ); // 70% on non-workdays

  let totalBusinessAssigned = 0;
  let totalPersonalAssigned = 0;

  // Generate daily targets
  for (const { date, isWorkday } of dates) {
    let businessMiles = 0;
    let personalMiles = 0;

    if (isWorkday) {
      // Workday: business miles + some personal miles
      businessMiles = roundMiles(
        dailyBusinessMiles * (0.9 + Math.random() * 0.2)
      ); // ±10% variation
      personalMiles = roundMiles(
        workdayPersonalMiles * (0.8 + Math.random() * 0.4)
      ); // ±20% variation

      // Ensure we don't exceed remaining miles
      const remainingBusiness = roundMiles(
        targetBusinessMiles - totalBusinessAssigned
      );
      const remainingPersonal = roundMiles(
        totalPersonalMiles - totalPersonalAssigned
      );

      businessMiles = Math.min(businessMiles, remainingBusiness);
      personalMiles = Math.min(personalMiles, remainingPersonal);
    } else {
      // Non-workday (weekend/holiday): only personal miles
      personalMiles = roundMiles(
        nonWorkdayPersonalMiles * (0.7 + Math.random() * 0.6)
      ); // ±30% variation

      // Ensure we don't exceed remaining personal miles
      const remainingPersonal = roundMiles(
        totalPersonalMiles - totalPersonalAssigned
      );
      personalMiles = Math.min(personalMiles, remainingPersonal);

      // Randomly skip some non-workdays (20% chance)
      if (Math.random() < 0.2) {
        personalMiles = 0;
      }
    }

    // Add the day's miles
    const totalMiles = roundMiles(businessMiles + personalMiles);
    if (totalMiles > 0) {
      dailyTargets.push({
        date,
        targetMiles: totalMiles,
        targetBusinessMiles: businessMiles,
        isWorkday,
      });

      totalBusinessAssigned = roundMiles(totalBusinessAssigned + businessMiles);
      totalPersonalAssigned = roundMiles(totalPersonalAssigned + personalMiles);
    }
  }

  // If we have any remaining miles due to rounding, add them to appropriate days
  const remainingBusiness = roundMiles(
    targetBusinessMiles - totalBusinessAssigned
  );
  const remainingPersonal = roundMiles(
    totalPersonalMiles - totalPersonalAssigned
  );

  if (remainingBusiness > 0) {
    // Add remaining business miles to the last workday
    for (let i = dailyTargets.length - 1; i >= 0; i--) {
      if (dailyTargets[i].isWorkday) {
        dailyTargets[i].targetMiles = roundMiles(
          dailyTargets[i].targetMiles + remainingBusiness
        );
        dailyTargets[i].targetBusinessMiles = roundMiles(
          dailyTargets[i].targetBusinessMiles + remainingBusiness
        );
        break;
      }
    }
  }

  if (remainingPersonal > 0) {
    // Add remaining personal miles to the last non-workday, or last workday if necessary
    let added = false;
    for (let i = dailyTargets.length - 1; i >= 0; i--) {
      if (!dailyTargets[i].isWorkday) {
        dailyTargets[i].targetMiles = roundMiles(
          dailyTargets[i].targetMiles + remainingPersonal
        );
        added = true;
        break;
      }
    }
    if (!added && dailyTargets.length > 0) {
      // If no non-workday found, add to the last day
      const lastDay = dailyTargets[dailyTargets.length - 1];
      lastDay.targetMiles = roundMiles(lastDay.targetMiles + remainingPersonal);
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
  vehicleInfo: string
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
  const startDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);

  const log = await generateMileageLog(
    startDate,
    endDate,
    params.startMileage,
    params.endMileage,
    params.businessType || "General Business",
    params.vehicle,
    params.totalPersonalMiles
  );

  return log;
}
