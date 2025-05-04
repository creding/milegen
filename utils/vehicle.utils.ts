import { FormValues } from '@/types/form_values.d';
import { VEHICLE_MAKES, VEHICLE_MODELS } from '@/utils/constants';

interface VehicleOption {
  value: string;
  label: string;
}

// Helper function to get display labels for vehicle
export const getVehicleLabel = (formValues: FormValues): string => {
  if (!formValues.vehicleMake || !formValues.vehicleModel || !formValues.vehicleYear) {
    return "Vehicle information incomplete";
  }
  const make = VEHICLE_MAKES.find((m: VehicleOption) => m.value === formValues.vehicleMake);
  const modelData = VEHICLE_MODELS[formValues.vehicleMake];
  const model = modelData?.find((m: VehicleOption) => m.value === formValues.vehicleModel);

  if (!make || !model) {
    // Fallback if labels not found, use raw values
    return `${formValues.vehicleYear} ${formValues.vehicleMake} ${formValues.vehicleModel}`.trim();
  }
  return `${formValues.vehicleYear} ${make.label} ${model.label}`.trim();
};
