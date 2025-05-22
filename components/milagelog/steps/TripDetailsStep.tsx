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
  Loader,
  Alert,
  List,
  ThemeIcon,
} from "@mantine/core";
import { IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { CustomInputWrapper } from "@/components/form/CustomInputWrapper";
import { UseFormReturnType } from "@mantine/form";
import { FormValues } from "@/types/form_values";
import CustomTypeManagerModal from '@/features/custom-business-types/components/CustomTypeManagerModal';
import { getCustomBusinessTypes, getCustomBusinessTypeDetails } from '@/app/actions/customBusinessTypesActions';
import { CustomBusinessType, CustomBusinessPurpose } from '@/types/custom_business_type';

// Assuming predefined types also have a similar structure for details
// If BUSINESS_TYPES constant was available, we'd use its type.
// For now, this is an assumption based on the task requirements.
interface PredefinedBusinessType {
  value: string; // Corresponds to the ID/value in the select
  label: string; // Display name
  name: string; // Actual name, might be same as label
  avg_trips_per_workday: number;
  purposes: Array<{ purpose_name: string; max_distance: number }>; // Simplified purpose structure
}

interface TripDetailsStepProps {
  form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
  // Assuming businessTypeOptions will be an array of PredefinedBusinessType
  businessTypeOptions: PredefinedBusinessType[]; 
}

// Helper to format options for the Select component, including grouping
const formatOptionsWithGroups = (predefined: PredefinedBusinessType[], custom: Pick<CustomBusinessType, 'id' | 'name'>[]) => {
  const options = [];
  if (predefined && predefined.length > 0) {
    options.push({ 
      group: "Predefined Types", 
      items: predefined.map(p => ({ value: p.value, label: p.label })) 
    });
  }
  if (custom && custom.length > 0) {
    options.push({ 
      group: "Custom Types", 
      items: custom.map(type => ({ value: type.id, label: type.name })) 
    });
  }
  return options;
};

export function TripDetailsStep({
  form,
  businessTypeOptions, // Now PredefinedBusinessType[]
}: TripDetailsStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(formatOptionsWithGroups(businessTypeOptions, []));
  const [selectedBusinessTypeDetails, setSelectedBusinessTypeDetails] = 
    useState<CustomBusinessType | PredefinedBusinessType | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const selectedBusinessTypeValue = form.values.businessType;

  // Effect to fetch and set all types for the dropdown
  useEffect(() => {
    const fetchAndSetTypes = async () => {
      // setIsLoadingDetails(true); // Potentially show loader for entire dropdown population
      try {
        const result = await getCustomBusinessTypes(); // Fetches {id, name}
        if (result.error) {
          console.error("Error fetching custom types for dropdown:", result.error);
          setCurrentOptions(formatOptionsWithGroups(businessTypeOptions, [])); // Fallback to predefined
        } else {
          const customTypesForDropdown = result.data as Pick<CustomBusinessType, 'id' | 'name'>[];
          setCurrentOptions(formatOptionsWithGroups(businessTypeOptions, customTypesForDropdown));
        }
      } catch (error) {
        console.error("Unexpected error fetching custom types for dropdown:", error);
        setCurrentOptions(formatOptionsWithGroups(businessTypeOptions, [])); // Fallback to predefined
      }
      // setIsLoadingDetails(false);
    };

    fetchAndSetTypes();
  }, [businessTypeOptions]); // Re-fetch if predefined types (prop) change

  // Effect to fetch details when a business type is selected
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedBusinessTypeValue) {
        setSelectedBusinessTypeDetails(null);
        setErrorDetails(null);
        return;
      }

      // Try to find in predefined types first
      const predefinedDetail = businessTypeOptions.find(
        (opt) => opt.value === selectedBusinessTypeValue
      );

      if (predefinedDetail) {
        setSelectedBusinessTypeDetails(predefinedDetail);
        setIsLoadingDetails(false);
        setErrorDetails(null);
      } else {
        // If not predefined, assume it's a custom type and fetch its full details
        setIsLoadingDetails(true);
        setErrorDetails(null);
        try {
          const result = await getCustomBusinessTypeDetails(selectedBusinessTypeValue);
          if (result.error || !result.data) {
            setErrorDetails(result.error || "Failed to load custom business type details.");
            setSelectedBusinessTypeDetails(null);
          } else {
            setSelectedBusinessTypeDetails(result.data);
          }
        } catch (error) {
          console.error("Unexpected error fetching custom type details:", error);
          setErrorDetails("An unexpected error occurred while fetching details.");
          setSelectedBusinessTypeDetails(null);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchDetails();
  }, [selectedBusinessTypeValue, businessTypeOptions]); // Rerun when selection or predefined options change

  // This function is called when the modal signals an update.
  const handleTypesUpdated = async () => {
    console.log('Custom business types updated via modal. Refreshing dropdown options and current selection details...');
    setIsLoadingDetails(true); // Show loading while we refresh everything
    setErrorDetails(null);
    let refreshedCustomTypesForDropdown: Pick<CustomBusinessType, 'id' | 'name'>[] = [];
    try {
      const result = await getCustomBusinessTypes(); // Fetches {id, name}
      if (result.error) {
        console.error("Error fetching updated custom types for dropdown:", result.error);
        // Keep existing custom types in dropdown if fetch fails, or clear them:
        // For safety, format with potentially stale custom types if already in currentOptions, or empty
        const existingCustom = currentOptions.find(g => g.group === "Custom Types")?.items || [];
        setCurrentOptions(formatOptionsWithGroups(businessTypeOptions, existingCustom));
      } else {
        refreshedCustomTypesForDropdown = result.data as Pick<CustomBusinessType, 'id' | 'name'>[];
        setCurrentOptions(formatOptionsWithGroups(businessTypeOptions, refreshedCustomTypesForDropdown));
      }
    } catch (error) {
      console.error("Unexpected error fetching updated custom types for dropdown:", error);
      const existingCustom = currentOptions.find(g => g.group === "Custom Types")?.items || [];
      setCurrentOptions(formatOptionsWithGroups(businessTypeOptions, existingCustom));
    }

    // After updating dropdown, check if current selection needs details refreshed
    // This is important if the currently selected custom type was edited or deleted.
    if (selectedBusinessTypeValue) {
        const isPredefined = businessTypeOptions.some(opt => opt.value === selectedBusinessTypeValue);
        if (isPredefined) {
            // Predefined type details don't change via modal, so no action needed here or already handled by selection effect
            const predefinedDetail = businessTypeOptions.find(opt => opt.value === selectedBusinessTypeValue);
            setSelectedBusinessTypeDetails(predefinedDetail || null);
        } else {
            // Custom type: was it deleted?
            const stillExists = refreshedCustomTypesForDropdown.some(ct => ct.id === selectedBusinessTypeValue);
            if (stillExists) {
                try {
                    const detailsResult = await getCustomBusinessTypeDetails(selectedBusinessTypeValue);
                    if (detailsResult.error || !detailsResult.data) {
                        setErrorDetails(detailsResult.error || "Failed to refresh details for selected custom type.");
                        setSelectedBusinessTypeDetails(null);
                        form.setFieldValue('businessType', ''); // Clear selection if details fail
                    } else {
                        setSelectedBusinessTypeDetails(detailsResult.data);
                    }
                } catch (e) {
                    setErrorDetails("Error refreshing selected custom type details.");
                    setSelectedBusinessTypeDetails(null);
                    form.setFieldValue('businessType', ''); 
                }
            } else {
                // Selected custom type was deleted
                setSelectedBusinessTypeDetails(null);
                form.setFieldValue('businessType', ''); // Clear selection
            }
        }
    } else {
        setSelectedBusinessTypeDetails(null); // No selection
    }
    setIsLoadingDetails(false);
  };

  return (
    <Box mt="md">
      <Title order={3} size="h4" mb="md">
        Trip Details
      </Title>
      <Text c="dimmed" mb="lg">
        Specify your business type and personal miles.
      </Text>

      <Paper p="md" withBorder radius="md" mb="lg">
        <Title order={4} size="h5" mb="md">
          Business Information
        </Title>
        <CustomInputWrapper
          label="Business Type"
          description="Select a predefined type or manage your own custom types."
          error={form.errors.businessType}
          required
        >
          <Group grow wrap="nowrap" align="flex-start">
            <Select
              placeholder="Select or manage business types"
              data={currentOptions}
              {...form.getInputProps("businessType")}
              searchable
              clearable
              error={form.errors.businessType ? true : undefined} // Show error state on select itself
              comboboxProps={{ position: "bottom", withinPortal: true }}
              maxDropdownHeight={280}
              style={{ flexGrow: 1 }}
            />
            <Button 
              variant="light"
              onClick={() => setIsModalOpen(true)}
              style={{ flexShrink: 0 }} // Prevent button from shrinking too much
            >
              Manage Types
            </Button>
          </Group>
        </CustomInputWrapper>

        {/* Display Area for Selected Business Type Details */}
        {isLoadingDetails && (
          <Group justify="center" mt="md">
            <Loader />
            <Text size="sm">Loading business type details...</Text>
          </Group>
        )}
        {errorDetails && !isLoadingDetails && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error Loading Details"
            color="red"
            mt="md"
            withCloseButton
            onClose={() => setErrorDetails(null)}
          >
            {errorDetails}
          </Alert>
        )}
        {selectedBusinessTypeDetails && !isLoadingDetails && !errorDetails && (
          <Paper p="sm" mt="md" withBorder radius="xs">
            <Title order={5} size="sm" mb="xs">
              Selected Type: {selectedBusinessTypeDetails.name}
            </Title>
            <Text size="sm" c="dimmed">
              Average Trips per Workday: {selectedBusinessTypeDetails.avg_trips_per_workday}
            </Text>
            <Text size="sm" fw={500} mt="xs" mb="xs">
              Configured Purposes:
            </Text>
            {/* Check if purposes are from CustomBusinessType (custom_business_purposes) or PredefinedBusinessType (purposes) */}
            {(selectedBusinessTypeDetails as CustomBusinessType).custom_business_purposes || (selectedBusinessTypeDetails as PredefinedBusinessType).purposes?.length > 0 ? (
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="teal" size={18} radius="xl">
                    <IconCircleCheck size={12} />
                  </ThemeIcon>
                }
              >
                {((selectedBusinessTypeDetails as CustomBusinessType).custom_business_purposes || (selectedBusinessTypeDetails as PredefinedBusinessType).purposes).map(
                  (purpose: CustomBusinessPurpose | { purpose_name: string; max_distance: number }, index: number) => (
                    <List.Item key={index}>
                      {purpose.purpose_name} (Max: {purpose.max_distance} miles)
                    </List.Item>
                  )
                )}
              </List>
            ) : (
              <Text size="sm" c="dimmed">No specific purposes defined for this type.</Text>
            )}
          </Paper>
        )}
      </Paper>

      <Stack gap="md">
        <CustomInputWrapper
          label="Personal Miles"
          error={form.errors.totalPersonalMiles}
        >
          <TextInput
            placeholder="Enter personal miles"
            {...form.getInputProps("totalPersonalMiles")}
            error={form.errors.totalPersonalMiles ? true : undefined}
          />
        </CustomInputWrapper>
      </Stack>

      <CustomTypeManagerModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleTypesUpdated} 
      />
    </Box>
  );
}
