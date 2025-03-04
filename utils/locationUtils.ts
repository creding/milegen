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
    "Grocery Store",
    "Coffee Shop",
    "Gym",
    "Restaurant",
    "Store",
    "Park",
    "School"
  ],
  near: [
    "Mall",
    "Theater",
    "Friend's House",
    "Doctor's Office",
    "Dentist",
    "Community Center",
    "Library"
  ],
  medium: [
    "Shopping Center",
    "Entertainment Venue",
    "Family Home",
    "Store",
    "Medical Center",
    "Sports Complex",
    "Park"
  ],
  far: [
    "Weekend Destination",
    "Park",
    "Mall",
    "Medical Facility",
    "Family Visit",
    "Day Trip",
    "Event"
  ],
  veryFar: [
    "Vacation Destination",
    "Family Reunion",
    "Holiday Travel",
    "Out of State",
    "Tourist Attraction",
    "Extended Trip",
    "Event"
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
  "Errands": "veryNear"
};

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

// Helper function to get a random item from an array
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Find the appropriate location mapping for a given purpose and business type
function findLocationMapping(purpose: string, businessType?: string): LocationMapping | null {
  if (!businessType || !BUSINESS_TYPE_LOCATIONS[businessType]) {
    // Default fallback for unknown business types
    return null;
  }

  const mappings = BUSINESS_TYPE_LOCATIONS[businessType];
  return mappings.find(mapping => mapping.purpose === purpose) || null;
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

// Get a personal location based on purpose and miles
function getPersonalLocation(purpose: string, miles: number): string {
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
}

// Get a business location based on purpose, miles, and business type
function getBusinessLocation(purpose: string, miles: number, businessType?: string): string {
  // Find the appropriate location mapping
  const mapping = findLocationMapping(purpose, businessType);
  
  if (!mapping) {
    // Fallback to simple purpose-based location
    if (purpose.includes("Client")) {
      return "Client Office";
    } else if (purpose.includes("Meeting")) {
      return "Office";
    } else if (purpose.includes("Conference")) {
      // Conferences should be far
      return miles > 30 ? "Conference Center" : "Office";
    } else if (purpose.includes("Site")) {
      return "Site";
    } else if (purpose.includes("Property")) {
      return "Property";
    } else if (purpose.includes("Delivery")) {
      return "Customer Address";
    } else if (purpose.includes("Pickup")) {
      return "Pickup Location";
    } else {
      return "Office";
    }
  }
  
  // Special handling for specific purposes and miles
  let distanceCategory = mapping.distanceCategory;
  
  // Ensure conferences and trade shows are appropriately distant
  if ((purpose === "Conference" || purpose === "Trade Show") && miles > 30) {
    distanceCategory = miles >= 100 ? "veryFar" : "far";
  } 
  // Ensure client visits match the mileage
  else if (purpose.includes("Client") && Math.abs(miles - DISTANCE_CATEGORIES[distanceCategory].max) > 10) {
    distanceCategory = findDistanceCategory(miles);
  }
  
  // Get location types appropriate for the distance category
  let locationTypes = mapping.locationTypes;
  
  // Get a random location type from the mapping
  return getRandomItem(locationTypes);
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
  if (type === 'personal') {
    return getPersonalLocation(purpose, miles);
  } else {
    return getBusinessLocation(purpose, miles, businessType);
  }
}
