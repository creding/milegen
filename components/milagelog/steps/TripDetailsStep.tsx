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
import { getCustomBusinessTypeDetails, getCustomBusinessTypes } from '@/app/actions/customBusinessTypesActions'; // getCustomBusinessTypes for handleTypesUpdated
import { CustomBusinessType, CustomBusinessPurpose } from '@/types/custom_business_type';
import { BusinessType as PredefinedBusinessTypeStructure } from "@/utils/mileageUtils"; // Type from mileageUtils

// This interface will represent the structure of predefined types as passed in props.
// It's based on PredefinedBusinessTypeStructure but might be adapted if needed for display.
// For now, let's assume it's directly PredefinedBusinessTypeStructure and we'll adapt it for formatOptionsWithGroups.
interface PredefinedBusinessTypeForProp extends PredefinedBusinessTypeStructure {
  // We need value and label for the Select component's items, if not directly in PredefinedBusinessTypeStructure
  value: string; 
  label: string;
  // avg_trips_per_workday and purposes with max_distance are NOT in PredefinedBusinessTypeStructure
  // So, we need to define them here if we want to display them for predefined types.
  // This highlights a potential mismatch: predefined types from mileageUtils don't have these details.
  // The previous implementation of TripDetailsStep *assumed* businessTypeOptions had these.
  // For this refactor, we pass what's available. Display logic will need to adjust or these fields will be undefined for predefined.
  avg_trips_per_workday?: number; 
  purposes?: Array<{ purpose_name: string; max_distance?: number }>;
}


interface TripDetailsStepProps {
  form: UseFormReturnType<FormValues, (values: FormValues) => FormValues>;
  predefinedBusinessTypes: PredefinedBusinessTypeStructure[]; // Raw from mileageUtils
  customBusinessTypes: Pick<CustomBusinessType, 'id' | 'name'>[]; // Summary from getCustomBusinessTypes
}

import { useRouter } from 'next/navigation'; // Added for router.refresh()

// Helper to format options for the Select component, including grouping
const formatOptionsWithGroups = (
    predefinedRaw: PredefinedBusinessTypeStructure[] | undefined,  // Allow undefined
    customSummary: Pick<CustomBusinessType, 'id' | 'name'>[] | undefined // Allow undefined
  ) => {
  const options = [];
  if (predefinedRaw && predefinedRaw.length > 0) {
    options.push({
      group: "Predefined Types",
      items: predefinedRaw.map(p => ({ value: p.name, label: p.name }))
    });
  }
  if (customSummary && customSummary.length > 0) {
    options.push({
      group: "Custom Types",
      items: customSummary.map(type => ({ value: type.id, label: type.name }))
    });
  }
  return options;
};

// Helper to create the PredefinedBusinessTypeForProp structure from PredefinedBusinessTypeStructure
// This is needed because PredefinedBusinessTypeStructure from mileageUtils lacks detailed fields.
// For this step, we'll acknowledge this by making details optional or using defaults.
const adaptPredefinedTypeForDetails = (rawType: PredefinedBusinessTypeStructure): PredefinedBusinessTypeForProp => {
    return {
        ...rawType, // name, purposes (string[])
        value: rawType.name,
        label: rawType.name,
        // These details are NOT available in PredefinedBusinessTypeStructure from mileageUtils
        // So, they will be undefined or we can set defaults if design requires.
        avg_trips_per_workday: undefined, // Or a default like 0 or 1 if makes sense
        purposes: rawType.purposes.map(pName => ({ purpose_name: pName, max_distance: undefined })),
    };
};


export function TripDetailsStep({
  form,
  predefinedBusinessTypes,
  customBusinessTypes,
}: TripDetailsStepProps) {
  const router = useRouter(); // Initialize router
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentOptions, setCurrentOptions] = useState(
    formatOptionsWithGroups(predefinedBusinessTypes, customBusinessTypes)
  );
  
  const [selectedBusinessTypeDetails, setSelectedBusinessTypeDetails] = 
    useState<CustomBusinessType | PredefinedBusinessTypeForProp | null>(null);
  
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const selectedBusinessTypeValue = form.values.businessType;

  // Effect to update dropdown options when props change
  useEffect(() => {
    setCurrentOptions(formatOptionsWithGroups(predefinedBusinessTypes, customBusinessTypes));
    // If the selectedBusinessTypeValue is no longer in the new options, reset it.
    // This handles cases where a selected custom type is deleted, or predefined list changes.
    const newFlattenedOptions = (predefinedBusinessTypes?.map(p => p.name) || []).concat(customBusinessTypes?.map(c => c.id) || []);
    if (selectedBusinessTypeValue && !newFlattenedOptions.includes(selectedBusinessTypeValue)) {
        form.setFieldValue('businessType', '');
        setSelectedBusinessTypeDetails(null);
    }
  }, [predefinedBusinessTypes, customBusinessTypes, selectedBusinessTypeValue, form]);


  // Effect to fetch details when a business type is selected from the (now prop-driven) dropdown
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedBusinessTypeValue) {
        setSelectedBusinessTypeDetails(null);
        setErrorDetails(null);
        return;
      }

      const predefinedRawDetail = predefinedBusinessTypes?.find(
        (opt) => opt.name === selectedBusinessTypeValue
      );

      if (predefinedRawDetail) {
        setSelectedBusinessTypeDetails(adaptPredefinedTypeForDetails(predefinedRawDetail));
        setIsLoadingDetails(false);
        setErrorDetails(null);
      } else {
        // Check if it's a known custom ID from props before fetching
        const isKnownCustomId = customBusinessTypes?.some(ct => ct.id === selectedBusinessTypeValue);
        if (isKnownCustomId) {
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
        } else {
            // Not predefined and not in the list of custom type IDs from props.
            // This could happen if the selected value is stale after a list update.
            // The useEffect above that watches props should ideally clear this.
            setSelectedBusinessTypeDetails(null);
            setErrorDetails(null); // Or "Selected type is no longer valid"
        }
      }
    };

    fetchDetails();
  }, [selectedBusinessTypeValue, predefinedBusinessTypes, customBusinessTypes]);

  const handleTypesUpdated = async () => {
    // console.log('Custom business types updated via modal. Refreshing page data via router.refresh()...'); // Removed console.log
    
    // Clear current selection and details before refresh to avoid showing stale data
    form.setFieldValue('businessType', '');
    setSelectedBusinessTypeDetails(null);
    setErrorDetails(null);
    // Optionally, can set isLoadingDetails to true here to give immediate feedback
    // setIsLoadingDetails(true); // User will see loading until props are updated

    router.refresh(); 
    // After router.refresh(), the page (app/generator/page.tsx) will re-fetch.
    // New props (predefinedBusinessTypes, customBusinessTypes) will flow down.
    // The useEffect listening to these props will update currentOptions.
    // The useEffect listening to selectedBusinessTypeValue (now cleared) will reset details.
    // No need to manually call getCustomBusinessTypes or setCurrentOptions here.
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
            {(() => {
              let purposesToDisplay: Array<{ purpose_name: string; max_distance?: number; [key: string]: any }> = [];
              if (selectedBusinessTypeDetails) {
                if ('custom_business_purposes' in selectedBusinessTypeDetails && selectedBusinessTypeDetails.custom_business_purposes) {
                  purposesToDisplay = selectedBusinessTypeDetails.custom_business_purposes;
                } else if ('purposes' in selectedBusinessTypeDetails && selectedBusinessTypeDetails.purposes) {
                  purposesToDisplay = selectedBusinessTypeDetails.purposes;
                }
              }

              if (purposesToDisplay.length > 0) {
                return (
                  <List spacing="xs" size="sm" center icon={<ThemeIcon color="teal" size={18} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
                    {purposesToDisplay.map((purpose, index) => (
                      <List.Item key={index}>
                        {purpose.purpose_name}
                        {purpose.max_distance !== undefined ? ` (Max: ${purpose.max_distance} miles)` : ''}
                      </List.Item>
                    ))}
                  </List>
                );
              }
              return <Text size="sm" c="dimmed">No specific purposes defined for this type.</Text>;
            })()}
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
