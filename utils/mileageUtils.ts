// Business trip purposes - weighted to make "Client Visit" more common
import { HOLIDAYS } from "./constants";

export interface BusinessType {
  name: string;
  purposes: string[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    name: "Consulting",
    purposes: [
      "Client Visit",
      "Client Visit",
      "Client Visit",
      "Client Meeting",
      "Business Lunch",
      "Conference",
      "Site Inspection",
      "Sales Presentation",
      "Project Planning",
    ],
  },
  {
    name: "Real Estate",
    purposes: [
      "Property Showing",
      "Property Showing",
      "Property Inspection",
      "Client Meeting",
      "Open House",
      "Listing Appointment",
      "Market Research",
      "Property Appraisal",
    ],
  },
  {
    name: "Healthcare",
    purposes: [
      "Patient Visit",
      "Patient Visit",
      "Medical Conference",
      "Supply Pickup",
      "Training Session",
      "Facility Inspection",
      "Professional Meeting",
    ],
  },
  {
    name: "Food Delivery",
    purposes: [
      "Food Delivery",
      "Food Delivery",
      "Food Delivery",
      "Restaurant Pickup",
      "Customer Delivery",
      "Supply Pickup",
    ],
  },
  {
    name: "Rideshare",
    purposes: [
      "Passenger Pickup",
      "Passenger Pickup",
      "Passenger Dropoff",
      "Airport Transfer",
      "Event Transportation",
    ],
  },
  {
    name: "Courier",
    purposes: [
      "Package Delivery",
      "Package Delivery",
      "Package Pickup",
      "Warehouse Visit",
      "Distribution Center",
      "Express Delivery",
    ],
  },
  {
    name: "Sales",
    purposes: [
      "Sales Call",
      "Sales Call",
      "Client Presentation",
      "Product Demo",
      "Trade Show",
      "Client Meeting",
      "Networking Event",
    ],
  },
  {
    name: "Construction",
    purposes: [
      "Job Site Visit",
      "Job Site Visit",
      "Material Pickup",
      "Client Meeting",
      "Supplier Visit",
      "Inspection",
      "Bid Presentation",
    ],
  },
];

// Legacy business purposes array for backward compatibility
export const BUSINESS_PURPOSES = [
  "Client Visit",
  "Client Visit",
  "Client Visit",
  "Client Visit",
  "Meeting",
  "Meeting",
  "Business Lunch",
  "Conference",
  "Site Inspection",
];

// Personal trip purposes
export const PERSONAL_PURPOSES = [
  "Personal Visit",
  "Shopping",
  "Grocery Shopping",
  "Medical Appointment",
  "Gym",
  "Restaurant",
  "Entertainment",
  "Family Visit",
  "Vacation",
  "School Pickup",
  "Errands",
];

export interface MileageParams {
  startMileage: number;
  endMileage: number;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: number;
  vehicle: string;
  businessType?: string;
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
  const dates: Date[] = [];

  // Find the first valid workday on or after the start date
  let firstWorkday = new Date(startDate);

  // Keep advancing the date until we find a workday
  while (firstWorkday <= endDate) {
    // Check if January 1st
    const month = firstWorkday.getMonth() + 1;
    const day = firstWorkday.getDate();

    if (month === 1 && day === 1) {
      firstWorkday.setDate(firstWorkday.getDate() + 1);
      continue;
    }

    const isWorkdayResult = isWorkday(firstWorkday);

    if (isWorkdayResult) {
      break;
    }

    firstWorkday.setDate(firstWorkday.getDate() + 1);
  }

  // If we couldn't find a workday in the range, return empty array
  if (firstWorkday > endDate) {
    return [];
  }

  // Collect all workdays in the range
  let currentDate = new Date(firstWorkday);
  while (currentDate <= endDate) {
    // Check if January 1st
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    if (month === 1 && day === 1) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    if (isWorkday(currentDate)) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// Determine if a date is a workday (not weekend or holiday)
export function isWorkday(date: Date): boolean {
  // Format date as YYYY-MM-DD for holiday checking
  const dateString = date.toISOString().split("T")[0];
  const year = date.getFullYear();

  // Check if it's a weekend
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday

  if (isWeekend) {
    return false;
  }

  // Check for specific holidays using our hard-coded list
  const yearHolidays = HOLIDAYS[year as keyof typeof HOLIDAYS];

  if (yearHolidays && yearHolidays.includes(dateString)) {
    return false;
  }

  // Check for January 1st specifically (New Year's Day)
  if (date.getMonth() === 0 && date.getDate() === 1) {
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

// Get a random business purpose based on business type
export function getRandomBusinessPurpose(businessType?: string): string {
  if (!businessType) {
    return BUSINESS_PURPOSES[Math.floor(Math.random() * BUSINESS_PURPOSES.length)];
  }
  
  const type = BUSINESS_TYPES.find(t => t.name === businessType);
  if (!type) {
    return BUSINESS_PURPOSES[Math.floor(Math.random() * BUSINESS_PURPOSES.length)];
  }
  
  return type.purposes[Math.floor(Math.random() * type.purposes.length)];
}

// Get a random personal purpose
export function getRandomPersonalPurpose(): string {
  return PERSONAL_PURPOSES[Math.floor(Math.random() * PERSONAL_PURPOSES.length)];
}
