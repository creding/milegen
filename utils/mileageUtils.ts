import { format } from "date-fns";
import { HOLIDAYS } from "./constants"; // Import HOLIDAYS

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
      "Client Visit",
      "Client Visit",
      "Client Visit",
      "Client Visit",
      "Client Visit",
      "Client Visit",
      "Client Visit",
      "Client Meeting",
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
      "Property Showing",
      "Property Showing",
      "Property Showing",
      "Property Showing",
      "Property Showing",
      "Property Showing",
      "Property Showing",
      "Property Inspection",
      "Client Meeting",
      "Open House",
      "Appointment",
      "Market Research",
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
      "Delivery",
      "Delivery",
      "Delivery",
      "Delivery",
    ],
  },
  {
    name: "Food Delivery",
    purposes: [
      "Food Delivery",
      "Food Delivery",
      "Food Delivery",
      "Grocery Delivery",
      "Alcohol Delivery",
    ],
  },
  {
    name: "Rideshare",
    purposes: ["Passenger Pickup"],
  },
  {
    name: "Courier",
    purposes: ["Delivery"],
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

/**
 * Checks if a given date is a holiday based on the HOLIDAYS constant.
 * @param date The date to check.
 * @param holidays The holiday data structure.
 * @returns True if the date is a holiday, false otherwise.
 */
export function isHoliday(date: Date, holidays: typeof HOLIDAYS): boolean {
  const year = date.getFullYear();
  const formattedDate = format(date, "yyyy-MM-dd");
  const yearKey = year as keyof typeof HOLIDAYS;
  const isHolidayResult = holidays[yearKey]?.includes(formattedDate) || false;
  return isHolidayResult;
}
