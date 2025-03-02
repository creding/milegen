export const HOLIDAYS = {
  2023: [
    "2023-01-02",
    "2023-01-16",
    "2023-02-20",
    "2023-05-29",
    "2023-06-19",
    "2023-07-04",
    "2023-09-04",
    "2023-10-09",
    "2023-11-10",
    "2023-11-23",
    "2023-12-25",
  ],
  2024: [
    "2024-01-01",
    "2024-01-15",
    "2024-02-19",
    "2024-05-27",
    "2024-07-04",
    "2024-09-02",
    "2024-10-14",
    "2024-11-11",
    "2024-11-28",
    "2024-12-25",
  ],
  2025: [
    "2025-01-01",
    "2025-01-20",
    "2025-02-17",
    "2025-05-26",
    "2025-07-04",
    "2025-09-01",
    "2025-10-13",
    "2025-11-11",
    "2025-11-27",
    "2025-12-25",
  ],
  2026: [
    "2026-01-01",
    "2026-01-19",
    "2026-02-16",
    "2026-05-25",
    "2026-07-04",
    "2026-09-07",
    "2026-10-12",
    "2026-11-11",
    "2026-11-26",
    "2026-12-25",
  ],
  2027: [
    "2027-01-01",
    "2027-01-18",
    "2027-02-15",
    "2027-05-31",
    "2027-07-04",
    "2027-09-06",
    "2027-10-11",
    "2027-11-11",
    "2027-11-25",
    "2027-12-25",
  ],
  2028: [
    "2028-01-01",
    "2028-01-17",
    "2028-02-21",
    "2028-05-29",
    "2028-07-04",
    "2028-09-04",
    "2028-10-09",
    "2028-11-10",
    "2028-11-23",
    "2028-12-25",
  ],
  2029: [
    "2029-01-01",
    "2029-01-15",
    "2029-02-19",
    "2029-05-28",
    "2029-07-04",
    "2029-09-03",
    "2029-10-08",
    "2029-11-12",
    "2029-11-22",
    "2029-12-25",
  ],
  2030: [
    "2030-01-01",
    "2030-01-21",
    "2030-02-18",
    "2030-05-27",
    "2030-07-04",
    "2030-09-02",
    "2030-10-14",
    "2030-11-11",
    "2030-11-28",
    "2030-12-25",
  ],
}

// Standard business mileage deduction rates by year (dollars per mile)
// Source: IRS standard mileage rates
export const BUSINESS_MILEAGE_RATES = {
  2020: 0.575, // 57.5 cents per mile
  2021: 0.56,  // 56 cents per mile
  2022: 0.585, // 58.5 cents per mile for first half, 62.5 cents per mile for second half (using lower value for safety)
  2023: 0.655, // 65.5 cents per mile
  2024: 0.67,  // 67 cents per mile
  2025: 0.67,  // Using 2024 rate as placeholder until IRS announces 2025 rate
  2026: 0.67,  // Using 2024 rate as placeholder until IRS announces 2026 rate
  2027: 0.67,  // Using 2024 rate as placeholder until IRS announces 2027 rate
  2028: 0.67,  // Using 2024 rate as placeholder until IRS announces 2028 rate
  2029: 0.67,  // Using 2024 rate as placeholder until IRS announces 2029 rate
  2030: 0.67,  // Using 2024 rate as placeholder until IRS announces 2030 rate
};

// Gets the business mileage rate for a given year
// If the year is not found, returns the most recent known rate
export function getBusinessMileageRate(year: number): number {
  if (year in BUSINESS_MILEAGE_RATES) {
    return BUSINESS_MILEAGE_RATES[year as keyof typeof BUSINESS_MILEAGE_RATES];
  }
  
  // If the year is not found, use the most recent year's rate
  const years = Object.keys(BUSINESS_MILEAGE_RATES).map(Number);
  const mostRecentYear = Math.max(...years);
  return BUSINESS_MILEAGE_RATES[mostRecentYear as keyof typeof BUSINESS_MILEAGE_RATES];
}
