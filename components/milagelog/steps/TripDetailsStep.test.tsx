// components/milagelog/steps/TripDetailsStep.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TripDetailsStep } from './TripDetailsStep';
import { useForm } from '@mantine/form';
import { FormValues } from '@/types/form_values';
import { CustomBusinessType } from '@/types/custom_business_type';
import { MantineProvider } from '@mantine/core'; // To provide theme context

// Mock server actions
const mockGetCustomBusinessTypes = vi.fn();
const mockGetCustomBusinessTypeDetails = vi.fn();

vi.mock('@/app/actions/customBusinessTypesActions', () => ({
  getCustomBusinessTypes: () => mockGetCustomBusinessTypes(),
  getCustomBusinessTypeDetails: (id: string) => mockGetCustomBusinessTypeDetails(id),
}));

// Mock CustomTypeManagerModal as its internal workings are tested separately
vi.mock('@/features/custom-business-types/components/CustomTypeManagerModal', () => ({
  default: ({ opened, onClose, onUpdate }: { opened: boolean; onClose: () => void; onUpdate: () => void; }) => {
    if (!opened) return null;
    return (
      <div data-testid="mock-custom-type-manager-modal">
        Mock Modal Content
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onUpdate}>Force Update Types</button>
      </div>
    );
  },
}));


const initialFormValues: FormValues = {
  startMileage: "10000",
  endMileage: "12000",
  startDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-31"),
  totalPersonalMiles: "500",
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleYear: "2022",
  businessType: "", // This will be set by interactions
};

// Sample predefined business types with full details
const samplePredefinedBusinessTypes = [
  {
    value: 'Sales', // ID for select
    label: 'Sales (Predefined)', // Label for select
    name: 'Sales', // Actual name
    avg_trips_per_workday: 5,
    purposes: [
      { purpose_name: 'Client Meeting', max_distance: 50 },
      { purpose_name: 'Prospecting', max_distance: 30 },
    ],
  },
  {
    value: 'Consulting',
    label: 'Consulting (Predefined)',
    name: 'Consulting',
    avg_trips_per_workday: 3,
    purposes: [
      { purpose_name: 'On-site Consultation', max_distance: 100 },
      { purpose_name: 'Workshop Delivery', max_distance: 75 },
    ],
  },
];

// Sample custom business types (summary for dropdown)
const sampleCustomTypesForDropdown: Pick<CustomBusinessType, "id" | "name">[] = [
  { id: 'custom-1', name: 'My Custom Type 1' },
  { id: 'custom-2', name: 'My Custom Type 2' },
];

// Sample full details for a custom type when fetched
const sampleCustomTypeDetail: CustomBusinessType = {
  id: 'custom-1',
  user_id: 'user123',
  name: 'My Custom Type 1',
  avg_trips_per_workday: 4,
  created_at: new Date().toISOString(),
  custom_business_purposes: [
    { id: 'cp1', business_type_id: 'custom-1', purpose_name: 'Custom Purpose A', max_distance: 25, created_at: new Date().toISOString() },
    { id: 'cp2', business_type_id: 'custom-1', purpose_name: 'Custom Purpose B', max_distance: 60, created_at: new Date().toISOString() },
  ],
};


describe('TripDetailsStep', () => {
  let form: ReturnType<typeof useForm<FormValues>>;

  beforeEach(() => {
    // Initialize form for each test
    form = useForm<FormValues>({ initialValues: { ...initialFormValues } });

    // Reset mocks
    mockGetCustomBusinessTypes.mockReset();
    mockGetCustomBusinessTypeDetails.mockReset();

    // Default successful mock implementations
    mockGetCustomBusinessTypes.mockResolvedValue({ data: [...sampleCustomTypesForDropdown], error: null });
    mockGetCustomBusinessTypeDetails.mockResolvedValue({ data: { ...sampleCustomTypeDetail }, error: null });
  });

  const renderComponent = () =>
    render(
      <MantineProvider> {/* Required for Mantine components */}
        <TripDetailsStep
          form={form}
          businessTypeOptions={samplePredefinedBusinessTypes}
        />
      </MantineProvider>
    );

  it('displays predefined and fetched custom types in the dropdown', async () => {
    renderComponent();
    
    // Open the select dropdown
    const selectInput = screen.getByPlaceholderText('Select or manage business types');
    await userEvent.click(selectInput);

    // Check for predefined types
    await waitFor(() => {
      expect(screen.getByText('Sales (Predefined)')).toBeInTheDocument();
      expect(screen.getByText('Consulting (Predefined)')).toBeInTheDocument();
    });

    // Check for custom types (fetched)
    await waitFor(() => {
      expect(screen.getByText('My Custom Type 1')).toBeInTheDocument();
      expect(screen.getByText('My Custom Type 2')).toBeInTheDocument();
    });
    expect(mockGetCustomBusinessTypes).toHaveBeenCalledTimes(1);
  });

  it('selects a predefined type and displays its details', async () => {
    renderComponent();
    const user = userEvent.setup();

    const selectInput = screen.getByPlaceholderText('Select or manage business types');
    await user.click(selectInput);
    await user.click(screen.getByText('Sales (Predefined)')); // Select by label

    // Verify details are displayed
    await waitFor(() => {
      expect(screen.getByText(/Selected Type: Sales/i)).toBeInTheDocument();
      expect(screen.getByText(/Average Trips per Workday: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Client Meeting \(Max: 50 miles\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Prospecting \(Max: 30 miles\)/i)).toBeInTheDocument();
    });

    // Ensure getCustomBusinessTypeDetails was NOT called for predefined
    expect(mockGetCustomBusinessTypeDetails).not.toHaveBeenCalled();
  });

  it('selects a custom type, triggers fetch, and displays its details', async () => {
    renderComponent();
    const user = userEvent.setup();
    
    const selectInput = screen.getByPlaceholderText('Select or manage business types');
    await user.click(selectInput);
    
    // Wait for custom types to be available then click
    const customTypeOption = await screen.findByText('My Custom Type 1');
    await user.click(customTypeOption);

    // Verify details are fetched and displayed
    await waitFor(() => {
      expect(mockGetCustomBusinessTypeDetails).toHaveBeenCalledWith('custom-1');
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Selected Type: My Custom Type 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Average Trips per Workday: 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Purpose A \(Max: 25 miles\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Purpose B \(Max: 60 miles\)/i)).toBeInTheDocument();
    });
  });

  it('opens the CustomTypeManagerModal when "Manage Types" is clicked', async () => {
    renderComponent();
    const user = userEvent.setup();

    expect(screen.queryByTestId('mock-custom-type-manager-modal')).not.toBeInTheDocument();

    const manageButton = screen.getByRole('button', { name: /Manage Types/i });
    await user.click(manageButton);

    await waitFor(() => {
      expect(screen.getByTestId('mock-custom-type-manager-modal')).toBeInTheDocument();
    });
  });
  
  it('refreshes types and details when modal onUpdate is called', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Open and trigger update from the mock modal
    const manageButton = screen.getByRole('button', { name: /Manage Types/i });
    await user.click(manageButton);
    const forceUpdateButton = await screen.findByRole('button', { name: /Force Update Types/i });

    // Before update, let's select a type
    const selectInput = screen.getByPlaceholderText('Select or manage business types');
    await user.click(selectInput);
    const customTypeOption = await screen.findByText('My Custom Type 1'); // Assuming this is still there
    await user.click(customTypeOption);
    await screen.findByText(/Selected Type: My Custom Type 1/i); // Wait for initial details

    // Mock that getCustomBusinessTypes will return a slightly different list after update
    const updatedCustomTypesForDropdown: Pick<CustomBusinessType, "id" | "name">[] = [
      { id: 'custom-1', name: 'My Custom Type 1 (Updated)' }, // Name changed
      { id: 'custom-3', name: 'My Newest Custom Type' }, // New type
    ];
    mockGetCustomBusinessTypes.mockResolvedValueOnce({ data: updatedCustomTypesForDropdown, error: null });
    
    // Mock that the details for 'custom-1' also changed
    const updatedCustomTypeDetail: CustomBusinessType = {
      ...sampleCustomTypeDetail,
      name: 'My Custom Type 1 (Updated)',
      avg_trips_per_workday: 7,
    };
    mockGetCustomBusinessTypeDetails.mockResolvedValueOnce({ data: updatedCustomTypeDetail, error: null });
    
    await user.click(forceUpdateButton);

    await waitFor(() => {
      // Check if dropdown options are updated
      expect(screen.getByText('My Custom Type 1 (Updated)')).toBeInTheDocument();
      expect(screen.getByText('My Newest Custom Type')).toBeInTheDocument();
    });
    
    await waitFor(() => {
        // Check if details of the selected type ('custom-1') are refreshed
        expect(screen.getByText(/Selected Type: My Custom Type 1 \(Updated\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Average Trips per Workday: 7/i)).toBeInTheDocument();
    });

    // getCustomBusinessTypes called once on load, once on update.
    expect(mockGetCustomBusinessTypes).toHaveBeenCalledTimes(2); 
    // getCustomBusinessTypeDetails called once for initial selection, once for refresh after update.
    expect(mockGetCustomBusinessTypeDetails).toHaveBeenCalledTimes(2); 
  });

});
