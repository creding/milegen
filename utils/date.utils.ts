import { format } from 'date-fns';

// Helper function to format dates safely
export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    // Using a common, unambiguous format
    return format(date, "MM/dd/yyyy"); 
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};
