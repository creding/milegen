# Mobile Optimization Plan for MileageForm and MileageLogView Components

## Scope Limitations
- **Only modify**: `MileageForm.tsx` and `MileageLogView.tsx`
- **Do not touch**: Any other components, including the generator page
- **Maintain SSR compatibility**: Ensure all changes work with Next.js Server-Side Rendering

## MileageForm.tsx Improvements

### 1. Responsive Layout Adjustments
- Convert `Group grow` containers to responsive layouts using `Stack` for mobile and `Group` for larger screens
- Use Mantine's responsive props system for conditional rendering based on screen size
- Implement the `useMediaQuery` hook from Mantine to conditionally render different layouts

### 2. Form Controls Optimization
- Increase touch target sizes for mobile users (buttons, inputs)
- Adjust spacing between form elements for better mobile ergonomics
- Use full width inputs on smaller screens

### 3. Date Picker Improvements
- Ensure date pickers are mobile-friendly with larger touch targets
- Consider a more compact date input for mobile screens

### 4. Alert Component
- Make the subscription alert more compact on mobile
- Ensure the upgrade button is appropriately sized for touch

## MileageLogView.tsx Improvements

### 1. Responsive Table
- Implement a card-based view for mobile screens instead of the traditional table
- Each entry becomes a card with labeled data points
- Use Mantine's `ScrollArea` for horizontal scrolling on smaller screens when needed

### 2. Summary Section
- Convert the grid layout to a stack layout on mobile
- Ensure text and numbers are properly sized for mobile viewing

### 3. Data Presentation
- Prioritize essential information on mobile views
- Consider collapsible sections for less critical data

## Implementation Approach

### Responsive Utilities
- Use Mantine's built-in responsive props (`hiddenFrom`, `visibleFrom`)
- Leverage CSS media queries where appropriate
- Implement conditional rendering based on screen size

### Testing Strategy
- Test on various mobile device sizes
- Ensure touch targets meet accessibility standards (minimum 44×44px)
- Verify that all functionality works correctly on both mobile and desktop

### Performance Considerations
- Minimize layout shifts during rendering
- Ensure efficient re-renders when screen size changes
- Keep bundle size minimal by using Mantine's built-in responsive features

## Next Steps
1. Implement responsive layout in MileageForm.tsx
2. Create mobile-friendly view for MileageLogView.tsx
3. Test on various device sizes
4. Refine touch interactions and spacing
