// types/form_values.d.ts

// Central definition for the mileage form values
// Define the structure for vehicle select options
export interface VehicleOption {
  value: string;
  label: string;
}

// Define the structure for the form values
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
