// features/custom-business-types/components/CustomTypeManagerModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CustomTypeManagerModal from './CustomTypeManagerModal';
import { CustomBusinessType, CustomBusinessPurpose, CreateCustomBusinessTypeDTO, UpdateCustomBusinessTypeDTO } from '@/types/custom_business_type';

// Mocking Mantine's Portal component as it can cause issues in jsdom
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // Add other components that might cause issues if necessary
  };
});


// Mock server actions
const mockGetCustomBusinessTypes = vi.fn();
const mockCreateCustomBusinessType = vi.fn();
const mockUpdateCustomBusinessType = vi.fn();
const mockDeleteCustomBusinessType = vi.fn();
const mockGetPurposesForBusinessType = vi.fn(); // Used when editing a type

vi.mock('@/app/actions/customBusinessTypesActions', () => ({
  getCustomBusinessTypes: () => mockGetCustomBusinessTypes(),
  createCustomBusinessType: (dto: CreateCustomBusinessTypeDTO) => mockCreateCustomBusinessType(dto),
  updateCustomBusinessType: (dto: UpdateCustomBusinessTypeDTO) => mockUpdateCustomBusinessType(dto),
  deleteCustomBusinessType: (id: string) => mockDeleteCustomBusinessType(id),
  getPurposesForBusinessType: (id: string) => mockGetPurposesForBusinessType(id),
}));

const mockOnClose = vi.fn();
const mockOnUpdate = vi.fn();

const sampleTypes: Pick<CustomBusinessType, "id" | "name">[] = [
  { id: '1', name: 'Type One' },
  { id: '2', name: 'Type Two' },
];

const sampleTypeDetails: CustomBusinessType = {
  id: '1',
  user_id: 'user123',
  name: 'Type One',
  avg_trips_per_workday: 3,
  created_at: new Date().toISOString(),
  custom_business_purposes: [
    { id: 'p1', business_type_id: '1', purpose_name: 'Purpose 1.1', max_distance: 10, created_at: new Date().toISOString() },
    { id: 'p2', business_type_id: '1', purpose_name: 'Purpose 1.2', max_distance: 20, created_at: new Date().toISOString() },
  ],
};

describe('CustomTypeManagerModal', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGetCustomBusinessTypes.mockReset();
    mockCreateCustomBusinessType.mockReset();
    mockUpdateCustomBusinessType.mockReset();
    mockDeleteCustomBusinessType.mockReset();
    mockGetPurposesForBusinessType.mockReset();
    mockOnClose.mockReset();
    mockOnUpdate.mockReset();

    // Default successful mock implementations
    mockGetCustomBusinessTypes.mockResolvedValue({ data: [...sampleTypes], error: null });
    mockCreateCustomBusinessType.mockResolvedValue({ data: { ...sampleTypeDetails, id: 'newId', name: 'New Type' }, error: null });
    mockUpdateCustomBusinessType.mockResolvedValue({ data: { ...sampleTypeDetails, name: 'Updated Type One' }, error: null });
    mockDeleteCustomBusinessType.mockResolvedValue({ success: true, error: null });
    mockGetPurposesForBusinessType.mockResolvedValue({ data: sampleTypeDetails.custom_business_purposes, error: null });
  });

  it('displays fetched custom types when opened', async () => {
    render(
      <CustomTypeManagerModal
        opened={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Type One')).toBeInTheDocument();
      expect(screen.getByText('Type Two')).toBeInTheDocument();
    });
    expect(mockGetCustomBusinessTypes).toHaveBeenCalledTimes(1);
  });

  it('allows adding a new type', async () => {
    const user = userEvent.setup();
    render(
      <CustomTypeManagerModal
        opened={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /Add New Type/i }));

    // Fill out the form for the new type
    await user.type(screen.getByLabelText(/Business Type Name/i), 'New Test Type');
    await user.type(screen.getByLabelText(/Average trips per workday/i), '5');

    // Add a purpose
    await user.type(screen.getByPlaceholderText('Purpose Name (e.g., Site Visit)'), 'New Purpose 1');
    // For NumberInput, direct value setting or clear and type might be needed depending on implementation
    // Assuming clear and type for robustness
    const maxDistInput = screen.getByPlaceholderText('Max Distance (miles)');
    await user.clear(maxDistInput); 
    await user.type(maxDistInput, '25');
    await user.click(screen.getByRole('button', { name: /Add Purpose to New Type List/i }));

    await waitFor(() => {
        expect(screen.getByText('New Purpose 1')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Save New Business Type/i }));

    await waitFor(() => {
      expect(mockCreateCustomBusinessType).toHaveBeenCalledWith({
        name: 'New Test Type',
        avg_trips_per_workday: 5,
        purposes: [{ purpose_name: 'New Purpose 1', max_distance: 25 }],
      });
    });
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    // Check if form is reset (e.g., "Add New Type" button is visible again, or a field is cleared)
    // This depends on the modal's behavior after successful creation.
    // For now, we assume onUpdate is the primary indicator.
  });

  it('allows editing an existing type', async () => {
    const user = userEvent.setup();
    // Ensure getPurposesForBusinessType is mocked for the specific type ID '1'
     mockGetPurposesForBusinessType.mockResolvedValueOnce({ data: sampleTypeDetails.custom_business_purposes, error: null });

    render(
      <CustomTypeManagerModal
        opened={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Wait for initial types to load
    await screen.findByText('Type One');
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await user.click(editButtons[0]); // Click edit for "Type One"

    await waitFor(() => {
      // Verify form is populated
      expect(screen.getByLabelText(/Edit type name/i)).toHaveValue('Type One');
      expect(screen.getByLabelText(/Average trips per workday/i)).toHaveValue(sampleTypeDetails.avg_trips_per_workday);
      expect(screen.getByText('Purpose 1.1')).toBeInTheDocument(); // Check for existing purpose
    });
    
    expect(mockGetPurposesForBusinessType).toHaveBeenCalledWith('1');

    // Change data
    const nameInput = screen.getByLabelText(/Edit type name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Type One');

    // Add a new purpose during edit
    await user.type(screen.getByPlaceholderText('Purpose Name (e.g., Client Meeting)'), 'Added Purpose Edit');
    const maxDistEditInput = screen.getAllByPlaceholderText('Max Distance (miles)')[1]; // Assuming the second one is for adding new purpose in edit
    await user.clear(maxDistEditInput);
    await user.type(maxDistEditInput, '33');
    await user.click(screen.getByRole('button', { name: /Add Purpose to List/i }));
     await waitFor(() => {
        expect(screen.getByText('Added Purpose Edit')).toBeInTheDocument();
    });


    await user.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockUpdateCustomBusinessType).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'Updated Type One',
          avg_trips_per_workday: sampleTypeDetails.avg_trips_per_workday, // Assuming avg trips wasn't changed in this test
          purposes: expect.arrayContaining([
            expect.objectContaining({ id: 'p1', purpose_name: 'Purpose 1.1', max_distance: 10 }),
            expect.objectContaining({ id: 'p2', purpose_name: 'Purpose 1.2', max_distance: 20 }),
            expect.objectContaining({ purpose_name: 'Added Purpose Edit', max_distance: 33 }), // New purpose won't have an id
          ])
        })
      );
    });
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });


  it('allows deleting an existing type', async () => {
    const user = userEvent.setup();
    render(
      <CustomTypeManagerModal
        opened={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    await screen.findByText('Type One'); // Wait for types to load
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await user.click(deleteButtons[0]); // Click delete for "Type One"

    // Check for confirmation
    expect(screen.getByText(/Are you sure you want to delete the type "Type One"?/i)).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /Confirm Delete/i }));

    await waitFor(() => {
      expect(mockDeleteCustomBusinessType).toHaveBeenCalledWith('1');
    });
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
  });

  it('displays an error message if fetching types fails', async () => {
    mockGetCustomBusinessTypes.mockResolvedValueOnce({ data: [], error: 'Failed to fetch' });
    render(
      <CustomTypeManagerModal
        opened={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

   it('displays an error if creating a type fails', async () => {
    const user = userEvent.setup();
    mockCreateCustomBusinessType.mockResolvedValueOnce({ data: null, error: 'Create failed' });
    render(
      <CustomTypeManagerModal
        opened={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /Add New Type/i }));
    await user.type(screen.getByLabelText(/Business Type Name/i), 'Error Type');
    await user.type(screen.getByLabelText(/Average trips per workday/i), '1');
     await user.type(screen.getByPlaceholderText('Purpose Name (e.g., Site Visit)'), 'Purpose E');
    const maxDistInputE = screen.getByPlaceholderText('Max Distance (miles)');
    await user.clear(maxDistInputE); 
    await user.type(maxDistInputE, '5');
    await user.click(screen.getByRole('button', { name: /Add Purpose to New Type List/i }));
    await user.click(screen.getByRole('button', { name: /Save New Business Type/i }));

    await waitFor(() => {
      expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
    });
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });


});
