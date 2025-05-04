// components/milagolog/steps/VehicleInfoStep.tsx
import React from "react";
import {
  Box,
  Paper,
  Title,
  Text,
  Stack,
  Grid,
  GridCol,
  NumberInput,
} from "@mantine/core";
import { CustomInputWrapper } from "@/components/form/CustomInputWrapper";
import { UseFormReturnType } from "@mantine/form";
import { VehicleSelector } from "../VehicleSelector";
import { FormValues, VehicleOption } from "@/types/form_values";

interface VehicleInfoStepProps {
  form: UseFormReturnType<FormValues>;
  vehicleMakes: VehicleOption[]; // Add prop for makes
  vehicleModels: Record<string, VehicleOption[]>; // Add prop for models
  vehicleYears: VehicleOption[]; // Add prop for years
}

export function VehicleInfoStep({ 
  form, 
  vehicleMakes, // Destructure props
  vehicleModels, 
  vehicleYears 
}: VehicleInfoStepProps) {
  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Vehicle Information
      </Title>
      <Text c="dimmed" mb="lg">
        Enter your vehicle details and odometer readings
      </Text>

      {/* Odometer Readings Section */}
      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} size="h5" mb="md">
          Odometer Readings
        </Title>
        <Grid gutter="md">
          <GridCol span={{ base: 12, sm: 6 }}>
            {/* Pass error explicitly to the wrapper */}
            <CustomInputWrapper 
              label="Starting Odometer Reading" 
              required
              error={form.errors.startMileage} // Pass error here
            >
              <NumberInput
                placeholder="Enter starting mileage"
                {...form.getInputProps("startMileage")}
                min={0}
                step={1}
                required
                hideControls
                error={null} // Prevent default error display
              />
            </CustomInputWrapper>
          </GridCol>
          <GridCol span={{ base: 12, sm: 6 }}>
             {/* Pass error explicitly to the wrapper */}
            <CustomInputWrapper 
              label="Ending Odometer Reading" 
              required
              error={form.errors.endMileage} // Pass error here
            >
              <NumberInput
                placeholder="Enter ending mileage"
                {...form.getInputProps("endMileage")}
                min={form.values.startMileage ? parseInt(form.values.startMileage) + 1 : 1}
                step={1}
                required
                hideControls
                error={null} // Prevent default error display
              />
            </CustomInputWrapper>
          </GridCol>
        </Grid>
      </Paper>

      {/* Vehicle Details Section */}
      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} mb="md">
          Vehicle Details
        </Title>
        <Stack gap="md">
          {/* Pass the constant props down to VehicleSelector */}
          <VehicleSelector 
            form={form} 
            vehicleMakes={vehicleMakes} 
            vehicleModels={vehicleModels} 
            vehicleYears={vehicleYears} 
          />
        </Stack>
      </Paper>
    </Box>
  );
}
