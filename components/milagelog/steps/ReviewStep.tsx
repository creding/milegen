import React from 'react';
import { Box, Text, SimpleGrid, Title, Paper } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { FormValues } from '@/types/form_values';
import { getVehicleLabel } from '@/utils/vehicle.utils';
import { formatDate } from '@/utils/date.utils'; 

// --- Component Props Interface --- //

interface ReviewStepProps {
  form: UseFormReturnType<FormValues>;
  totalMiles: number;
  businessMiles: number;
}

// --- Component Definition --- //

export function ReviewStep({ form, totalMiles, businessMiles }: ReviewStepProps) {
  const { values } = form;
  // Calculate personal miles derived from form inputs
  const calculatedPersonalMiles = totalMiles - businessMiles;
  // Use the helper functions defined above
  const vehicleDisplay = getVehicleLabel(values);
  const startDateDisplay = formatDate(values.startDate);
  const endDateDisplay = formatDate(values.endDate);

  return (
    <Box my="lg">
      <Paper shadow="sm" p="lg" withBorder>
        <Title order={3} mb="xs">Review Details</Title>
        <Text mb="lg" size="sm" c="dimmed">
          Please confirm the details below before generating the mileage log.
        </Text>
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
          <Box>
            <Text fw={500}>Vehicle:</Text>
            <Text>{vehicleDisplay}</Text>
          </Box>
          <Box>
            <Text fw={500}>Mileage Range:</Text>
            {/* Display raw values with fallback */}
            <Text>{values.startMileage || 'N/A'} - {values.endMileage || 'N/A'}</Text>
          </Box>
          <Box>
            <Text fw={500}>Date Range:</Text>
            <Text>{startDateDisplay} to {endDateDisplay}</Text>
          </Box>
          <Box>
            <Text fw={500}>Total Miles:</Text>
            <Text>{totalMiles}</Text>
          </Box>
          <Box>
            <Text fw={500}>Business Miles:</Text>
            <Text>{businessMiles}</Text>
          </Box>
          <Box>
            <Text fw={500}>Personal Miles:</Text>
             {/* Show calculated personal miles and the user input value */}
            <Text>{calculatedPersonalMiles} (Entered: {values.totalPersonalMiles || 'N/A'})</Text> 
          </Box>
           <Box>
            <Text fw={500}>Business Type:</Text>
            <Text>{values.businessType || 'N/A'}</Text>
          </Box>
        </SimpleGrid>
      </Paper>
    </Box>
  );
}
