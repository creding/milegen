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
  startDate: Date;
  endDate: Date;
  totalPersonalMiles: string;
  vehicle: string;
  businessType: string;
  subscriptionStatus: string | null;
  onStartDateChange: (value: Date) => void;
  onEndDateChange: (value: Date) => void;
  onTotalPersonalMilesChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onBusinessTypeChange: (value: string) => void;
  onGenerate: (values: FormValues) => Promise<void>;
  onReset: () => void;
}

// Export the FormValues interface
export interface FormValues {
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
  startDate,
  endDate,
  totalPersonalMiles,
  vehicle,
  businessType,
  subscriptionStatus,
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

  // Available models based on selected make (still need state for this)
  const [availableModels, setAvailableModels] = useState<
    { value: string; label: string }[]
  >([]);

  // Create business type options for the select dropdown
  const businessTypeOptions = BUSINESS_TYPES.map(
    (type: { name: string; purposes: string[] }) => ({
      value: type.name,
      label: type.name,
    })
  );

  const form = useForm<FormValues>({
    initialValues: {
      startMileage: "",
      endMileage: "",
      startDate: startDate,
      endDate: endDate,
      totalPersonalMiles: totalPersonalMiles,
      // Use parsed initial values directly
      vehicleMake: initialVehicle.make,
      vehicleModel: initialVehicle.model,
      vehicleYear: initialVehicle.year,
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

  // Update available models when make changes (use form value)
  useEffect(() => {
    const currentMake = form.values.vehicleMake;
    if (currentMake && VEHICLE_MODELS[currentMake]) {
      setAvailableModels(VEHICLE_MODELS[currentMake]);
      // Ensure model selection is reset if it's not valid for the new make
      if (
        !VEHICLE_MODELS[currentMake].some(
          (m) => m.value === form.values.vehicleModel
        )
      ) {
        form.setFieldValue("vehicleModel", "");
      }
    } else {
      setAvailableModels([]);
      form.setFieldValue("vehicleModel", ""); // Also clear model if make is cleared
    }
    // Reason: form.setFieldValue is stable; effect logic depends only on vehicleMake or vehicleModel changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.vehicleMake, form.values.vehicleModel]);

  // Update the vehicle string when any part changes (use form values)
  useEffect(() => {
    const { vehicleMake, vehicleModel, vehicleYear } = form.values;
    if (vehicleMake && vehicleModel && vehicleYear) {
      // Find the display labels
      const makeLabel =
        VEHICLE_MAKES.find((m) => m.value === vehicleMake)?.label || "";
      const modelLabel =
        // Use availableModels state here, as it's derived
        availableModels.find((m) => m.value === vehicleModel)?.label || "";

      // Format the vehicle string: "2022 Toyota Camry"
      const vehicleString = `${vehicleYear} ${makeLabel} ${modelLabel}`.trim();

      // Update parent only if a complete vehicle string is formed
      if (vehicleString.split(" ").length >= 3) {
        onVehicleChange(vehicleString);
      }
    }
    // Reason: Omitting form.values dependency to avoid re-run on unrelated field changes.
    // Dependencies are explicitly listed based on what's read/used.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.values.vehicleMake,
    form.values.vehicleModel,
    form.values.vehicleYear,
    availableModels,
    onVehicleChange,
  ]);

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

  // Handle form submission callback
  const handleSubmitCallback = (values: FormValues) => {
    // Check if subscription is active or if it's a first-time use case
    // TODO: Replace 0 with currentEntryCount from props/context when available
    if (
      subscriptionStatus === "active" ||
      (subscriptionStatus !== "active" && 0 < 50)
    ) {
      console.log("Form values submitted:", values);
      // Pass form values to the parent's onGenerate handler
      onGenerate(values).catch((error) => {
        console.error("Error during generation:", error);
        // Optionally show an error notification to the user
        // notifications.show({
        //   title: 'Generation Error',
        //   message: 'Failed to generate mileage log. Please try again.',
        //   color: 'red',
        // });
      });
    } else {
      // Handle inactive subscription case (e.g., show modal)
      console.log("Subscription inactive and limit reached");
      // notifications.show({
      //   title: 'Subscription Required',
      //   message: 'Please upgrade your subscription to generate more logs.',
      //   color: 'orange',
      // });
    }
  };

  // Handle resetting the form
  const handleReset = () => {
    form.reset(); // Reset Mantine form state
    onReset(); // Call parent's reset logic
    setActiveStep(0); // Reset stepper to the first step
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

      {/* Correct onSubmit handler */}
      <form onSubmit={form.onSubmit(handleSubmitCallback)}>
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
              availableModels={availableModels}
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
              // Use the restored handleReset
              onClick={handleReset}
              size={isMobile ? "md" : "sm"}
            >
              Reset
            </Button>
          )}
          <Group gap="sm">
            <Button
              disabled={activeStep === 3}
              onClick={nextStep}
              variant="filled"
              size={isMobile ? "md" : "sm"}
              rightSection={<IconChevronRight size={14} />}
            >
              Next Step
            </Button>
            <Button
              disabled={activeStep !== 3}
              variant="gradient"
              // Restore type="submit"
              type="submit"
              size={isMobile ? "md" : "sm"}
              rightSection={<IconCheck size={14} />}
            >
              Generate Log
            </Button>
          </Group>
        </Group>
      </form>
    </Box>
  );
}
