// components/milagelog/steps/TripDetailsStep.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Title,
  Text,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
} from "@mantine/core";
import { CustomInputWrapper } from "@/components/form/CustomInputWrapper";
import { UseFormReturnType } from "@mantine/form";
import { FormValues } from "@/types/form_values";
import CustomTypeManagerModal from '@/features/custom-business-types/components/CustomTypeManagerModal'; // Default import
import { getCustomBusinessTypes } from '@/app/actions/customBusinessTypesActions';
import { CustomBusinessType } from '@/types/custom_business_type'; // Import base type if needed for formatting

interface TripDetailsStepProps {
  form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
  businessTypeOptions: { value: string; label: string }[];
}

export function TripDetailsStep({
  form,
  businessTypeOptions,
}: TripDetailsStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(businessTypeOptions);

  // Update local options state if the prop changes from parent
  useEffect(() => {
    setCurrentOptions(businessTypeOptions);
  }, [businessTypeOptions]);

  // Fetch latest types and update the dropdown options
  const handleTypesUpdated = async () => {
    console.log('Custom business types updated. Refreshing options...');
    try {
      const result = await getCustomBusinessTypes();
      if (result.error) {
        console.error("Error fetching updated types:", result.error);
        // Optionally show an error notification to the user
      } else {
        const formattedOptions = (result.data as Pick<CustomBusinessType, 'id' | 'name'>[]).map(type => ({
          value: type.id, // Assuming ID is used as value
          label: type.name,
        }));
        setCurrentOptions(formattedOptions);
        // Clear current selection as the list has changed
        form.setFieldValue('businessType', ''); 
      }
    } catch (error) {
      console.error("Unexpected error fetching updated types:", error);
      // Optionally show an error notification
    }
  };

  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Trip Details
      </Title>
      <Text c="dimmed" mb="lg">
        Specify your business type and personal miles
      </Text>

      {/* Business Information Section */}
      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} size="h5" mb="md">
          Business Information
        </Title>
        <CustomInputWrapper
          label="Business Type"
          error={form.errors.businessType}
          required
        >
          <Group grow wrap="nowrap">
            <Select
              placeholder="Select or manage business types"
              data={currentOptions} // Use local state for options
              {...form.getInputProps("businessType")}
              searchable
              clearable
              error={null} // Hide default error
              comboboxProps={{ position: "bottom", withinPortal: true }}
              maxDropdownHeight={280}
            />
            <Button 
              variant="light"
              onClick={() => setIsModalOpen(true)}
              style={{ flex: 0 }} // Prevent button from growing
            >
              Manage
            </Button>
          </Group>
        </CustomInputWrapper>
      </Paper>

      {/* Personal Miles Section */}
      <Stack gap="md">
        <CustomInputWrapper
          label="Personal Miles"
          error={form.errors.totalPersonalMiles}
        >
          <TextInput
            placeholder="Enter personal miles"
            {...form.getInputProps("totalPersonalMiles")}
            error={null} // Hide default error
          />
        </CustomInputWrapper>
      </Stack>

      {/* Render the modal */} 
      <CustomTypeManagerModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleTypesUpdated}
      />
    </Box>
  );
}
