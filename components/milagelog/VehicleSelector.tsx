import { useState, useEffect } from 'react';
import { Select, Grid, GridCol } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { VEHICLE_MAKES, VEHICLE_MODELS, VEHICLE_YEARS as YEARS } from '@/utils/constants';
import { FormValues } from '@/types/form_values';

interface VehicleSelectorProps {
  form: UseFormReturnType<FormValues>;
}

interface VehicleOption {
  value: string;
  label: string;
}

export function VehicleSelector({ form }: VehicleSelectorProps) {
  const [availableModels, setAvailableModels] = useState<VehicleOption[]>([]);

  useEffect(() => {
    const currentMake = form.values.vehicleMake;
    if (currentMake && VEHICLE_MODELS[currentMake]) {
      const models = VEHICLE_MODELS[currentMake];
      setAvailableModels(models);
      if (!models.some((m: VehicleOption) => m.value === form.values.vehicleModel)) {
        form.setFieldValue('vehicleModel', '');
      }
    } else {
      setAvailableModels([]);
      form.setFieldValue('vehicleModel', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.vehicleMake]);

  return (
    <Grid gutter="md">
      <GridCol span={{ base: 12, sm: 4 }}>
        <Select
          label="Vehicle Make"
          placeholder="Select make"
          data={VEHICLE_MAKES}
          {...form.getInputProps('vehicleMake')}
          searchable
          required
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 4 }}>
        <Select
          label="Model"
          placeholder="Select model"
          data={availableModels}
          {...form.getInputProps('vehicleModel')}
          disabled={!form.values.vehicleMake || availableModels.length === 0}
          searchable
          required
        />
      </GridCol>
      <GridCol span={{ base: 12, sm: 4 }}>
        <Select
          label="Year"
          placeholder="Select year"
          data={YEARS}
          {...form.getInputProps('vehicleYear')}
          searchable
          required
        />
      </GridCol>
    </Grid>
  );
}
