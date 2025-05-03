"use client";

import { useMediaQuery } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Stepper, Button, Group, Box } from "@mantine/core";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";
import { useState, useEffect } from "react";
import {
  IconCheck,
  IconCar,
  IconCalendar,
  IconRoute,
  IconFileCheck,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

// Import the new step components
import { VehicleInfoStep } from "./steps/VehicleInfoStep";
import { TripDetailsStep } from "./steps/TripDetailsStep";
import { DateRangeStep } from "./steps/DateRangeStep";
import { ReviewStep } from "./steps/ReviewStep";

import { BUSINESS_TYPES } from "@/utils/mileageUtils";
import {
  VEHICLE_MAKES, // Import the constant array
  VEHICLE_MODELS, // Import the models object/map
} from "@/utils/constants";

interface MileageFormProps {
  startMileage: string;
  endMileage: string;
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  vehicle: string;
  businessType: string;
  subscriptionStatus: string | null;
  onStartMileageChange: (value: string) => void;
  onEndMileageChange: (value: string) => void;
  onStartDateChange: (value: Date) => void;
  onEndDateChange: (value: Date) => void;
  onTotalPersonalMilesChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onBusinessTypeChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

interface FormValues {
  startMileage: string;
  endMileage: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  startDate: Date | null;
  endDate: Date | null;
  totalPersonalMiles: string;
  businessType: string;
}

export function MileageForm({
  startMileage,
  endMileage,
  startDate,
  endDate,
  totalPersonalMiles,
  vehicle,
  businessType,
  subscriptionStatus,
  onStartMileageChange,
  onEndMileageChange,
  onStartDateChange,
  onEndDateChange,
  onTotalPersonalMilesChange,
  onVehicleChange,
  onBusinessTypeChange,
  onGenerate,
  onReset,
}: MileageFormProps) {
  const isMobile = useMediaQuery("(max-width: 768px)") || false;
  const [activeStep, setActiveStep] = useState(0);

  // Parse existing vehicle string into make, model, year if possible
  const parseVehicle = (
    vehicleStr: string
  ): { make: string; model: string; year: string } => {
    // Try to match pattern like "2022 Toyota Camry"
    const match = vehicleStr.match(/(\d{4})\s+([\w-]+)\s+([\w-]+)/);
    if (match) {
      const [, year, make, model] = match;
      return { year, make: make.toLowerCase(), model: model.toLowerCase() };
    }
    return { make: "", model: "", year: "" };
  };

  // Initial vehicle parts
  const initialVehicle = parseVehicle(vehicle);

  // State for vehicle parts
  const [vehicleMake, setVehicleMake] = useState(initialVehicle.make);
  const [vehicleModel, setVehicleModel] = useState(initialVehicle.model);
  const [vehicleYear, setVehicleYear] = useState(initialVehicle.year);

  // Available models based on selected make
  const [availableModels, setAvailableModels] = useState<
    { value: string; label: string }[]
  >(
    vehicleMake && VEHICLE_MODELS[vehicleMake]
      ? VEHICLE_MODELS[vehicleMake]
      : []
  );

  // Update available models when make changes
  useEffect(() => {
    if (vehicleMake && VEHICLE_MODELS[vehicleMake]) {
      setAvailableModels(VEHICLE_MODELS[vehicleMake]);
    } else {
      setAvailableModels([]);
    }
  }, [vehicleMake]);

  // Update the vehicle string when any part changes
  useEffect(() => {
    if (vehicleMake && vehicleModel && vehicleYear) {
      // Find the display labels
      const makeLabel =
        VEHICLE_MAKES.find((m) => m.value === vehicleMake)?.label || "";
      const modelLabel =
        availableModels.find((m) => m.value === vehicleModel)?.label || "";

      // Format the vehicle string: "2022 Toyota Camry"
      const vehicleString = `${vehicleYear} ${makeLabel} ${modelLabel}`.trim();

      if (vehicleString.split(" ").length >= 3) {
        onVehicleChange(vehicleString);
      }
    }
  }, [
    vehicleMake,
    vehicleModel,
    vehicleYear,
    availableModels,
    onVehicleChange,
  ]);

  // Handle make selection
  const handleMakeChange = (value: string | null) => {
    const newMake = value || "";
    setVehicleMake(newMake);
    setVehicleModel(""); // Reset model when make changes
  };

  // Handle model selection
  const handleModelChange = (value: string | null) => {
    setVehicleModel(value || "");
  };

  // Handle year selection
  const handleYearChange = (value: string | null) => {
    setVehicleYear(value || "");
  };

  // Create business type options for the select dropdown
  const businessTypeOptions = BUSINESS_TYPES.map(
    (type: { name: string; purposes: string[] }) => ({
      value: type.name,
      label: type.name,
    })
  );

  const form = useForm<FormValues>({
    initialValues: {
      startMileage: startMileage,
      endMileage: endMileage,
      startDate: startDate,
      endDate: endDate,
      totalPersonalMiles: totalPersonalMiles,
      vehicleMake: vehicleMake,
      vehicleModel: vehicleModel,
      vehicleYear: vehicleYear,
      businessType: businessType,
    },
    validate: {
      startMileage: (value) => (value ? null : "Start mileage is required"),
      endMileage: (value, values) =>
        value
          ? parseInt(value) <= parseInt(values.startMileage)
            ? "End mileage must be greater than start mileage"
            : null
          : "End mileage is required",
      startDate: (value) => (value ? null : "Start date is required"),
      endDate: (value, values) => validateDates(values.startDate, value),
      totalPersonalMiles: (value, values) => {
        const totalMiles =
          parseInt(values.endMileage) - parseInt(values.startMileage);
        return value !== undefined && value !== null
          ? parseInt(value) > totalMiles
            ? `Personal miles cannot exceed total miles (${totalMiles})`
            : null
          : "Personal miles is required";
      },
      vehicleMake: (value) => (value ? null : "Vehicle make is required"),
      vehicleModel: (value) => (value ? null : "Vehicle model is required"),
      vehicleYear: (value) => (value ? null : "Vehicle year is required"),
      businessType: (value) => (value ? null : "Business type is required"),
    },
  });

  // Custom validation function for dates
  const validateDates = (start: Date | null, end: Date | null) => {
    // If either date is null, let the 'required' validation handle it
    if (!start || !end) {
      return null;
    }
    // Ensure end date is not before start date
    if (new Date(end) < new Date(start)) {
      return "End date cannot be before start date";
    }
    return null;
  };

  // Handle date changes separately since they're not string values
  const handleStartDateChange = (date: Date) => {
    form.setFieldValue("startDate", date);
    onStartDateChange(date);
  };

  const handleEndDateChange = (date: Date) => {
    form.setFieldValue("endDate", date);
    onEndDateChange(date);
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      onGenerate();
    }
  };

  const handleReset = () => {
    form.reset();
    onReset();
    setActiveStep(0);
  };

  // Step validation functions
  const validateVehicleStep = () => {
    const startMileageError = form.validateField("startMileage").error;
    const endMileageError = form.validateField("endMileage").error;
    const vehicleMakeError = form.validateField("vehicleMake").error;
    const vehicleModelError = form.validateField("vehicleModel").error;
    const vehicleYearError = form.validateField("vehicleYear").error;

    return (
      !startMileageError &&
      !endMileageError &&
      !vehicleMakeError &&
      !vehicleModelError &&
      !vehicleYearError
    );
  };

  const validateDateStep = () => {
    // Date fields are always valid since they have default values
    return true;
  };

  const validateTripDetailsStep = () => {
    const personalMilesError = form.validateField("totalPersonalMiles").error;
    const businessTypeError = form.validateField("businessType").error;

    return !personalMilesError && !businessTypeError;
  };

  const nextStep = () => {
    if (activeStep === 0 && !validateVehicleStep()) {
      return;
    } else if (activeStep === 1 && !validateDateStep()) {
      return;
    } else if (activeStep === 2 && !validateTripDetailsStep()) {
      return;
    }

    setActiveStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  // Calculate total miles and business miles
  const totalMiles =
    parseInt(form.values.endMileage) - parseInt(form.values.startMileage) || 0;
  const businessMiles =
    totalMiles - (parseInt(form.values.totalPersonalMiles) || 0);

  return (
    <Box p="md">
      {subscriptionStatus !== "active" && <SubscriptionAlert mb="md" />}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stepper active={activeStep} onStepClick={setActiveStep}>
          <Stepper.Step
            label="Vehicle Information"
            description="Odometer readings"
            icon={<IconCar size={18} />}
            allowStepSelect={activeStep > 0}
          >
            {/* Replace inline JSX with VehicleInfoStep component */}
            <VehicleInfoStep
              form={form}
              isMobile={isMobile}
              onStartMileageChange={onStartMileageChange}
              onEndMileageChange={onEndMileageChange}
              availableModels={availableModels}
              handleMakeChange={handleMakeChange}
              handleModelChange={handleModelChange}
              handleYearChange={handleYearChange}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Trip Details"
            description="Enter trip info"
            icon={<IconRoute size={18} />}
            allowStepSelect={activeStep > 1}
          >
            {/* Replace inline JSX with TripDetailsStep component */}
            <TripDetailsStep
              form={form}
              businessTypeOptions={businessTypeOptions}
              onBusinessTypeChange={onBusinessTypeChange}
              onTotalPersonalMilesChange={onTotalPersonalMilesChange}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Date Range"
            description="Start and end dates"
            icon={<IconCalendar size={18} />}
            allowStepSelect={activeStep > 2}
          >
            {/* Replace inline JSX with DateRangeStep component */}
            <DateRangeStep
              form={form}
              isMobile={isMobile}
              startDate={startDate} // Pass state variable
              handleStartDateChange={handleStartDateChange} // Pass state handler
              endDate={endDate} // Pass state variable
              handleEndDateChange={handleEndDateChange} // Pass state handler
            />
          </Stepper.Step>

          <Stepper.Step
            label="Review & Generate"
            description="Confirm and create log"
            icon={<IconFileCheck size={18} />}
          >
            {/* Replace inline JSX with ReviewStep component */}
            <ReviewStep
              form={form}
              totalMiles={totalMiles}
              businessMiles={businessMiles}
              availableModels={availableModels} // Pass needed state/constants for display
            />
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          {activeStep > 0 ? (
            <Button
              variant="default"
              onClick={prevStep}
              leftSection={<IconChevronLeft size={14} />}
              size={isMobile ? "md" : "sm"}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="light"
              color="gray"
              onClick={handleReset}
              size={isMobile ? "md" : "sm"}
            >
              Reset
            </Button>
          )}

          {activeStep === 3 ? (
            <Button
              variant="gradient"
              onClick={handleSubmit}
              size={isMobile ? "md" : "sm"}
              rightSection={<IconCheck size={14} />}
            >
              Generate Log
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              variant="filled"
              size={isMobile ? "md" : "sm"}
              rightSection={<IconChevronRight size={14} />}
            >
              Next Step
            </Button>
          )}
        </Group>
      </form>
    </Box>
  );
}
