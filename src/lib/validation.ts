import { z } from "zod";
import { FieldSchema } from "@/types";

/**
 * Dynamically builds a Zod schema from FieldSchema array.
 * Works for both full-form submit and single-field blur validation.
 */
export function buildZodSchema(fields: FieldSchema[]): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.id] = buildFieldSchema(field);
  }
  return z.object(shape);
}

function buildFieldSchema(field: FieldSchema): z.ZodTypeAny {
  const { required, label, type } = field;

  switch (type) {

    case "checkbox":
      // Checkbox is always boolean — never needs required check
      return z.boolean();

    case "number":
      // FIX: Input values are always strings. Use string → transform → number.
      // This avoids the required_error + preprocess incompatibility.
      if (required) {
        return z
          .string({ required_error: `${label} is required` })
          .min(1, `${label} is required`)
          .refine((v) => !isNaN(Number(v)), {
            message: `${label} must be a valid number`,
          })
          .transform((v) => Number(v));
      }
      return z
        .string()
        .optional()
        .transform((v) =>
          v === "" || v === undefined ? undefined : Number(v)
        );

    case "email":
      if (required) {
        return z
          .string()
          .min(1, `${label} is required`)
          .email("Please enter a valid email address");
      }
      return z
        .string()
        .optional()
        .refine((v) => !v || z.string().email().safeParse(v).success, {
          message: "Please enter a valid email address",
        });

    case "tel":
      if (required) {
        return z
          .string()
          .min(1, `${label} is required`)
          .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number");
      }
      return z.string().optional();

    case "date":
      if (required) {
        return z.string().min(1, `${label} is required`);
      }
      return z.string().optional();

    case "text":
    case "select":
    default:
      if (required) {
        return z.string().min(1, `${label} is required`);
      }
      return z.string().optional();
  }
}

/**
 * Validates a single field value on blur.
 * Returns error string or null.
 */
export function validateSingleField(
  field: FieldSchema,
  value: unknown
): string | null {
  const schema = buildZodSchema([field]);
  const result = schema.safeParse({ [field.id]: value });

  if (!result.success) {
    // FIX: use optional chaining to avoid "possibly undefined" TS error
    return result.error?.errors?.[0]?.message ?? "Invalid value";
  }
  return null;
}

