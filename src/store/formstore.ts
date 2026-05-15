// ─────────────────────────────────────────────────────────────────────────────
// ZUSTAND STORE  —  Single source of truth for the entire application.
//
// Three concerns are managed here:
//   1. Schema   — the AI-extracted field definitions
//   2. Values   — current user input for every field
//   3. Focus    — which field is active (drives PDF ↔ Form sync)
//
// Using Zustand over Redux / Context because:
//   - No boilerplate (no actions, reducers, providers)
//   - Selector-based subscriptions (only re-renders what changed)
//   - DevTools middleware for debugging
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FieldSchema } from "@/types";

// ── Store shape ───────────────────────────────────────────────────────────────
interface FormStore {
  // ── 1. SCHEMA ──────────────────────────────────────────────────────────────
  /** Full list of AI-extracted fields. Set once on app load. */
  fields: FieldSchema[];
  setFields: (fields: FieldSchema[]) => void;

  // ── 2. FORM STATE ──────────────────────────────────────────────────────────
  /** Current input value for every field, keyed by field.id */
  values: Record<string, string | boolean | number>;
  /** Update a single field's value */
  setFieldValue: (id: string, value: string | boolean | number) => void;
  /** Initialise all values from schema defaultValues */
  initValues: (fields: FieldSchema[]) => void;

  /** Validation error messages, keyed by field.id */
  errors: Record<string, string>;
  setFieldError: (id: string, error: string) => void;
  clearFieldError: (id: string) => void;
  /** Replace all errors at once (used on full-form submit) */
  setErrors: (errors: Record<string, string>) => void;

  // ── 3. FOCUS SYNC ──────────────────────────────────────────────────────────
  /**
   * ID of the currently focused field.
   * When this changes:
   *   - PDFViewer scrolls to the field's PDF position
   *   - HighlightOverlay animates a yellow glow on that field's bounding box
   *   - FormField highlights its input border
   */
  focusedFieldId: string | null;
  setFocusedField: (id: string | null) => void;

  // ── 4. PDF NAVIGATION ──────────────────────────────────────────────────────
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (n: number) => void;

  // ── 5. UTILITIES ───────────────────────────────────────────────────────────
  /** Reset all form values to schema defaults, clear errors and focus */
  resetForm: () => void;
  /** Returns true if ANY field has a validation error */
  hasErrors: () => boolean;
}

// ── Store implementation ──────────────────────────────────────────────────────
export const useFormStore = create<FormStore>()(
  devtools(
    (set, get) => ({
      // ── Schema ───────────────────────────────────────────────────────────
      fields: [],
      setFields: (fields) =>
        set({ fields }, false, "setFields"),

      // ── Values ───────────────────────────────────────────────────────────
      values: {},
      setFieldValue: (id, value) =>
        set(
          (s) => ({ values: { ...s.values, [id]: value } }),
          false,
          "setFieldValue"
        ),
      initValues: (fields) => {
        const values: Record<string, string | boolean | number> = {};
        fields.forEach((f) => (values[f.id] = f.defaultValue));
        set({ values }, false, "initValues");
      },

      // ── Errors ───────────────────────────────────────────────────────────
      errors: {},
      setFieldError: (id, error) =>
        set(
          (s) => ({ errors: { ...s.errors, [id]: error } }),
          false,
          "setFieldError"
        ),
      clearFieldError: (id) =>
        set((s) => {
          const errors = { ...s.errors };
          delete errors[id];
          return { errors };
        }, false, "clearFieldError"),
      setErrors: (errors) =>
        set({ errors }, false, "setErrors"),

      // ── Focus sync ───────────────────────────────────────────────────────
      focusedFieldId: null,
      setFocusedField: (id) =>
        set({ focusedFieldId: id }, false, "setFocusedField"),

      // ── PDF navigation ────────────────────────────────────────────────────
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: (page) =>
        set({ currentPage: page }, false, "setCurrentPage"),
      setTotalPages: (n) =>
        set({ totalPages: n }, false, "setTotalPages"),

      // ── Utilities ─────────────────────────────────────────────────────────
      resetForm: () => {
        const { fields } = get();
        const values: Record<string, string | boolean | number> = {};
        fields.forEach((f) => {
          if (f.type === "checkbox") {
            values[f.id] = typeof f.defaultValue === "boolean" ? f.defaultValue : false;
          } else {
            values[f.id] = f.defaultValue !== undefined && f.defaultValue !== null ? f.defaultValue : "";
          }
        });
        set({ values, errors: {}, focusedFieldId: null }, false, "resetForm");
      },
      hasErrors: () => Object.keys(get().errors).length > 0,
    }),
    { name: "PDFFormStore" } // name shown in Redux DevTools
  )
);
