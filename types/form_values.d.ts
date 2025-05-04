// types/form_values.d.ts

// Central definition for the mileage form values
export interface FormValues {
  startMileage: string | undefined; // Allow undefined
  endMileage: string | undefined;   // Allow undefined
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: string | undefined; // Allow undefined
  businessType: string;
}
