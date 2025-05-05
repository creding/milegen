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
  const [editingTypeName, setEditingTypeName] = useState(""); // For Edit form

  // State for managing purposes during edit
  const [editingPurposes, setEditingPurposes] = useState<CustomBusinessPurpose[]>(
    []
  ); // Holds purposes for the type being edited
  const [newPurposeName, setNewPurposeName] = useState("");
  const [newPurposeMaxDistance, setNewPurposeMaxDistance] = useState<number | ''>(
    ""
  ); // Use '' for empty input
  const [deletedPurposeIds, setDeletedPurposeIds] = useState<string[]>([]); // Track deleted purpose IDs

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
      setEditingTypeName("");
      setEditingPurposes([]); // Clear purposes state on cancel
      setNewPurposeName("");
      setNewPurposeMaxDistance("");
      setDeletedPurposeIds([]); // Reset deleted tracker
    }
  }, [opened, fetchTypes]);

  const handleUpdateType = async () => {
    if (!selectedType || !editingTypeName.trim()) return;

    const trimmedName = editingTypeName.trim();
    if (trimmedName === selectedType.name) {
      // No changes made
      setIsEditing(false);
      setSelectedType(null);
      setEditingTypeName("");
      setError(null);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Use the type from UpdateCustomBusinessTypeDTO['purposes'] directly
      const purposeDTOs: UpdateCustomBusinessTypeDTO['purposes'] = editingPurposes.map(p => ({
        // Include ID only if it's not a temporary one
        id: p.id.startsWith('temp-') ? undefined : p.id,
        purpose_name: p.purpose_name,
        max_distance: p.max_distance,
      }));

      const updateData: UpdateCustomBusinessTypeDTO = {
        id: selectedType.id, // Add the ID of the type being updated
        name: editingTypeName.trim() !== selectedType.name ? editingTypeName.trim() : undefined,
        purposes: purposeDTOs, // Send the final list of purposes
      };

      // Only call update if there are actual changes
      const hasNameChange = !!updateData.name;
      // TODO: Implement a more robust check for purpose changes if needed.
      // For now, we'll send the update if the name changed or if we potentially modified purposes.
      if (hasNameChange || editingPurposes.length > 0 || deletedPurposeIds.length > 0) { 
        const result = await updateCustomBusinessType(updateData);
        if (result.error) {
          setError(result.error);
        } else {
          setIsEditing(false);
          setSelectedType(null);
          setEditingTypeName("");
          await fetchTypes(); // Refresh list
          onUpdate(); // Notify parent
        }
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
    setEditingPurposes([]); // Clear purposes state on cancel
    setSelectedType(null);
    setEditingTypeName("");
    setError(null);
  };

  const handleSaveNewType = async () => {
    const trimmedName = newTypeName.trim();
    if (!trimmedName) {
      setError("Business type name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const dto: CreateCustomBusinessTypeDTO = {
        name: trimmedName,
        avg_trips_per_workday: 4, // Default value
        purposes: [], // Explicitly pass empty array as it seems required by the action
      };
      const result = await createCustomBusinessType(dto);
      if (result.error) {
        setError(result.error);
      } else {
        await fetchTypes(); // Refresh the list
        onUpdate(); // Notify parent component
        setIsCreating(false); // Close the form
        setNewTypeName(""); // Clear input
      }
    } catch (err) {
      setError("An unexpected error occurred while saving.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = async (type: Pick<CustomBusinessType, 'id' | 'name'>) => {
    setIsEditing(true);
    setIsCreating(false); // Ensure create form is hidden
    setSelectedType(type);
    setEditingTypeName(type.name);
    setError(null); // Clear previous errors
    setNewPurposeName('');
    setNewPurposeMaxDistance('');
    setEditingPurposes([]); // Clear previous purposes
    setDeletedPurposeIds([]); // Reset deleted tracker

    setIsFetchingPurposes(true); // Start loading purposes
    try {
      const result = await getPurposesForBusinessType(type.id);
      if (result.error) {
        console.error("Error fetching purposes:", result.error);
        setError(`Failed to load purposes: ${result.error}`);
        setEditingPurposes([]); // Ensure state is empty on error
      } else {
        setEditingPurposes(result.data || []); // Set fetched purposes
      }
    } catch (fetchError) {
      console.error('Unexpected error fetching purposes:', fetchError);
      setError('An unexpected error occurred while loading purposes.');
      setEditingPurposes([]);
    } finally {
      setIsFetchingPurposes(false); // Stop loading purposes
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

  // Temporary handler to add purpose to local state during edit
  // TODO: This needs to generate proper DTOs later for the update action
  const handleAddPurpose = () => {
    const name = newPurposeName.trim();
    const distance = typeof newPurposeMaxDistance === 'number' ? newPurposeMaxDistance : -1;

    if (!name || distance <= 0) {
      // Basic validation
      setError("Purpose name must not be empty and max distance must be positive.");
      return;
    }

    setError(null); // Clear previous errors

    // Create a temporary purpose object (adjust structure as needed)
    // Note: Real implementation needs proper IDs, maybe temporary ones?
    const newPurpose: CustomBusinessPurpose = {
      id: `temp-${Date.now()}`, // Temporary ID for list key, replace later
      business_type_id: selectedType?.id || '', // Should have selectedType if we are here
      purpose_name: name,
      max_distance: distance,
      created_at: new Date().toISOString(), // Placeholder
    };

    setEditingPurposes(current => [...current, newPurpose]);

    // Clear inputs
    setNewPurposeName('');
    setNewPurposeMaxDistance('');
  };

  const handleDeletePurpose = (purposeIdToDelete: string) => {
    setEditingPurposes(current => current.filter(p => p.id !== purposeIdToDelete));
    // Only add to deleted list if it's not a temporary ID (i.e., it existed before)
    if (!purposeIdToDelete.startsWith('temp-')) {
      setDeletedPurposeIds(current => [...current, purposeIdToDelete]);
    }
  };

  // Find the name of the type being deleted for the confirmation message
  const typeNameToDelete = types.find((t) => t.id === typeToDeleteId)?.name;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? `Edit Type: ${selectedType?.name}` : "Manage Custom Business Types"}
      size="lg"
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
                  disabled={isSaving}
                  data-autofocus // Focus input when edit starts
                />
                <Divider my="md" label="Associated Purposes" labelPosition="center" />

                {/* --- Display Existing/Added Purposes --- */}
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
                            <ActionIcon variant="subtle" color="blue" disabled title="Edit Purpose (coming soon)">
                              <IconPencil size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="subtle" 
                              color="red" 
                              title="Delete Purpose"
                              onClick={() => handleDeletePurpose(purpose.id)}
                              disabled={isSaving} // Disable while main save is in progress
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    ))
                  )}
                </Stack>

                {/* --- Add New Purpose Form --- */}
                <Paper p="sm" withBorder radius="md">
                  <Title order={6} size="xs" mb="xs">Add New Purpose</Title>
                  <Group grow align="flex-start">
                    <TextInput
                      placeholder="Purpose Name (e.g., Client Meeting)"
                      value={newPurposeName}
                      onChange={(e) => setNewPurposeName(e.currentTarget.value)}
                      disabled={isSaving}
                    />
                    <NumberInput
                      placeholder="Max Distance (miles)"
                      value={newPurposeMaxDistance}
                      onChange={(value) => setNewPurposeMaxDistance(typeof value === 'number' ? value : '')}
                      min={0.1} // Min distance
                      step={0.1}
                      decimalScale={1}
                      fixedDecimalScale
                      disabled={isSaving}
                    />
                  </Group>
                  <Button 
                    mt="sm" 
                    size="xs" 
                    variant="light"
                    onClick={handleAddPurpose}
                    disabled={isSaving || !newPurposeName.trim() || !newPurposeMaxDistance}
                  >
                    Add Purpose
                  </Button>
                </Paper>

                <Divider my="md" />

                <Group justify="right" mt="md">
                  <Button
                    variant="default"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateType}
                    loading={isSaving}
                    disabled={!editingTypeName.trim() || editingTypeName.trim() === selectedType.name}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            )}

            {/* --- Delete Confirmation --- */}
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
                        onClick={() => handleEditClick(type)}
                        disabled={isCreating || isEditing || isDeleting || !!typeToDeleteId}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        onClick={() => handleDeleteClick(type.id)}
                        disabled={isCreating || isEditing || isDeleting || !!typeToDeleteId}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Group>
                ))}

                {/* --- Add New Type Form --- */}
                {isCreating ? (
                  <Group mt="md" grow>
                    <TextInput
                      placeholder="New business type name"
                      value={newTypeName}
                      onChange={(event) =>
                        setNewTypeName(event.currentTarget.value)
                      }
                      disabled={isSaving}
                    />
                    <Button
                      onClick={handleSaveNewType}
                      loading={isSaving}
                      disabled={!newTypeName.trim()}
                    >
                      Save
                    </Button>
                  </Group>
                ) : null}

                {/* --- Add New / Cancel Button --- */}
                <Group justify="left" mt="md">
                  <Button
                    variant={isCreating ? "default" : "filled"}
                    onClick={() => {
                      setIsCreating(!isCreating);
                      setNewTypeName(""); // Clear input when toggling
                      setError(null); // Clear error when toggling
                      // Ensure edit/delete are not active
                      setIsEditing(false);
                      setTypeToDeleteId(null);
                    }}
                    disabled={isSaving || isEditing || isDeleting} // Disable if saving, editing or deleting
                  >
                    {isCreating ? "Cancel" : "Add New Type"}
                  </Button>
                </Group>
              </Stack>
            )}
          </>
        )}
      </Stack>
      {/* Modal Footer might not be needed if actions are inline */}
    </Modal>
  );
};

export default CustomTypeManagerModal;
