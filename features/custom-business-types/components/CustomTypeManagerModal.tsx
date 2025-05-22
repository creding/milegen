import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  NumberInput,
  Stack,
  TextInput,
  Group,
  Text,
  Loader,
  Alert,
  ActionIcon,
  Box,
  Paper,
  Divider,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconPencil, IconTrash } from "@tabler/icons-react";

import {
  getCustomBusinessTypes,
  createCustomBusinessType,
  updateCustomBusinessType,
  deleteCustomBusinessType,
  getPurposesForBusinessType, // Import the new action
} from "@/app/actions/customBusinessTypesActions";
import {
  CustomBusinessType,
  CreateCustomBusinessTypeDTO,
  UpdateCustomBusinessTypeDTO,
  CustomBusinessPurpose,
} from "@/types/custom_business_type"; // Use singular

interface CustomTypeManagerModalProps {
  opened: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const CustomTypeManagerModal: React.FC<CustomTypeManagerModalProps> = ({
  opened,
  onClose,
  onUpdate,
}) => {
  const [types, setTypes] = useState<Pick<CustomBusinessType, "id" | "name">[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<
    Pick<CustomBusinessType, "id" | "name"> | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // General save/update loading
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingPurposes, setIsFetchingPurposes] = useState(false);
  const [typeToDeleteId, setTypeToDeleteId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState(""); // For Add form
  const [newAvgTrips, setNewAvgTrips] = useState<number | ''>(''); // For Add form
  const [newTypePurposes, setNewTypePurposes] = useState<Array<Omit<CustomBusinessPurpose, 'id' | 'business_type_id' | 'created_at'>>>([]); // For Add form
  const [currentNewPurposeName, setCurrentNewPurposeName] = useState(""); // Temp state for adding a purpose in Add form
  const [currentNewPurposeMaxDistance, setCurrentNewPurposeMaxDistance] = useState<number | ''>(''); // Temp state for adding a purpose in Add form

  const [editingTypeName, setEditingTypeName] = useState(""); // For Edit form
  const [editingAvgTrips, setEditingAvgTrips] = useState<number | ''>(''); // For Edit form
  const [editingPurposes, setEditingPurposes] = useState<CustomBusinessPurpose[]>([]); // Holds purposes for the type being edited
  
  const [newPurposeName, setNewPurposeName] = useState(""); // Temp state for adding a purpose in Edit form
  const [newPurposeMaxDistance, setNewPurposeMaxDistance] = useState<number | ''>(""); // Temp state for adding a purpose in Edit form
  // const [deletedPurposeIds, setDeletedPurposeIds] = useState<string[]>([]); // Track deleted purpose IDs - Removed, backend handles by omission

  const fetchTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCustomBusinessTypes();
      if (result.error) {
        setError(result.error);
        setTypes([]);
      } else {
        setTypes(
          (result.data as Pick<CustomBusinessType, "id" | "name">[]) || []
        );
      }
    } catch (fetchError) {
      console.error("Error fetching types:", fetchError);
      setError("An unexpected error occurred while fetching types.");
      setTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (opened) {
      fetchTypes(); // Initial fetch
      // Reset state when opening
      setSelectedType(null);
      setIsEditing(false);
      setIsCreating(false);
      setError(null);
      setTypeToDeleteId(null);
      setIsDeleting(false);
      setNewTypeName("");
      setNewAvgTrips('');
      setNewTypePurposes([]);
      setCurrentNewPurposeName("");
      setCurrentNewPurposeMaxDistance("");

      setEditingTypeName("");
      setEditingAvgTrips('');
      setEditingPurposes([]);
      setNewPurposeName(""); // For edit form's new purpose input
      setNewPurposeMaxDistance(""); // For edit form's new purpose input
      // setDeletedPurposeIds([]); // Removed
    }
  }, [opened, fetchTypes]);

  const handleUpdateType = async () => {
    if (!selectedType || !editingTypeName.trim() || typeof editingAvgTrips !== 'number' || editingAvgTrips <= 0) {
      setError("Type name must not be empty and average trips must be a positive number.");
      return;
    }

    setIsSaving(true);
    setError(null);

    // Fetch full details of selected type to compare avg_trips_per_workday
    // This is a bit inefficient but necessary if avg_trips_per_workday is not in the initial `types` list
    let originalAvgTrips = selectedType.avg_trips_per_workday; // Assume it might be there
    if (originalAvgTrips === undefined) {
        try {
            const details = await getCustomBusinessTypeDetails(selectedType.id);
            if (details.data) {
                originalAvgTrips = details.data.avg_trips_per_workday;
            } else {
                 setError("Could not verify original data for update. Please try again.");
                 setIsSaving(false);
                 return;
            }
        } catch (e) {
            setError("Error fetching original data for update. Please try again.");
            setIsSaving(false);
            return;
        }
    }


    const purposeDTOs: UpdateCustomBusinessTypeDTO['purposes'] = editingPurposes.map(p => ({
      id: p.id.startsWith('temp-') ? undefined : p.id,
      purpose_name: p.purpose_name,
      max_distance: p.max_distance,
    }));

    const updateData: UpdateCustomBusinessTypeDTO = { id: selectedType.id };
    let changesMade = false;

    if (editingTypeName.trim() !== selectedType.name) {
      updateData.name = editingTypeName.trim();
      changesMade = true;
    }
    if (typeof editingAvgTrips === 'number' && editingAvgTrips !== originalAvgTrips) {
      updateData.avg_trips_per_workday = editingAvgTrips;
      changesMade = true;
    }
    
    // Basic check for purpose changes (more sophisticated check might be needed)
    // This assumes any manipulation of editingPurposes means a potential change.
    // Or, compare with initially fetched purposes.
    if (purposeDTOs.length > 0 || editingPurposes.length !== (selectedType.custom_business_purposes?.length || 0)) {
        // A more robust check would involve comparing the content of purposeDTOs 
        // with the initial purposes of the selectedType.
        // For now, sending purposes if the array isn't empty or length changed.
        updateData.purposes = purposeDTOs;
        changesMade = true; // Consider this a change
    }


    if (!changesMade) {
      setError("No changes detected.");
      setIsSaving(false);
      setIsEditing(false);
      setSelectedType(null);
      return;
    }

    try {
      const result = await updateCustomBusinessType(updateData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setSelectedType(null);
        await fetchTypes();
        onUpdate();
      }
    } catch (err) {
      setError("An unexpected error occurred while updating.");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedType(null);
    setEditingTypeName("");
    setEditingAvgTrips('');
    setEditingPurposes([]);
    setNewPurposeName("");
    setNewPurposeMaxDistance("");
    setError(null);
  };

  const handleSaveNewType = async () => {
    const trimmedName = newTypeName.trim();
    if (!trimmedName) {
      setError("Business type name cannot be empty.");
      return;
    }
    if (typeof newAvgTrips !== 'number' || newAvgTrips <= 0) {
      setError("Average trips per workday must be a positive number.");
      return;
    }
    if (newTypePurposes.length === 0) {
      setError("At least one purpose must be added.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const dto: CreateCustomBusinessTypeDTO = {
        name: trimmedName,
        avg_trips_per_workday: newAvgTrips,
        purposes: newTypePurposes,
      };
      const result = await createCustomBusinessType(dto);
      if (result.error) {
        setError(result.error);
      } else {
        await fetchTypes();
        onUpdate();
        setIsCreating(false);
        setNewTypeName("");
        setNewAvgTrips('');
        setNewTypePurposes([]);
      }
    } catch (err) {
      setError("An unexpected error occurred while saving.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for adding a purpose to the newTypePurposes list (in Add mode)
  const handleAddNewTypePurpose = () => {
    const name = currentNewPurposeName.trim();
    const distance = typeof currentNewPurposeMaxDistance === 'number' ? currentNewPurposeMaxDistance : -1;
    if (!name || distance <= 0) {
      setError("Purpose name must not be empty and max distance must be positive for new types.");
      return;
    }
    setNewTypePurposes(prev => [...prev, { purpose_name: name, max_distance: distance }]);
    setCurrentNewPurposeName("");
    setCurrentNewPurposeMaxDistance("");
    setError(null);
  };

  // Handler for removing a purpose from the newTypePurposes list (in Add mode)
  const handleRemoveNewTypePurpose = (index: number) => {
    setNewTypePurposes(prev => prev.filter((_, i) => i !== index));
  };


  const handleEditClick = async (type: CustomBusinessType) => { // Expect full CustomBusinessType now
    setIsEditing(true);
    setIsCreating(false);
    setSelectedType(type);
    setEditingTypeName(type.name);
    setEditingAvgTrips(type.avg_trips_per_workday); // Set avg trips
    setError(null);
    setNewPurposeName(''); // For new purpose input in edit form
    setNewPurposeMaxDistance(''); // For new purpose input in edit form
    setEditingPurposes([]); // Clear previous purposes before fetch
    // setDeletedPurposeIds([]); // Removed

    setIsFetchingPurposes(true);
    try {
      // Ensure getPurposesForBusinessType is correctly imported and used
      const result = await getPurposesForBusinessType(type.id);
      if (result.error) {
        console.error("Error fetching purposes:", result.error);
        setError(`Failed to load purposes: ${result.error}`);
        setEditingPurposes([]);
      } else {
        // Store full purpose objects
        setEditingPurposes(result.data || []); 
      }
    } catch (fetchError) {
      console.error('Unexpected error fetching purposes:', fetchError);
      setError('An unexpected error occurred while loading purposes.');
      setEditingPurposes([]);
    } finally {
      setIsFetchingPurposes(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTypeToDeleteId(id);
    // Hide other forms if open
    setIsCreating(false);
    setIsEditing(false);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!typeToDeleteId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCustomBusinessType(typeToDeleteId);
      if (result.error) {
        setError(result.error);
      } else {
        setTypeToDeleteId(null); // Close confirmation
        await fetchTypes(); // Refresh list
        onUpdate(); // Notify parent
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting.");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setTypeToDeleteId(null);
    setError(null);
  };

  // Handler to add a new purpose to the editingPurposes list (in Edit mode)
  const handleAddEditingPurpose = () => {
    const name = newPurposeName.trim(); // Uses newPurposeName state for edit form's new purpose
    const distance = typeof newPurposeMaxDistance === 'number' ? newPurposeMaxDistance : -1; // Uses newPurposeMaxDistance state

    if (!name || distance <= 0) {
      setError("Purpose name must not be empty and max distance must be positive for editing types.");
      return;
    }
    setError(null);

    const newEditingPurpose: CustomBusinessPurpose = {
      id: `temp-${Date.now()}`, // Temporary ID for new purposes in edit mode
      business_type_id: selectedType?.id || '', // Should exist if selectedType is defined
      purpose_name: name,
      max_distance: distance,
      created_at: new Date().toISOString(), // Placeholder, not sent for new purposes
    };

    setEditingPurposes(current => [...current, newEditingPurpose]);
    setNewPurposeName(''); // Clear input for edit form's new purpose
    setNewPurposeMaxDistance(''); // Clear input for edit form's new purpose
  };

  // Handler to remove a purpose from the editingPurposes list (in Edit mode)
  const handleDeleteEditingPurpose = (purposeIdToDelete: string) => {
    setEditingPurposes(current => current.filter(p => p.id !== purposeIdToDelete));
    // No need for deletedPurposeIds if backend handles by omission
    // if (!purposeIdToDelete.startsWith('temp-')) {
    //   setDeletedPurposeIds(current => [...current, purposeIdToDelete]);
    // }
  };
  
  // Fetch full business type details when editing, including purposes
  // This ensures avg_trips_per_workday and full purpose details are available
  // The main `types` list only has id and name.
  const enhancedHandleEditClick = async (type: Pick<CustomBusinessType, 'id' | 'name'>) => {
    setIsFetchingPurposes(true); // Use this generic loading for fetching full details
    setError(null);
    try {
      const result = await getCustomBusinessTypeDetails(type.id);
      if (result.error || !result.data) {
        setError(result.error || "Could not fetch type details.");
        setIsFetchingPurposes(false);
        return;
      }
      // Now call the original handleEditClick with the full data
      handleEditClick(result.data); 
    } catch (e) {
      setError("An unexpected error occurred while fetching type details.");
    } finally {
      // handleEditClick will set setIsFetchingPurposes(false) after its own purpose fetch
    }
  };


  // Find the name of the type being deleted for the confirmation message
  // Ensure `types` contains full CustomBusinessType objects if you need more than name here,
  // or adjust to use the `selectedType` if appropriate.
  const typeNameToDelete = types.find((t) => t.id === typeToDeleteId)?.name;


  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? `Edit Type: ${selectedType?.name || ''}` : "Manage Custom Business Types"}
      size="xl" // Increased size for more complex forms
    >
      <Stack gap="md">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Group justify="center">
            <Loader />
          </Group>
        ) : (
          <>
            {/* --- Edit Form --- */}
            {isEditing && selectedType && (
              <Stack gap="md" mt="sm">
                <TextInput
                  label="Edit type name"
                  value={editingTypeName}
                  onChange={(event) => setEditingTypeName(event.currentTarget.value)}
                  disabled={isSaving || isFetchingPurposes}
                  data-autofocus
                />
                <NumberInput
                  label="Average trips per workday"
                  placeholder="e.g., 4"
                  value={editingAvgTrips}
                  onChange={setEditingAvgTrips}
                  min={0}
                  disabled={isSaving || isFetchingPurposes}
                />
                <Divider my="md" label="Manage Purposes" labelPosition="center" />

                {/* --- Display Existing/Added Purposes (Edit Mode) --- */}
                <Stack gap="xs" mb="md">
                  {isFetchingPurposes ? (
                    <Group justify="center"><Loader size="sm" /></Group>
                  ) : editingPurposes.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center">No purposes defined yet.</Text>
                  ) : (
                    editingPurposes.map((purpose) => (
                      <Paper withBorder p="xs" key={purpose.id} radius="sm">
                        <Group justify="space-between">
                          <Box>
                            <Text fw={500}>{purpose.purpose_name}</Text>
                            <Text size="xs" c="dimmed">Max Distance: {purpose.max_distance} miles</Text>
                          </Box>
                          <Group gap="xs">
                            {/* Edit Purpose button can be enabled later if individual purpose editing is needed */}
                            <ActionIcon variant="subtle" color="blue" disabled title="Edit Purpose (coming soon)"> 
                              <IconPencil size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="subtle" 
                              color="red" 
                              title="Delete Purpose"
                              onClick={() => handleDeleteEditingPurpose(purpose.id)}
                              disabled={isSaving || isFetchingPurposes}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    ))
                  )}
                </Stack>

                {/* --- Add New Purpose Form (Edit Mode) --- */}
                <Paper p="sm" withBorder radius="md" mt="sm">
                  <Title order={6} size="sm" mb="xs">Add New Purpose to this Type</Title>
                  <Group grow align="flex-start">
                    <TextInput
                      placeholder="Purpose Name (e.g., Client Meeting)"
                      value={newPurposeName} // Uses newPurposeName for edit's new purpose
                      onChange={(e) => setNewPurposeName(e.currentTarget.value)}
                      disabled={isSaving || isFetchingPurposes}
                    />
                    <NumberInput
                      placeholder="Max Distance (miles)"
                      value={newPurposeMaxDistance} // Uses newPurposeMaxDistance for edit's new purpose
                      onChange={(value) => setNewPurposeMaxDistance(typeof value === 'number' ? value : '')}
                      min={0.1} step={0.1} decimalScale={1} fixedDecimalScale
                      disabled={isSaving || isFetchingPurposes}
                    />
                  </Group>
                  <Button 
                    mt="sm" size="xs" variant="light"
                    onClick={handleAddEditingPurpose} // Specific handler for edit mode
                    disabled={isSaving || isFetchingPurposes || !newPurposeName.trim() || (typeof newPurposeMaxDistance !== 'number' || newPurposeMaxDistance <=0)}
                  >
                    Add Purpose to List
                  </Button>
                </Paper>
                
                <Divider my="md" />

                <Group justify="right" mt="md">
                  <Button variant="default" onClick={handleCancelEdit} disabled={isSaving || isFetchingPurposes}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateType}
                    loading={isSaving}
                    disabled={isSaving || isFetchingPurposes || !editingTypeName.trim() || (typeof editingAvgTrips !== 'number' || editingAvgTrips <=0) || (editingTypeName.trim() === selectedType.name && editingAvgTrips === selectedType.avg_trips_per_workday && editingPurposes.length === (selectedType.custom_business_purposes?.length || 0))}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            )}

            {/* --- Delete Confirmation (No changes needed here based on new fields) --- */}
            {typeToDeleteId && (
              <Stack align="center" gap="md" mt="md" mb="md">
                <Text fw={500} ta="center">
                  Are you sure you want to delete the type &quot;
                  {typeNameToDelete || "this type"}&quot;?
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  This action cannot be undone.
                </Text>
                <Group justify="center" mt="xs">
                  <Button
                    variant="default"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="red"
                    onClick={handleConfirmDelete}
                    loading={isDeleting}
                  >
                    Confirm Delete
                  </Button>
                </Group>
              </Stack>
            )}

            {/* --- Main List / Add Form (Hidden during delete confirmation AND edit) --- */}
            {!typeToDeleteId && !isEditing && (
              <Stack gap="xs">
                {types.length === 0 && !isCreating && (
                  <Text size="sm" color="dimmed" ta="center">
                    You haven&apos;t created any custom business types yet.
                  </Text>
                )}
                {/* List View */}
                {types.map((type) => (
                  <Group key={type.id} justify="apart">
                    <Text>{type.name}</Text>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => enhancedHandleEditClick(type)} // Use enhanced click handler
                        disabled={isCreating || isEditing || isDeleting || !!typeToDeleteId || isLoading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        onClick={() => handleDeleteClick(type.id)}
                        disabled={isCreating || isEditing || isDeleting || !!typeToDeleteId || isLoading}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Group>
                ))}

                {/* --- Add New Type Form (Enhanced) --- */}
                {isCreating && (
                  <Paper p="md" withBorder mt="lg">
                    <Title order={5} mb="md">Create New Business Type</Title>
                    <Stack gap="md">
                      <TextInput
                        label="Business Type Name"
                        placeholder="e.g., Sales, Delivery"
                        value={newTypeName}
                        onChange={(event) => setNewTypeName(event.currentTarget.value)}
                        disabled={isSaving}
                        data-autofocus
                      />
                      <NumberInput
                        label="Average trips per workday"
                        placeholder="e.g., 3"
                        value={newAvgTrips}
                        onChange={setNewAvgTrips}
                        min={1} // Assuming at least 1 trip
                        disabled={isSaving}
                      />

                      <Divider my="xs" label="Purposes for this new type" labelPosition="center" />
                      {/* List of added purposes for the new type */}
                      <Stack gap="xs">
                        {newTypePurposes.length === 0 ? (
                          <Text size="sm" c="dimmed" ta="center">No purposes added yet for this new type.</Text>
                        ) : (
                          newTypePurposes.map((purpose, index) => (
                            <Paper withBorder p="xs" key={index} radius="sm">
                              <Group justify="space-between">
                                <Box>
                                  <Text fw={500}>{purpose.purpose_name}</Text>
                                  <Text size="xs" c="dimmed">Max Distance: {purpose.max_distance} miles</Text>
                                </Box>
                                <ActionIcon 
                                  variant="subtle" 
                                  color="red" 
                                  title="Remove Purpose"
                                  onClick={() => handleRemoveNewTypePurpose(index)}
                                  disabled={isSaving}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Paper>
                          ))
                        )}
                      </Stack>
                      
                      {/* Form to add a new purpose to the new type */}
                      <Paper p="sm" withBorder radius="md" mt="xs">
                        <Title order={6} size="sm" mb="xs">Add a Purpose</Title>
                        <Group grow align="flex-start">
                          <TextInput
                            placeholder="Purpose Name (e.g., Site Visit)"
                            value={currentNewPurposeName}
                            onChange={(e) => setCurrentNewPurposeName(e.currentTarget.value)}
                            disabled={isSaving}
                          />
                          <NumberInput
                            placeholder="Max Distance (miles)"
                            value={currentNewPurposeMaxDistance}
                            onChange={(val) => setCurrentNewPurposeMaxDistance(typeof val === 'number' ? val : '')}
                            min={0.1} step={0.1} decimalScale={1} fixedDecimalScale
                            disabled={isSaving}
                          />
                        </Group>
                        <Button 
                          mt="sm" size="xs" variant="light"
                          onClick={handleAddNewTypePurpose}
                          disabled={isSaving || !currentNewPurposeName.trim() || (typeof currentNewPurposeMaxDistance !== 'number' || currentNewPurposeMaxDistance <=0)}
                        >
                          Add Purpose to New Type List
                        </Button>
                      </Paper>

                      <Group justify="right" mt="md">
                        <Button
                          variant="default"
                          onClick={() => {
                            setIsCreating(false);
                            setNewTypeName("");
                            setNewAvgTrips('');
                            setNewTypePurposes([]);
                            setCurrentNewPurposeName("");
                            setCurrentNewPurposeMaxDistance("");
                            setError(null);
                          }}
                          disabled={isSaving}
                        >
                          Cancel Creation
                        </Button>
                        <Button
                          onClick={handleSaveNewType}
                          loading={isSaving}
                          disabled={isSaving || !newTypeName.trim() || (typeof newAvgTrips !== 'number' || newAvgTrips <= 0) || newTypePurposes.length === 0}
                        >
                          Save New Business Type
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                )}

                {/* --- Add New / Cancel Button (Toggle for Add Form) --- */}
                {/* Hide this button if the Add form is already open */}
                {!isCreating && (
                <Group justify="left" mt="md">
                  <Button
                    variant="filled" // Always "filled" when it's just the "Add New Type" button
                    onClick={() => {
                      setIsCreating(true); // Open the creation form
                      setNewTypeName(""); 
                      setNewAvgTrips('');
                      setNewTypePurposes([]);
                      setCurrentNewPurposeName("");
                      setCurrentNewPurposeMaxDistance("");
                      setError(null);
                      setIsEditing(false); // Close edit form if open
                      setTypeToDeleteId(null); // Close delete confirmation if open
                    }}
                    disabled={isSaving || isEditing || isDeleting || isLoading || !!typeToDeleteId} 
                  >
                    Add New Type
                  </Button>
                )}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
};

export default CustomTypeManagerModal;
