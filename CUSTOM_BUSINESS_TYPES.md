# Feature: Custom Business Types

This document tracks the tasks required to implement the custom business types feature.

## Phase 1: Database & Backend Setup

- [x] **Define Database Schema:**
    - [x] Create table `custom_business_types` (`id`, `user_id`, `name`, `avg_trips_per_workday`).
    - [x] Create table `custom_business_purposes` (`id`, `business_type_id`, `purpose_name`, `max_distance`).
- [x] **Create Supabase Migration:** Write and apply SQL migration script.
- [x] **Implement Data Access Layer:** Create server-side functions/API endpoints for CRUD operations on custom types and purposes.

## Phase 2: Custom Type Management UI (In-Wizard Modal)

- [ ] **Modify Wizard Step:** Update the business type selection step in the mileage wizard.
    - [ ] Fetch predefined and custom business types.
    - [ ] Add button/link to open management modal.
- [ ] **Build Management Modal Component:** Create `CustomTypeManagerModal` component.
    - [ ] Display list of user's custom types.
    - [ ] Implement form for adding a new type (name, avg trips, purposes).
    - [ ] Implement form for editing an existing type (name, avg trips, add/edit/delete purposes).
    - [ ] Implement delete confirmation.
    - [ ] Integrate server actions for CRUD operations.
- [ ] **Integrate Modal:** Connect the management modal to the wizard step.

## Phase 3: Mileage Form Integration

- [ ] **Update Form Logic:**
    - [ ] Fetch user's custom types in `TripDetailsStep`.
    - [ ] Update "Business Type" Select dropdown (add custom group, "Create New" option).
- [ ] **Display Type Details (Context):** Show associated purposes/settings below dropdown when a predefined or custom type is selected.

## Phase 4: Mileage Generation Logic Integration

- [ ] **Adapt Generation Input:** Pass selected predefined type name or custom type ID to `onGenerate`.
- [ ] **Update Generation Algorithm:**
    - [ ] Fetch custom type details if ID is received.
    - [ ] Use custom details (purposes, max distance, avg trips/day) in generation logic.
