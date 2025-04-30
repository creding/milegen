// Smart Location Generation System
// This file implements the location generation system as outlined in docs/LOCATION_GENERATION_PLAN.md

import { BusinessType, BUSINESS_TYPES } from "./mileageUtils";

// Distance categories in miles
export const DISTANCE_CATEGORIES = {
  veryNear: { min: 1, max: 5 },
  near: { min: 5, max: 15 },
  medium: { min: 15, max: 30 },
  far: { min: 30, max: 100 },
  veryFar: { min: 100, max: 500 }
};

// Frequency weights (higher = more frequent)
export const FREQUENCY_WEIGHTS = {
  veryHigh: 10,
  high: 7,
  medium: 4,
  low: 2,
  veryLow: 1
};

// Types for location mappings
export type DistanceCategory = keyof typeof DISTANCE_CATEGORIES;
export type FrequencyWeight = keyof typeof FREQUENCY_WEIGHTS;

export interface LocationMapping {
  purpose: string;
  locationTypes: string[];
  distanceCategory: DistanceCategory;
  frequency: FrequencyWeight;
}

export interface BusinessTypeLocationMap {
  [businessType: string]: LocationMapping[];
}

// Location mappings for each business type
const CONSULTING_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Client Visit",
    locationTypes: ["Client Office", "Office", "Business Park"],
    distanceCategory: "medium",
    frequency: "veryHigh"
  },
  {
    purpose: "Client Meeting",
    locationTypes: ["Office", "Client Office", "Meeting Room"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Business Lunch",
    locationTypes: ["Restaurant", "Cafe", "Dining"],
    distanceCategory: "near",
    frequency: "medium"
  },
  {
    purpose: "Conference",
    locationTypes: ["Conference Center", "Hotel", "Convention Center"],
    distanceCategory: "far",
    frequency: "low"
  },
  {
    purpose: "Site Inspection",
    locationTypes: ["Project Site", "Construction Site", "Site"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Sales Presentation",
    locationTypes: ["Client Office", "Office", "Meeting Room"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Project Planning",
    locationTypes: ["Office", "Client Site", "Meeting Room"],
    distanceCategory: "near",
    frequency: "medium"
  }
];

const REAL_ESTATE_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Property Showing",
    locationTypes: ["Property", "House", "Apartment"],
    distanceCategory: "near",
    frequency: "veryHigh"
  },
  {
    purpose: "Property Inspection",
    locationTypes: ["Property", "House", "Building"],
    distanceCategory: "near",
    frequency: "high"
  },
  {
    purpose: "Client Meeting",
    locationTypes: ["Office", "Property", "Home"],
    distanceCategory: "near",
    frequency: "high"
  },
  {
    purpose: "Open House",
    locationTypes: ["Property", "House", "Development"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Listing Appointment",
    locationTypes: ["Home", "Property", "Residence"],
    distanceCategory: "near",
    frequency: "high"
  },
  {
    purpose: "Market Research",
    locationTypes: ["Neighborhood", "Development", "District"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Property Appraisal",
    locationTypes: ["Property", "House", "Building"],
    distanceCategory: "medium",
    frequency: "medium"
  }
];

const HEALTHCARE_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Patient Visit",
    locationTypes: ["Patient Home", "Residence", "Care Facility"],
    distanceCategory: "near",
    frequency: "veryHigh"
  },
  {
    purpose: "Medical Conference",
    locationTypes: ["Medical Center", "Conference Hall", "Hospital"],
    distanceCategory: "far",
    frequency: "low"
  },
  {
    purpose: "Supply Pickup",
    locationTypes: ["Medical Supply", "Pharmacy", "Warehouse"],
    distanceCategory: "near",
    frequency: "medium"
  },
  {
    purpose: "Training Session",
    locationTypes: ["Medical School", "Training Center", "Hospital"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Facility Inspection",
    locationTypes: ["Clinic", "Hospital", "Medical Office"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Professional Meeting",
    locationTypes: ["Medical Association", "Hospital", "Office"],
    distanceCategory: "medium",
    frequency: "medium"
  }
];

const FOOD_DELIVERY_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Food Delivery",
    locationTypes: ["Customer Home", "Apartment", "Office"],
    distanceCategory: "veryNear",
    frequency: "veryHigh"
  },
  {
    purpose: "Restaurant Pickup",
    locationTypes: ["Restaurant", "Fast Food", "Cafe"],
    distanceCategory: "veryNear",
    frequency: "veryHigh"
  },
  {
    purpose: "Customer Delivery",
    locationTypes: ["Home", "Apartment", "Office"],
    distanceCategory: "veryNear",
    frequency: "veryHigh"
  },
  {
    purpose: "Supply Pickup",
    locationTypes: ["Supply Store", "Warehouse", "Distribution Center"],
    distanceCategory: "medium",
    frequency: "low"
  }
];

const RIDESHARE_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Passenger Pickup",
    locationTypes: ["Home", "Hotel", "Office", "Mall"],
    distanceCategory: "veryNear",
    frequency: "veryHigh"
  },
  {
    purpose: "Passenger Dropoff",
    locationTypes: ["Airport", "Train Station", "Hotel", "Office"],
    distanceCategory: "near",
    frequency: "veryHigh"
  },
  {
    purpose: "Airport Transfer",
    locationTypes: ["Airport", "Terminal", "Airfield"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Event Transportation",
    locationTypes: ["Venue", "Stadium", "Convention Center"],
    distanceCategory: "medium",
    frequency: "medium"
  }
];

const COURIER_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Package Delivery",
    locationTypes: ["Home", "Office", "Building"],
    distanceCategory: "veryNear",
    frequency: "veryHigh"
  },
  {
    purpose: "Package Pickup",
    locationTypes: ["Shipping Center", "Post Office", "Office"],
    distanceCategory: "veryNear",
    frequency: "veryHigh"
  },
  {
    purpose: "Warehouse Visit",
    locationTypes: ["Warehouse", "Distribution Center", "Storage Facility"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Distribution Center",
    locationTypes: ["Distribution Center", "Warehouse", "Logistics Center"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Express Delivery",
    locationTypes: ["Office", "Business", "Medical Facility"],
    distanceCategory: "near",
    frequency: "high"
  }
];

const SALES_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Sales Call",
    locationTypes: ["Client Office", "Office", "Store"],
    distanceCategory: "medium",
    frequency: "veryHigh"
  },
  {
    purpose: "Client Presentation",
    locationTypes: ["Client Office", "Meeting Room", "Office"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Product Demo",
    locationTypes: ["Client Site", "Showroom", "Office"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Trade Show",
    locationTypes: ["Convention Center", "Expo Hall", "Exhibition Center"],
    distanceCategory: "far",
    frequency: "low"
  },
  {
    purpose: "Client Meeting",
    locationTypes: ["Client Office", "Office", "Business Park"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Networking Event",
    locationTypes: ["Hotel", "Business Club", "Conference Center"],
    distanceCategory: "near",
    frequency: "medium"
  }
];

const CONSTRUCTION_LOCATIONS: LocationMapping[] = [
  {
    purpose: "Job Site Visit",
    locationTypes: ["Construction Site", "Building Project", "Site"],
    distanceCategory: "medium",
    frequency: "veryHigh"
  },
  {
    purpose: "Material Pickup",
    locationTypes: ["Supply Store", "Lumber Yard", "Warehouse"],
    distanceCategory: "near",
    frequency: "high"
  },
  {
    purpose: "Client Meeting",
    locationTypes: ["Site", "Client Office", "Property"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Supplier Visit",
    locationTypes: ["Supplier", "Vendor", "Store"],
    distanceCategory: "medium",
    frequency: "medium"
  },
  {
    purpose: "Inspection",
    locationTypes: ["Site", "Building", "Property"],
    distanceCategory: "medium",
    frequency: "high"
  },
  {
    purpose: "Bid Presentation",
    locationTypes: ["Client Office", "Site", "Office"],
    distanceCategory: "medium",
    frequency: "medium"
  }
];

// Personal locations by distance category
const PERSONAL_LOCATIONS: Record<DistanceCategory, string[]> = {
  veryNear: [
    "Kroger Grocery Store",
    "Starbucks Coffee",
    "Planet Fitness",
    "Chipotle Restaurant",
    "Walgreens",
    "City Park",
    "Elementary School",
    "Local Pharmacy",
    "7-Eleven",
    "Neighborhood Cafe",
    "Corner Market",
    "Public Library",
    "Post Office"
  ],
  near: [
    "Westfield Mall",
    "AMC Theater",
    "Friend's House",
    "Dr. Johnson's Office",
    "Aspen Dental",
    "Community Center",
    "Public Library",
    "Target",
    "Home Depot",
    "LA Fitness",
    "Trader Joe's",
    "Whole Foods Market",
    "PetSmart"
  ],
  medium: [
    "Oakwood Shopping Center",
    "Performing Arts Center",
    "Family Home",
    "IKEA",
    "Regional Medical Center",
    "Sports Complex",
    "State Park",
    "Outlet Mall",
    "Costco Wholesale",
    "University Campus",
    "County Fairgrounds",
    "Golf Course"
  ],
  far: [
    "Lakeside Resort",
    "Premium Outlets",
    "Memorial Hospital",
    "Family Visit",
    "Wine Country",
    "Concert Venue",
    "State Fair",
    "National Park",
    "Beach Resort",
    "Mountain Retreat"
  ],
  veryFar: [
    "Disney World",
    "Family Reunion",
    "Holiday Travel",
    "Grand Canyon",
    "Las Vegas Strip",
    "New York City",
    "Cruise Port",
    "Yellowstone National Park",
    "Miami Beach",
    "San Francisco"
  ]
};

// Map personal purposes to distance categories
const PERSONAL_PURPOSE_MAPPING: Record<string, DistanceCategory> = {
  "Personal Visit": "near",
  "Shopping": "near",
  "Grocery Shopping": "veryNear",
  "Medical Appointment": "near",
  "Gym": "veryNear",
  "Restaurant": "near",
  "Entertainment": "medium",
  "Family Visit": "medium",
  "Vacation": "veryFar",
  "School Pickup": "veryNear",
  "Errands": "veryNear",
  "Commuting": "near",
  "Gym/Fitness": "veryNear",
  "School Drop-off/Pick-up": "veryNear",
  "Religious Activity": "near",
  "Volunteer Work": "near",
  "Home Improvement": "near",
  "Pet Care": "veryNear",
  "Hobby": "medium"
};

// Purpose-specific location mapping for more realistic location generation
interface WeightedLocation {
  location: string;
  weight: number;
}

const PURPOSE_LOCATION_MAPPING: Record<string, WeightedLocation[]> = {
  "Client Visit": [
    { location: "Client Office", weight: 5 },
    { location: "Office", weight: 3 },
    { location: "Business Park", weight: 1 }
  ],
  "Client Meeting": [
    { location: "Office", weight: 5 },
    { location: "Client Office", weight: 4 },
    { location: "Meeting Room", weight: 2 }
  ],
  "Property Showing": [
    { location: "Property", weight: 6 },
    { location: "House", weight: 3 },
    { location: "Apartment", weight: 2 }
  ],
  "Property Inspection": [
    { location: "Property", weight: 5 },
    { location: "House", weight: 3 },
    { location: "Building", weight: 1 }
  ],
  "Patient Visit": [
    { location: "Patient Home", weight: 7 },
    { location: "Residence", weight: 2 },
    { location: "Care Facility", weight: 1 }
  ],
  "Food Delivery": [
    { location: "Customer Home", weight: 6 },
    { location: "Apartment", weight: 3 },
    { location: "Office", weight: 2 }
  ],
  "Restaurant Pickup": [
    { location: "Restaurant", weight: 7 },
    { location: "Fast Food", weight: 2 },
    { location: "Cafe", weight: 1 }
  ],
  "Passenger Pickup": [
    { location: "Residential Address", weight: 5 },
    { location: "Business District", weight: 3 },
    { location: "Shopping Center", weight: 2 },
    { location: "Airport", weight: 1 } // Lower weight unless miles are high (handled later)
  ],
  "Package Delivery": [
    { location: "Home", weight: 4 },
    { location: "Office", weight: 3 },
    { location: "Building", weight: 2 },
    { location: "Distribution Center", weight: 1 } // Lower weight unless miles are high
  ],
  "Package Pickup": [
    { location: "Warehouse", weight: 4 },
    { location: "Distribution Center", weight: 3 },
    { location: "Business", weight: 2 },
    { location: "Retail Store", weight: 1 }
  ],
  "Sales Call": [
    { location: "Client Office", weight: 5 },
    { location: "Office", weight: 3 },
    { location: "Store", weight: 1 }
  ],
  "Job Site Visit": [
    { location: "Construction Site", weight: 6 },
    { location: "Building Project", weight: 3 },
    { location: "Site", weight: 1 }
  ],
  "Material Pickup": [
    { location: "Hardware Store", weight: 4 },
    { location: "Supplier Warehouse", weight: 3 },
    { location: "Building Supply", weight: 2 }
  ],
  "Business Lunch": [
    { location: "Restaurant", weight: 6 },
    { location: "Cafe", weight: 3 },
    { location: "Dining", weight: 1 }
  ],
  "Conference": [
    { location: "Conference Center", weight: 5 },
    { location: "Hotel", weight: 3 },
    { location: "Convention Center", weight: 2 }
  ],
  // Add weights to other existing simple mappings or add new ones
  "Training Session": [{ location: "Training Center", weight: 1 }],
  "Site Inspection": [{ location: "Project Site", weight: 1 }],
  "Sales Presentation": [{ location: "Client Office", weight: 1 }],
  "Project Planning": [{ location: "Office", weight: 1 }],
  "Supply Pickup": [{ location: "Warehouse", weight: 1 }],
  "Networking Event": [{ location: "Hotel", weight: 1 }]
  // Add more purpose-specific locations as needed
};

// Helper function to get a random item from an array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to get a random weighted item
function getRandomWeightedItem(items: WeightedLocation[]): string {
  if (!items || items.length === 0) {
    return "Unknown Location"; // Fallback
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random < item.weight) {
      return item.location;
    }
    random -= item.weight;
  }

  // Fallback in case of rounding errors or empty list
  return items[items.length - 1]?.location || "Unknown Location";
}

// Get a business location based on purpose, miles, and business type
/**
 * Get a business location based on purpose, miles, and business type.
 *
 * @param purpose The purpose of the trip.
 * @param miles The miles driven for the trip.
 * @param businessType The type of business (optional).
 * @returns A randomly selected business location based on the purpose.
 */
export function getBusinessLocation(
  purpose: string,
  miles: number, // Add miles parameter
  businessType?: string // Add businessType parameter
): string { // Revert return type to string
  // First check if we have specific locations for this purpose
  if (purpose in PURPOSE_LOCATION_MAPPING) {
    const specificLocations = PURPOSE_LOCATION_MAPPING[purpose];
    // Use weighted selection
    return getRandomWeightedItem(specificLocations);
  }

  // Handle specific business types
  if (businessType) {
    if (businessType === "Real Estate" && purpose.includes("Property")) {
      return miles > 20 ? "Luxury Property" : "Residential Property";
    } else if (businessType === "Healthcare" && purpose.includes("Patient")) {
      return "Patient Home";
    } else if (businessType === "Food Delivery" && purpose === "Food Delivery") {
      return "Restaurant";
    } else if (businessType === "Rideshare" && purpose === "Passenger Pickup") {
      return miles > 15 ? "Airport" : "Residential Address";
    } else if (businessType === "Courier" && purpose === "Package Delivery") {
      return miles > 20 ? "Distribution Center" : "Residential Address";
    } else if (businessType === "Construction" && purpose === "Job Site Visit") {
      return "Construction Site";
    }
  }

  // Handle specific purposes
  if (purpose.includes("Client")) {
    return miles > 20 ? "Client Headquarters" : "Client Office";
  } else if (purpose.includes("Meeting")) {
    return "Office";
  } else if (purpose.includes("Conference")) {
    // Conferences should be far
    return miles > 30 ? "Conference Center" : "Office";
  } else if (purpose.includes("Site")) {
    return "Site";
  } else if (purpose.includes("Sales")) {
    return miles > 20 ? "Regional Office" : "Client Office";
  } else if (purpose.includes("Lunch")) {
    return "Restaurant";
  } else if (purpose.includes("Inspection")) {
    return "Project Site";
  } else if (purpose.includes("Planning")) {
    return "Office";
  } else if (purpose.includes("Pickup")) {
    return "Warehouse";
  }

  // Default based on distance
  if (miles > 50) {
    return "Regional Office";
  } else if (miles > 20) {
    return "Client Office";
  } else {
    return "Local Office";
  }

  // If no specific location found, return a generic fallback
  console.warn(`No specific business location mapping found for purpose: ${purpose}. Using fallback.`);
  // Ensure a string is always returned
  return "Misc Business Location"; 
}

// Get a personal location based on purpose and miles
/**
 * Get a personal location based on purpose and miles.
 *
 * @param purpose The purpose of the trip.
 * @param miles The number of miles driven (can influence location type).
 * @returns A randomly selected personal location based on the purpose.
 */
export function getPersonalLocation(
  purpose: string,
  miles: number // Add miles parameter
): string { // Revert return type to string
  // First check if we have specific locations for this purpose
  if (purpose in PURPOSE_LOCATION_MAPPING) {
    const specificLocations = PURPOSE_LOCATION_MAPPING[purpose];
    return getRandomWeightedItem(specificLocations);
  }

  // Determine the appropriate distance category
  let distanceCategory: DistanceCategory;

  if (purpose in PERSONAL_PURPOSE_MAPPING) {
    distanceCategory = PERSONAL_PURPOSE_MAPPING[purpose];

    // Adjust based on actual miles - ensure long-distance purposes get appropriate locations
    const actualCategory = findDistanceCategory(miles);

    // Special handling for specific purposes
    if (purpose === "Vacation") {
      // Vacations should always be far or very far
      distanceCategory = miles >= 100 ? "veryFar" : "far";
    } else if (purpose === "Family Visit" && miles > 30) {
      // Long family visits should be far
      distanceCategory = "far";
    } else if (miles > DISTANCE_CATEGORIES[distanceCategory].max) {
      // If miles are greater than the expected category's max, use the actual category
      distanceCategory = actualCategory;
    }
  } else {
    distanceCategory = findDistanceCategory(miles);
  }

  // Get a random location from the appropriate category
  const locationTypes = PERSONAL_LOCATIONS[distanceCategory];
  return getRandomItem(locationTypes);

  // If no specific location found, return a generic fallback
  console.warn(`No specific personal location mapping found for purpose: ${purpose}. Using fallback.`);
  // Ensure a string is always returned
  return "Misc Personal Location"; 
}

// Find the appropriate distance category for a given mileage
function findDistanceCategory(miles: number): DistanceCategory {
  for (const [category, range] of Object.entries(DISTANCE_CATEGORIES)) {
    if (miles >= range.min && miles <= range.max) {
      return category as DistanceCategory;
    }
  }

  // Default to appropriate category based on miles
  if (miles < 5) return "veryNear";
  if (miles < 15) return "near";
  if (miles < 30) return "medium";
  if (miles < 100) return "far";
  return "veryFar";
}

// Get a random mileage within a range
function getRandomMileage(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Round a number to one decimal place
function roundToOneDecimal(num: number): number {
  return Math.round(num * 10) / 10;
}

// Generate a trip mileage based on purpose
export function generatePurposeBasedMileage(purpose: string, type: 'business' | 'personal'): number {
  // Get the appropriate distance range for this purpose
  const range = PURPOSE_DISTANCE_RANGES[purpose] || {
    min: type === 'business' ? 5 : 2,
    max: type === 'business' ? 30 : 15,
    preferredCategory: type === 'business' ? "medium" : "near"
  };

  // Generate mileage within the appropriate range with some variation
  const baseMileage = getRandomMileage(range.min, range.max);

  // Add some randomness but keep within realistic bounds
  const variation = 0.8 + Math.random() * 0.4; // 80-120% variation
  return roundToOneDecimal(baseMileage * variation);
}

// Define realistic distance ranges for each purpose
export interface PurposeDistanceRange {
  min: number;
  max: number;
  preferredCategory: DistanceCategory;
}

export const PURPOSE_DISTANCE_RANGES: Record<string, PurposeDistanceRange> = {
  // Personal purposes
  "Vacation": { min: 50, max: 500, preferredCategory: "veryFar" },
  "Family Visit": { min: 10, max: 200, preferredCategory: "medium" },
  "Entertainment": { min: 5, max: 50, preferredCategory: "medium" },
  "Commuting": { min: 5, max: 30, preferredCategory: "near" },
  "School Drop-off/Pick-up": { min: 1, max: 10, preferredCategory: "veryNear" },
  "Grocery Shopping": { min: 1, max: 8, preferredCategory: "veryNear" },
  "Shopping": { min: 3, max: 20, preferredCategory: "near" },
  "Medical Appointment": { min: 2, max: 25, preferredCategory: "near" },
  "Gym/Fitness": { min: 1, max: 10, preferredCategory: "veryNear" },
  "Restaurant": { min: 2, max: 15, preferredCategory: "near" },
  "Errands": { min: 1, max: 10, preferredCategory: "veryNear" },
  "Religious Activity": { min: 2, max: 15, preferredCategory: "near" },
  "Volunteer Work": { min: 3, max: 20, preferredCategory: "near" },
  "Home Improvement": { min: 2, max: 15, preferredCategory: "near" },
  "Pet Care": { min: 1, max: 10, preferredCategory: "veryNear" },
  "Hobby": { min: 3, max: 25, preferredCategory: "medium" },
  "Personal Visit": { min: 3, max: 30, preferredCategory: "near" },

  // Business purposes
  "Conference": { min: 15, max: 300, preferredCategory: "far" },
  "Client Visit": { min: 5, max: 50, preferredCategory: "medium" },
  "Client Meeting": { min: 5, max: 50, preferredCategory: "medium" },
  "Business Lunch": { min: 3, max: 20, preferredCategory: "near" },
  "Site Inspection": { min: 10, max: 60, preferredCategory: "medium" },
  "Sales Presentation": { min: 5, max: 50, preferredCategory: "medium" },
  "Project Planning": { min: 5, max: 30, preferredCategory: "near" },
  "Property Showing": { min: 5, max: 30, preferredCategory: "near" },
  "Property Inspection": { min: 5, max: 30, preferredCategory: "near" },
  "Medical Conference": { min: 20, max: 300, preferredCategory: "far" },
  "Patient Visit": { min: 5, max: 40, preferredCategory: "medium" },
  "Food Delivery": { min: 2, max: 15, preferredCategory: "near" },
  "Passenger Pickup": { min: 2, max: 20, preferredCategory: "near" },
  "Package Delivery": { min: 3, max: 25, preferredCategory: "near" },
  "Sales Call": { min: 5, max: 50, preferredCategory: "medium" },
  "Job Site Visit": { min: 10, max: 60, preferredCategory: "medium" },
  "Material Pickup": { min: 5, max: 30, preferredCategory: "near" }
};

// Seasonal location options
const SEASONAL_LOCATIONS: Record<string, string[]> = {
  winter: [
    "Ski Resort",
    "Ice Skating Rink",
    "Winter Festival",
    "Holiday Market",
    "Indoor Mall"
  ],
  spring: [
    "Botanical Garden",
    "Farmers Market",
    "Spring Festival",
    "Garden Center",
    "Park"
  ],
  summer: [
    "Beach",
    "Water Park",
    "Summer Festival",
    "Outdoor Concert",
    "Baseball Game",
    "Swimming Pool",
    "Amusement Park"
  ],
  fall: [
    "Pumpkin Patch",
    "Apple Orchard",
    "Fall Festival",
    "Corn Maze",
    "Football Game"
  ]
};

// Purpose-specific seasonal locations for more realistic seasonal variation
const SEASONAL_PURPOSE_LOCATIONS: Record<string, Record<string, string[]>> = {
  winter: {
    "Vacation": ["Ski Resort", "Mountain Cabin", "Holiday Destination", "Winter Retreat"],
    "Entertainment": ["Ice Skating Rink", "Winter Festival", "Holiday Market", "Indoor Theater"],
    "Shopping": ["Holiday Market", "Shopping Mall", "Christmas Bazaar"],
    "Family Visit": ["Family Home", "Holiday Gathering", "Relative's House"]
  },
  spring: {
    "Vacation": ["Beach Resort", "National Park", "Spring Break Destination"],
    "Entertainment": ["Botanical Garden", "Spring Festival", "Outdoor Concert"],
    "Shopping": ["Farmers Market", "Garden Center", "Outlet Mall"],
    "Family Visit": ["Family Home", "Easter Gathering", "Graduation Ceremony"]
  },
  summer: {
    "Vacation": ["Beach Resort", "Lake House", "National Park", "Summer Cabin"],
    "Entertainment": ["Water Park", "Amusement Park", "Outdoor Concert", "Baseball Game"],
    "Shopping": ["Farmers Market", "Outdoor Mall", "Flea Market"],
    "Family Visit": ["Family Reunion", "Summer Cookout", "Vacation Home"]
  },
  fall: {
    "Vacation": ["Wine Country", "Fall Foliage Tour", "Mountain Retreat"],
    "Entertainment": ["Football Game", "Fall Festival", "Harvest Fair", "Corn Maze"],
    "Shopping": ["Farmers Market", "Pumpkin Patch", "Apple Orchard"],
    "Family Visit": ["Thanksgiving Gathering", "Family Home", "Harvest Celebration"]
  }
};

// Get the season based on date
function getSeason(date: Date): string {
  const month = date.getMonth();

  if (month >= 11 || month <= 1) { // December, January, February
    return "winter";
  } else if (month >= 2 && month <= 4) { // March, April, May
    return "spring";
  } else if (month >= 5 && month <= 7) { // June, July, August
    return "summer";
  } else { // September, October, November
    return "fall";
  }
}

/**
 * Generate a smart location based on trip purpose, miles driven, business type, and date
 *
 * @param purpose The purpose of the trip
 * @param miles The miles driven for the trip
 * @param type The type of trip (business or personal)
 * @param businessType The type of business (optional)
 * @param date The date of the trip (optional)
 * @returns A contextually appropriate location string
 */
export function generateSmartLocation(
  purpose: string,
  miles: number,
  type: 'business' | 'personal',
  businessType?: string,
  date?: Date
): string {
  return getLocation(purpose, miles, type, date, businessType);
}

// Get a location based on purpose, miles, type, and business type
export function getLocation(purpose: string, miles: number, type: 'business' | 'personal', date?: Date, businessType?: string): string {
  // If no date is provided, use current date
  const currentDate = date || new Date();
  const season = getSeason(currentDate);

  // Check for seasonal purposes that should have seasonal locations
  const seasonalPurposes = ["Vacation", "Entertainment", "Shopping", "Family Visit"];
  if (seasonalPurposes.includes(purpose)) {

    // 30% chance to use a seasonal location for these purposes
    if (Math.random() < 0.3) {
      if (purpose in SEASONAL_PURPOSE_LOCATIONS[season]) {
        return getRandomItem(SEASONAL_PURPOSE_LOCATIONS[season][purpose]);
      } else {
        return getRandomItem(SEASONAL_LOCATIONS[season]);
      }
    }
  }

  if (type === 'personal') {
    return getPersonalLocation(purpose, miles);
  } else {
    return getBusinessLocation(purpose, miles, businessType);
  }
}

// Compile all business type location mappings
export const BUSINESS_TYPE_LOCATIONS: BusinessTypeLocationMap = {
  "Consulting": CONSULTING_LOCATIONS,
  "Real Estate": REAL_ESTATE_LOCATIONS,
  "Healthcare": HEALTHCARE_LOCATIONS,
  "Food Delivery": FOOD_DELIVERY_LOCATIONS,
  "Rideshare": RIDESHARE_LOCATIONS,
  "Courier": COURIER_LOCATIONS,
  "Sales": SALES_LOCATIONS,
  "Construction": CONSTRUCTION_LOCATIONS
};
