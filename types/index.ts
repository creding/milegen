import { Tables } from "./database.types";

// Type for a Mileage Log fetched WITH its entries
export type MileageLogWithEntries = Tables<'mileage_logs'> & {
  log_entries: Tables<'mileage_log_entries'>[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalEntries: number;
    totalPages: number;
  };
};
