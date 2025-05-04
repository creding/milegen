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
import { FormValues } from "@/types/form_values";

interface MileageFormProps {
  subscriptionStatus: string | null;
  onGenerate: (values: FormValues) => Promise<void>;
  onReset: () => void;
}

export function MileageForm({
  subscriptionStatus,
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
  const initialVehicle = parseVehicle("");

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
      // Default dates to the full previous year
      startDate: (() => {
        const lastYear = new Date().getFullYear() - 1;
        return new Date(lastYear, 0, 1); // Jan 1st of last year
      })(),
      endDate: (() => {
        const lastYear = new Date().getFullYear() - 1;
        return new Date(lastYear, 11, 31); // Dec 31st of last year
      })(),
      totalPersonalMiles: "",
      vehicleMake: initialVehicle.make,
      vehicleModel: initialVehicle.model,
      vehicleYear: initialVehicle.year,
      businessType: "",
    },
    validate: {
      startMileage: (value) => (value ? null : "Start mileage is required"),
      endMileage: (value, values) =>
        value
          ? parseInt(value) <= parseInt(values.startMileage || "0")
            ? "End mileage must be greater than start mileage"
            : null
          : "End mileage is required",
      startDate: (value) => (value ? null : "Start date is required"),
      endDate: (value, values) => validateDates(values.startDate, value),
      totalPersonalMiles: (value, values) => {
        const totalMiles =
          parseInt(values.endMileage || "0") -
          parseInt(values.startMileage || "0");
        return value !== undefined && value !== null
          ? parseInt(value || "0") > totalMiles
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

  // Update the vehicle string when any part changes (use form values)
  useEffect(() => {
    const { vehicleMake, vehicleModel, vehicleYear } = form.values;
    if (vehicleMake && vehicleModel && vehicleYear) {
      // Find the display labels
      const makeLabel =
        VEHICLE_MAKES.find((m) => m.value === vehicleMake)?.label || "";
      const modelLabel =
        VEHICLE_MODELS[vehicleMake]?.find((m) => m.value === vehicleModel)
          ?.label || "";

      // Format the vehicle string: "2022 Toyota Camry"
      const vehicleString = `${vehicleYear} ${makeLabel} ${modelLabel}`.trim();

      // Update parent only if a complete vehicle string is formed
      if (vehicleString.split(" ").length >= 3) {
        // onVehicleChange(vehicleString);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.values.vehicleMake,
    form.values.vehicleModel,
    form.values.vehicleYear,
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
    // onStartDateChange(date);
  };

  const handleEndDateChange = (date: Date) => {
    form.setFieldValue("endDate", date);
    // onEndDateChange(date);
  };

  // Handle form submission callback
  const handleFormSubmit = async (values: FormValues) => {
    // Check if subscription is active or if it's a first-time use case
    // TODO: Replace 0 with currentEntryCount from props/context when available
    if (
      subscriptionStatus === "active" ||
      (subscriptionStatus !== "active" && 0 < 50)
    ) {
      onGenerate(values).catch((error) => {
        console.error("Error during generation:", error);
      });
    } else {
      // Handle inactive subscription case (e.g., show modal)
    }
  };

  // Handle resetting the form
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
    // Validate the date fields explicitly
    const startDateError = form.validateField('startDate').error;
    const endDateError = form.validateField('endDate').error;
    return !startDateError && !endDateError;
  };

  const validateTripDetailsStep = () => {
    const personalMilesError = form.validateField("totalPersonalMiles").error;
    const businessTypeError = form.validateField("businessType").error;

    return !personalMilesError && !businessTypeError;
  };

  const nextStep = () => {
    // Validate the *current* step before advancing
    if (activeStep === 0 && !validateVehicleStep()) { // Leaving Step 0 (Vehicle Info)
      return;
    } else if (activeStep === 1 && !validateTripDetailsStep()) { // Leaving Step 1 (Trip Details) - Corrected
      return;
    } else if (activeStep === 2 && !validateDateStep()) { // Leaving Step 2 (Date Range) - Corrected
      return;
    }

    // If validation passes, advance to the next step
    setActiveStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  return (
    <Box p="md">
      {subscriptionStatus !== "active" && <SubscriptionAlert mb="md" />}

      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stepper active={activeStep} onStepClick={setActiveStep}>
          <Stepper.Step
            label="Vehicle Information"
            description="Odometer readings"
            icon={<IconCar size={18} />}
            allowStepSelect={activeStep > 0}
          >
            <VehicleInfoStep form={form} />
          </Stepper.Step>

          <Stepper.Step
            label="Trip Details"
            description="Enter trip info"
            icon={<IconRoute size={18} />}
            allowStepSelect={activeStep > 1}
          >
            <TripDetailsStep
              form={form}
              businessTypeOptions={businessTypeOptions}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Date Range"
            description="Start and end dates"
            icon={<IconCalendar size={18} />}
            allowStepSelect={activeStep > 2}
          >
            <DateRangeStep
              form={form}
              isMobile={isMobile}
              startDate={form.values.startDate}
              handleStartDateChange={handleStartDateChange}
              endDate={form.values.endDate}
              handleEndDateChange={handleEndDateChange}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Review & Generate"
            description="Confirm and create log"
            icon={<IconFileCheck size={18} />}
          >
            <ReviewStep form={form} />
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
