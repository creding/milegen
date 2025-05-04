// Note: This utility is no longer used after refactoring ReviewStep
/*
export const getVehicleLabel = (formValues: FormValues): string => {
  if (!formValues.vehicleMake || !formValues.vehicleModel || !formValues.vehicleYear) {
    return "Vehicle information incomplete";
  }

  const make = VEHICLE_MAKES.find((m: VehicleOption) => m.value === formValues.vehicleMake);
  const modelData = VEHICLE_MODELS[formValues.vehicleMake];
  const model = modelData?.find((m: VehicleOption) => m.value === formValues.vehicleModel);

  if (make && model) {
    return `${formValues.vehicleYear} ${make.label} ${model.label}`.trim();
  } else {
    // Fallback if labels not found, use raw values
    return `${formValues.vehicleYear} ${formValues.vehicleMake} ${formValues.vehicleModel}`.trim();
  }
};
*/
