// Business trip purposes - weighted to make "Client Visit" more common
import { HOLIDAYS } from "./constants";

export const BUSINESS_PURPOSES = [
  "Client Visit", "Client Visit", "Client Visit", "Client Visit", 
  "Meeting", "Meeting", 
  "Business Lunch", 
  "Conference", 
  "Site Inspection"
];

export interface MileageParams {
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

export interface DailyMileageDistribution {
  date: Date;
  businessTrips: TripEntry[];
  personalTrips: TripEntry[];
  totalBusinessMiles: number;
  totalPersonalMiles: number;
}

export interface TripEntry {
  startMileage: number;
  endMileage: number;
  miles: number;
  purpose: string;
}

export const MAX_FREE_ENTRIES = 10;

// Helper function to round to 1 decimal place
export function roundToOneDecimal(num: number): number {
  return parseFloat(num.toFixed(1));
}

// Helper function to round to 2 decimal places
export function roundToTwoDecimals(num: number): number {
  return parseFloat(num.toFixed(2));
}

// Get all dates in range, filtering for workdays
export function getAllDatesInRange(startDate: Date, endDate: Date): Date[] {
  console.log(`Getting all dates between ${startDate.toISOString()} and ${endDate.toISOString()}`);
  
  const dates: Date[] = [];
  
  // Find the first valid workday on or after the start date
  let firstWorkday = new Date(startDate);
  console.log(`Starting search for first workday from: ${firstWorkday.toISOString().split('T')[0]}`);
  
  // Keep advancing the date until we find a workday
  while (firstWorkday <= endDate) {
    // Check if January 1st
    const month = firstWorkday.getMonth() + 1;
    const day = firstWorkday.getDate();
    
    if (month === 1 && day === 1) {
      console.log(`${firstWorkday.toISOString().split('T')[0]} is January 1st, skipping`);
      firstWorkday.setDate(firstWorkday.getDate() + 1);
      continue;
    }
    
    const isWorkdayResult = isWorkday(firstWorkday);
    console.log(`Checking if ${firstWorkday.toISOString().split('T')[0]} is a workday: ${isWorkdayResult}`);
    
    if (isWorkdayResult) {
      console.log(`First workday found: ${firstWorkday.toISOString().split('T')[0]}`);
      break;
    }
    
    console.log(`${firstWorkday.toISOString().split('T')[0]} is not a workday, trying next day`);
    firstWorkday.setDate(firstWorkday.getDate() + 1);
  }

  // If we couldn't find a workday in the range, return empty array
  if (firstWorkday > endDate) {
    console.log("No workdays found in the date range");
    return [];
  }
  
  // Collect all workdays in the range
  let currentDate = new Date(firstWorkday);
  while (currentDate <= endDate) {
    // Check if January 1st
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    
    if (month === 1 && day === 1) {
      console.log(`${currentDate.toISOString().split('T')[0]} is January 1st, skipping`);
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    if (isWorkday(currentDate)) {
      dates.push(new Date(currentDate));
    } else {
      console.log(`Skipping non-workday: ${currentDate.toISOString().split('T')[0]}`);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Found ${dates.length} workdays in range`);
  return dates;
}

// Add more detailed logging to debug date format issues
export function debugDateFormat(date: Date): void {
  const isoString = date.toISOString();
  const dateString = isoString.split("T")[0];
  const localeDateString = date.toLocaleDateString();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  
  console.log("Date format debug:", {
    originalDate: date,
    isoString,
    dateString,
    localeDateString,
    formattedDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    month,
    day,
    year
  });
}

// Determine if a date is a workday (not weekend or holiday)
export function isWorkday(date: Date): boolean {
  // Format date as YYYY-MM-DD for holiday checking
  const dateString = date.toISOString().split("T")[0];
  const year = date.getFullYear();
  
  // Debug the date format
  debugDateFormat(date);
  
  // Check if it's a weekend
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  
  if (isWeekend) {
    console.log(`${dateString} is a weekend (day ${dayOfWeek})`);
    return false;
  }
  
  // Check for specific holidays using our hard-coded list
  const yearHolidays = HOLIDAYS[year as keyof typeof HOLIDAYS];
  
  if (yearHolidays && yearHolidays.includes(dateString)) {
    console.log(`${dateString} is a holiday (from hard-coded list)`);
    return false;
  }
  
  // Check for January 1st specifically (New Year's Day)
  if (date.getMonth() === 0 && date.getDate() === 1) {
    console.log(`${dateString} is January 1st (New Year's Day)`);
    return false;
  }
  
  return true;
}

// Get a random integer between min and max (inclusive)
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get a random number with 1 decimal place between min and max
export function getRandomMileage(min: number, max: number): number {
  return roundToOneDecimal(Math.random() * (max - min) + min);
}

// Get a random business purpose
export function getRandomBusinessPurpose(): string {
  return BUSINESS_PURPOSES[Math.floor(Math.random() * BUSINESS_PURPOSES.length)];
}
