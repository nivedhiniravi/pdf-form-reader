
// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD  —  Renders a single input control from a FieldSchema.
//
// Supports: text | number | email | date | tel | checkbox | select
//
// Interaction flow:
//   onFocus  → setFocusedField(id)  → PDF scrolls + highlights that region
//   onChange → setFieldValue(id, v) → Zustand stores new value
//   onBlur   → validateSingleField  → Zod error shown below if invalid
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { motion } from "framer-motion";
import { FieldSchema } from "@/types";
import { useFormStore } from "@/store/formStore";
import { validateSingleField } from "@/lib/validation";

interface Props {
  field: FieldSchema;
}

export const FormField = memo(function FormField({ field }: Props) {
  // Subscribe only to the slices of state this field needs
  // → prevents re-render when other fields change
  const value    = useFormStore((s) => s.values[field.id]);
  const error    = useFormStore((s) => s.errors[field.id]);
  const isFocused = useFormStore((s) => s.focusedFieldId === field.id);

  const setFieldValue  = useFormStore((s) => s.setFieldValue);
  const setFieldError  = useFormStore((s) => s.setFieldError);
  const clearFieldError = useFormStore((s) => s.clearFieldError);
  const setFocusedField = useFormStore((s) => s.setFocusedField);

  // ── Event handlers ───────────────────────────────────────────────────────
  const handleFocus = () => setFocusedField(field.id);

  const handleBlur = () => {
    setFocusedField(null);
    // Validate on blur using dynamically built Zod schema
    const err = validateSingleField(field, value);
    if (err) setFieldError(field.id, err);
    else     clearFieldError(field.id);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newValue =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;
    setFieldValue(field.id, newValue);
    clearFieldError(field.id); // clear error immediately on change
  };

  // ── Shared input class string ─────────────────────────────────────────────
  const inputCls = [
    "w-full rounded-lg border px-3 py-2 text-sm bg-gray-800 text-white",
    "placeholder-gray-500 outline-none transition-all duration-200",
    isFocused
      ? "border-yellow-400 ring-2 ring-yellow-400/25 shadow-[0_0_10px_rgba(255,230,0,0.18)]"
      : "border-gray-600 hover:border-gray-500 focus:border-yellow-400",
    error
      ? "!border-red-500 ring-1 ring-red-500/30"
      : "",
  ].filter(Boolean).join(" ");

  // ── Render correct control type ───────────────────────────────────────────
  const renderControl = () => {

    // CHECKBOX
    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 cursor-pointer group mt-1" htmlFor={field.id}>
          {/* Hidden native checkbox + custom styled box */}
          <div className="relative shrink-0">
            <input
              id={field.id}
              type="checkbox"
              checked={!!value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="sr-only peer"
            />
            <motion.div
              animate={{
                backgroundColor: value ? "#FFE600" : "transparent",
                borderColor:     value ? "#FFE600" : isFocused ? "#FFE600" : "#6b7280",
              }}
              transition={{ duration: 0.15 }}
              className={[
                "w-5 h-5 rounded border-2 flex items-center justify-center transition-shadow",
                isFocused ? "ring-2 ring-yellow-400/30" : "",
                "group-hover:border-gray-300",
              ].join(" ")}
            >
              {/* Animated checkmark */}
              {value && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="w-3 h-3 text-gray-900"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </motion.div>
          </div>
          <span className="text-sm text-gray-300 select-none leading-tight">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </span>
        </label>
      );
    }

    // SELECT / DROPDOWN
    if (field.type === "select" && field.options) {
      return (
        <select
          id={field.id}
          value={String(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputCls + " appearance-none cursor-pointer"}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt} className="bg-gray-800">
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // ALL TEXT-STYLE INPUTS: text, number, email, date, tel
    return (
      <input
        id={field.id}
        type={field.type}
        value={String(value ?? "")}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        className={inputCls}
        autoComplete="off"
        spellCheck={false}
      />
    );
  };

  // ── Wrapper ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={[
        "rounded-xl p-3 transition-colors duration-200",
        isFocused
          ? "bg-gray-700/60 shadow-md ring-1 ring-yellow-400/10"
          : "bg-gray-800/30 hover:bg-gray-800/50",
      ].join(" ")}
    >
      {/* Label — shown above the input for all types except checkbox */}
      {field.type !== "checkbox" && (
        <label
          htmlFor={field.id}
          className="block text-xs font-medium text-gray-400 mb-1.5 leading-none"
        >
          {field.label}
          {field.required && (
            <span className="text-red-400 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {renderControl()}

      {/* Zod validation error — animated in/out */}
      <AnimatedError message={error} />
    </motion.div>
  );
});

// ── Animated error message ────────────────────────────────────────────────────
function AnimatedError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: 6 }}
      exit={{ opacity: 0, height: 0 }}
      className="text-xs text-red-400 flex items-center gap-1"
    >
      <span aria-hidden> </span> {message}
    </motion.p>
  );
}
