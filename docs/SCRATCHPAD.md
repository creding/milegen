

## Mileage Generator Enhancements

### Requirements Overview
1. Add business type selector to MileageForm
2. Remove default location and purpose values
3. Handle location in a more generic fashion
4. Add setting for maximum entries per day
5. Make trip distances realistic based on purpose

### 1. Business Type Selector

#### Current State
- We have implemented business types in `mileageUtils.ts`
- Each business type has specific purposes (e.g., "Food Delivery", "Rideshare", "Consulting")
- The form currently doesn't allow selecting business types

#### Implementation Plan
1. **Update Interfaces**
   - Add businessType to MileageForm props interface
   - Add businessType state to GeneratorPage component

2. **UI Changes**
   - Add Select component for business types in MileageForm
   - Use BUSINESS_TYPES array from mileageUtils.ts for options
   - Add validation for businessType field

3. **Backend Integration**
   - Pass businessType to generateOrganicMileageLog function
   - Ensure businessType is used when generating trip purposes

### 2. Remove Default Location and Purpose

#### Current State
- Location and business purpose have default values or placeholders
- These might not be appropriate for all business types

#### Implementation Plan
1. **Remove Defaults**
   - Remove any hardcoded default values in GeneratorPage
   - Update placeholders to be more generic or contextual

2. **Dynamic Defaults**
   - Consider setting defaults based on selected business type
   - Use more generic placeholders that work across business types

### 3. Generic Location Handling

#### Current State
- Location is a simple text input with no context
- No connection between location and business type

#### Options to Consider
1. **Location Templates**
   - Provide suggested locations based on business type
   - E.g., "Various neighborhoods in [City]" for delivery drivers
   - E.g., "Client offices in [City]" for consulting

2. **Location Categories**
   - Offer categories like "Urban", "Suburban", "Rural"
   - Adjust trip patterns based on selected category

3. **Smart Defaults**
   - Set intelligent defaults based on business type
   - Allow customization while providing guidance

#### Implementation Plan
1. **Create Location Templates**
   - Define templates for each business type
   - Add helper function to suggest locations

2. **UI Changes**
   - Add dropdown or suggestions for location field
   - Update placeholder text based on business type

### 4. Maximum Entries Per Day Setting

#### Current State
- The system automatically determines number of trips per day
- No user control over maximum entries per day

#### Implementation Plan
1. **Add New Field**
   - Add maxEntriesPerDay input to MileageForm
   - Add state and handlers in GeneratorPage

2. **Update Algorithm**
   - Modify generateDailyDistribution to respect max entries
   - Ensure business/personal trip ratio is maintained
   - Handle edge cases (e.g., too few entries for miles)

3. **UI Implementation**
   - Add number input with reasonable min/max values
   - Add tooltip explaining the impact of this setting

### 5. Realistic Trip Distances

#### Current State
- Trip distances might not correlate realistically with purposes
- E.g., 100-mile lunch trips are possible but unrealistic

#### Implementation Approach
1. **Purpose-Distance Mapping**
   - Create mapping of purposes to typical distance ranges
   - Example:
     ```typescript
     const PURPOSE_DISTANCE_RANGES = {
       "Client Visit": { min: 5, max: 50, typical: 15 },
       "Business Lunch": { min: 1, max: 15, typical: 5 },
       "Conference": { min: 10, max: 200, typical: 50 },
       // ...
     };
     ```

2. **Business Type Considerations**
   - Different business types have different typical distances
   - Food delivery: shorter trips, more frequent
   - Consulting: medium trips, less frequent
   - Sales: longer trips, varied frequency

3. **Algorithm Updates**
   - First pass: Determine appropriate number of trips based on total miles
   - Second pass: Assign purposes based on business type
   - Third pass: Adjust miles to match realistic ranges for purposes
   - Final pass: Distribute any remaining miles in a realistic way

#### Implementation Plan
1. **Create Distance Mappings**
   - Define typical distance ranges for each purpose
   - Group by business type for context

2. **Update Distribution Algorithm**
   - Modify trip generation to consider purpose-appropriate distances
   - Implement multi-pass approach for realistic distribution
   - Add special handling for edge cases

3. **Testing**
   - Create test cases for different business types and total miles
   - Verify realistic distribution patterns

### Implementation Order
1. Add business type selector (foundational change)
2. Remove default location and purpose (simple change)
3. Add max entries per day setting (moderate change)
4. Implement realistic trip distances (complex change)
5. Handle location in a generic fashion (complex change)

### Technical Considerations
- Need to update interfaces in multiple files
- Need to modify the mileage distribution algorithm
- Need to ensure backward compatibility
- Should add validation for new fields
- Consider adding tooltips or help text for new fields
