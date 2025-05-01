import { describe, it, expect } from 'vitest';
import { mileageGeneratorParamsSchema } from '../features/mileage-generator/utils/inputValidation.utils';

const validInput = {
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  startMileage: 0,
  endMileage: 100,
  totalPersonalMiles: 50,
  vehicle: 'Car',
  businessType: 'Business',
  subscriptionStatus: 'active',
  currentEntryCount: 0,
};

describe('mileageGeneratorParamsSchema', () => {
  it('parses valid input successfully', () => {
    const result = mileageGeneratorParamsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('fails when endDate is before startDate', () => {
    const invalid = { ...validInput, startDate: new Date('2025-02-01'), endDate: new Date('2025-01-01') };
    const result = mileageGeneratorParamsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === 'endDate' && issue.message === 'End date must be after start date'
        )
      ).toBe(true);
    }
  });

  it('fails when endMileage is less than startMileage', () => {
    const invalid = { ...validInput, startMileage: 100, endMileage: 50 };
    const result = mileageGeneratorParamsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === 'endMileage' && issue.message === 'End mileage must be greater than start mileage'
        )
      ).toBe(true);
    }
  });

  it('fails when totalPersonalMiles exceeds actual mileage', () => {
    const invalid = { ...validInput, totalPersonalMiles: 200 };
    const result = mileageGeneratorParamsSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === 'totalPersonalMiles' && issue.message === 'Total personal miles must be between 0 and total mileage'
        )
      ).toBe(true);
    }
  });
});
