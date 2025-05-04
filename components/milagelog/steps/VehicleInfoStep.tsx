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
import { FormValues } from "@/types/form_values";

interface VehicleInfoStepProps {
  form: UseFormReturnType<FormValues>;
}

export function VehicleInfoStep({ form }: VehicleInfoStepProps) {
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
            <CustomInputWrapper label="Starting Odometer Reading" required>
              <NumberInput
                placeholder="Enter starting mileage"
                {...form.getInputProps("startMileage")}
                min={0}
                step={1}
                required
                hideControls
              />
            </CustomInputWrapper>
          </GridCol>
          <GridCol span={{ base: 12, sm: 6 }}>
            <CustomInputWrapper label="Ending Odometer Reading" required>
              <NumberInput
                placeholder="Enter end mileage"
                {...form.getInputProps("endMileage")}
                min={Number(form.values.startMileage) || 0}
                step={1}
                required
                hideControls
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
          <VehicleSelector form={form} />
        </Stack>
      </Paper>
    </Box>
  );
}
