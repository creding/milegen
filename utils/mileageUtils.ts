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
      "Client Meeting",
      "Business Lunch",
      "Conference",
      "Site Inspection",
      "Sales Presentation",
      "Project Planning",
      "Strategy Session",
      "Contract Negotiation",
      "Team Workshop",
      "Client Training",
      "Product Demo",
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
      "Property Maintenance Check",
      "Staging Consultation",
      "Market Analysis Visit",
      "Closing Meeting",
      "Photography Session",
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
      "Continuing Education",
      "Medical Equipment Delivery",
      "Lab Sample Transport",
      "Insurance Meeting",
      "Pharmacy Delivery",
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
      "Catering Delivery",
      "Grocery Delivery",
      "Alcohol Delivery",
      "Special Order Pickup",
      "Multi-Order Delivery",
      "Restaurant Partner Meeting",
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
      "Late Night Service",
      "Corporate Client",
      "Scheduled Ride",
      "Long Distance Trip",
      "Premium Service",
      "Group Transportation",
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
      "Priority Package Delivery",
      "Return Pickup",
      "Signature Required Delivery",
      "Bulk Shipment",
      "Fragile Item Delivery",
      "International Shipping Dropoff",
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
      "Territory Canvassing",
      "Customer Follow-up",
      "Proposal Presentation",
      "Contract Signing",
      "Product Training",
      "Competitor Research",
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
      "Equipment Transport",
      "Permit Application",
      "Subcontractor Meeting",
      "Safety Inspection",
      "Project Estimation",
      "Tool Pickup",
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

// Enhanced personal purposes with weights and day-of-week preferences
export interface WeightedPurpose {
  purpose: string;
  weight: number;
  weekdayPreference: number; // 0-1 where 0 = weekend only, 1 = weekday only, 0.5 = equal
}

export const ENHANCED_PERSONAL_PURPOSES: WeightedPurpose[] = [
  { purpose: "Commuting", weight: 10, weekdayPreference: 0.9 },
  { purpose: "Grocery Shopping", weight: 8, weekdayPreference: 0.5 },
  { purpose: "Shopping", weight: 6, weekdayPreference: 0.4 },
  { purpose: "Medical Appointment", weight: 3, weekdayPreference: 0.8 },
  { purpose: "Gym/Fitness", weight: 7, weekdayPreference: 0.6 },
  { purpose: "Restaurant", weight: 6, weekdayPreference: 0.4 },
  { purpose: "Entertainment", weight: 5, weekdayPreference: 0.2 },
  { purpose: "Family Visit", weight: 5, weekdayPreference: 0.3 },
  { purpose: "Vacation", weight: 2, weekdayPreference: 0.1 },
  { purpose: "School Drop-off/Pick-up", weight: 8, weekdayPreference: 0.9 },
  { purpose: "Errands", weight: 7, weekdayPreference: 0.6 },
  { purpose: "Religious Activity", weight: 3, weekdayPreference: 0.2 },
  { purpose: "Volunteer Work", weight: 2, weekdayPreference: 0.5 },
  { purpose: "Home Improvement", weight: 3, weekdayPreference: 0.3 },
  { purpose: "Pet Care", weight: 4, weekdayPreference: 0.5 },
  { purpose: "Hobby", weight: 3, weekdayPreference: 0.4 },
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

// Get all dates in range
export function getAllDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  
  // Create a copy of the start date to avoid modifying the original
  let currentDate = new Date(startDate);
  
  // Loop through all dates in the range
  while (currentDate <= endDate) {
    // Add the current date to our array
    dates.push(new Date(currentDate));
    
    // Move to the next day
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
export function getRandomBusinessPurpose(businessType?: string, date?: Date): string {
  // If a business type is provided, get purposes specific to that type
  if (businessType) {
    const businessTypeObj = BUSINESS_TYPES.find(
      (type) => type.name === businessType
    );
    if (businessTypeObj && businessTypeObj.purposes.length > 0) {
      // Select a random purpose from the business type
      return businessTypeObj.purposes[
        Math.floor(Math.random() * businessTypeObj.purposes.length)
      ];
    }
  }

  // Seasonal business purposes
  if (date) {
    const month = date.getMonth();
    
    // Tax season (January - April)
    if (month >= 0 && month <= 3) {
      // 20% chance of tax-related purposes during tax season
      if (Math.random() < 0.2) {
        return "Tax Preparation";
      }
    }
    
    // Summer conference season (May - August)
    if (month >= 4 && month <= 7) {
      // 15% chance of conference during summer
      if (Math.random() < 0.15) {
        return "Conference";
      }
    }
    
    // End of year planning (October - December)
    if (month >= 9 && month <= 11) {
      // 15% chance of planning meetings at end of year
      if (Math.random() < 0.15) {
        return "Project Planning";
      }
    }
  }

  // Fallback to general business purposes
  return BUSINESS_PURPOSES[Math.floor(Math.random() * BUSINESS_PURPOSES.length)];
}

// Get a random personal purpose
export function getRandomPersonalPurpose(): string {
  return PERSONAL_PURPOSES[Math.floor(Math.random() * PERSONAL_PURPOSES.length)];
}

// Get a weighted random personal purpose based on day of week
export function getWeightedPersonalPurpose(date?: Date): string {
  // If no date provided, use current date
  const currentDate = date || new Date();
  const isWeekday = [1, 2, 3, 4, 5].includes(currentDate.getDay());
  
  // Calculate total weight considering day of week preference
  let totalWeight = 0;
  const adjustedWeights: number[] = [];
  
  ENHANCED_PERSONAL_PURPOSES.forEach(purpose => {
    // Adjust weight based on weekday/weekend
    let adjustedWeight = purpose.weight;
    if (isWeekday) {
      // On weekdays, increase weight for weekday activities
      adjustedWeight *= (0.5 + purpose.weekdayPreference/2);
    } else {
      // On weekends, increase weight for weekend activities
      adjustedWeight *= (1.5 - purpose.weekdayPreference/2);
    }
    
    adjustedWeights.push(adjustedWeight);
    totalWeight += adjustedWeight;
  });
  
  // Select a purpose based on weighted probability
  let random = Math.random() * totalWeight;
  let runningTotal = 0;
  
  for (let i = 0; i < adjustedWeights.length; i++) {
    runningTotal += adjustedWeights[i];
    if (random <= runningTotal) {
      return ENHANCED_PERSONAL_PURPOSES[i].purpose;
    }
  }
  
  // Fallback in case of rounding errors
  return ENHANCED_PERSONAL_PURPOSES[0].purpose;
}
