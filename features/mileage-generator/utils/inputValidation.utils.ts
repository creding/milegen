// features/mileage-generator/utils/inputValidation.utils.ts
import { z } from "zod";

export const mileageGeneratorParamsSchema = z
  .object({
    startDate: z.preprocess(
      (val) =>
        typeof val === "string"
          ? new Date(val)
          : val instanceof Date
          ? val
          : val,
      z.date({ invalid_type_error: "Invalid start date" }).refine(
        (d) => !isNaN(d.getTime()),
        { message: "Invalid start date" }
      )
    ),
    endDate: z.preprocess(
      (val) =>
        typeof val === "string"
          ? new Date(val)
          : val instanceof Date
          ? val
          : val,
      z.date({ invalid_type_error: "Invalid end date" }).refine(
        (d) => !isNaN(d.getTime()),
        { message: "Invalid end date" }
      )
    ),
    startMileage: z
      .preprocess((val) => Number(val), z.number().min(0, { message: "Start mileage cannot be negative" })),
    endMileage: z
      .preprocess((val) => Number(val), z.number().min(0, { message: "End mileage cannot be negative" })),
    totalPersonalMiles: z
      .preprocess((val) => Number(val), z.number().min(0, { message: "Total personal miles cannot be negative" })),
    vehicle: z.string().min(1, { message: "Vehicle information is required" }),
    businessType: z.string().optional(),
    subscriptionStatus: z.string().min(1, { message: "Subscription status is required" }),
    currentEntryCount: z
      .preprocess((val) => (val !== undefined ? Number(val) : undefined), z.number().optional()),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine((data) => data.endMileage > data.startMileage, {
    message: "End mileage must be greater than start mileage",
    path: ["endMileage"],
  })
  .refine(
    (data) => data.totalPersonalMiles <= Number(data.endMileage) - Number(data.startMileage),
    {
      message: "Total personal miles must be between 0 and total mileage",
      path: ["totalPersonalMiles"],
    }
  );
