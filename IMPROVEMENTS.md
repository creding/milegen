# Mileage Application Improvements

This document tracks potential improvements and refactoring tasks for the mileage application.

## MileageForm Component (`components/milagelog/MileageForm.tsx`)

- [x] **Simplify Prop Passing & State Handling:**
    - [x] Remove redundant state variables (`vehicleMake`, `vehicleModel`, `vehicleYear`, `totalPersonalMiles`, `businessType`, etc.) and corresponding handlers (`handleMakeChange`, `handleModelChange`, etc.) from `MileageForm`.
    - [x] Update step components (`VehicleInfoStep`, `TripDetailsStep`) to rely solely on the `form` object prop for managing their respective inputs (using `form.getInputProps` or `form.setFieldValue`).
    - [x] Keep separate state/handlers for `DateRangeStep` as needed for `DatePickerInput`.
    - [x] Access form values in `MileageForm` directly via `form.values` when needed (e.g., for deriving `availableModels`).

- [x] **Centralize `FormValues` Type Definition:**
    - [x] Create a dedicated types file (e.g., `types/forms.d.ts` or similar based on project structure).
    - [x] Define the `FormValues` interface once in the types file.
    - [x] Import the `FormValues` type into `MileageForm.tsx` and all step components (`VehicleInfoStep`, `TripDetailsStep`, `DateRangeStep`, `ReviewStep`), removing the duplicated definitions.

- [x] **Consolidate Constant Usage (Optional):**
    - [x] Consider passing constants (`VEHICLE_MAKES`, `VEHICLE_YEARS`) as props from `MileageForm` down to step components (`VehicleInfoStep`, `ReviewStep`) instead of having the steps import them directly. This could increase decoupling but is lower priority.

## General / Future

- [x] **Centralize VehicleOption Type:** Move the `VehicleOption` interface to a central types file (e.g., `types/vehicle.d.ts` or `types/form_values.ts`) and import it into `VehicleInfoStep` and `ReviewStep`.
- [x] **Review `getVehicleLabel` Utility:** Check usage of `getVehicleLabel` in `utils/vehicle.utils.ts`. If unused, remove it. If used elsewhere, refactor it to accept constants as arguments instead of importing them directly.
- [ ] **Simplify Date Handling:** Investigate using `form.getInputProps('startDate')` and `form.getInputProps('endDate')` directly with `DatePickerInput` in `DateRangeStep` to potentially remove `handleStartDateChange` and `handleEndDateChange` from `MileageForm`.
- [ ] **Code Comments Cleanup:** Review and update/remove comments in `MileageForm`, `VehicleSelector`, `VehicleInfoStep`, and `ReviewStep` to reflect recent refactoring.

- *(Add other potential improvement ideas here)*
