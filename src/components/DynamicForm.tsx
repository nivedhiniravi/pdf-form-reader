
// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC FORM  —  Right panel
//
// Renders the complete form from the AI-extracted JSON schema.
// Fields are grouped into collapsible sections that mirror the PDF layout.
//
// State management:
//   - All form values, errors, and focus live in Zustand (not local state)
//   - Local state is only used for UI-only concerns: open sections, submit status
//
// Performance:
//   - FormSection is memoized → only re-renders its own changed fields
//   - useCallback prevents new function references on every render
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { FormSection } from "./FormSection";
import { StatusBanner } from "./StatusBanner";
import { useFormStore } from "@/store/formStore";
import { buildZodSchema } from "@/lib/validation";
import { FieldSchema } from "@/types";
import { FORM_SECTIONS } from "@/lib/schema";

interface Props {
  fields: FieldSchema[];
  formTitle: string;
}

type SubmitStatus = "idle" | "success" | "error";

export function DynamicForm({ fields, formTitle }: Props) {
  const { values, setErrors, resetForm, initValues } = useFormStore();

  // UI-only state — section open/closed and submit feedback
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(FORM_SECTIONS.map((s) => [s.title, true]))
  );
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  // ── Build grouped sections from schema + section definitions ─────────────
  const grouped = FORM_SECTIONS.map((sec) => ({
    ...sec,
    fields: fields.filter(
      (f) => f.pdfBounds.y >= sec.yMin && f.pdfBounds.y < sec.yMax
    ),
  })).filter((sec) => sec.fields.length > 0);

  // ── Toggle a section open/closed ─────────────────────────────────────────
  const toggleSection = useCallback((title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  // ── Full form submit with Zod validation ──────────────────────────────────
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const schema = buildZodSchema(fields);
      const result = schema.safeParse(values);

      if (!result.success) {
        const errors: Record<string, string> = {};
        const zodErrors = result.error?.errors ?? [];

        zodErrors.forEach((err) => {
          const fieldId = String(err.path?.[0] ?? "");
          if (fieldId) errors[fieldId] = err.message;
        });

        setErrors(errors);
        setSubmitStatus("error");

        const errorIds = new Set(Object.keys(errors));
        setOpenSections((prev) => {
          const next = { ...prev };
          grouped?.forEach((sec) => {
            if (sec.fields.some((f) => errorIds.has(f.id))) {
              next[sec.title] = true;
            }
          });
          return next;
        });
        return;
      }

      console.log("  Form submitted successfully:", result.data);
      setSubmitStatus("success");
    },
    [fields, values, setErrors, grouped]
  );

  // ── Reset handler ─────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {

    const storeState = useFormStore.getState();
    console.log("fields in store:", storeState.fields.length);
    console.log("values before reset:", storeState.values);
    
    resetForm();
    
    console.log("values after reset:", useFormStore.getState().values);
    
    setOpenSections(
      Object.fromEntries(FORM_SECTIONS.map((s) => [s.title, true]))
    );
    setSubmitStatus("idle");
  }, [resetForm]);

  return (
    <div className="flex flex-col h-full bg-gray-950">

      {/* ── Panel header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-snug truncate">
              {formTitle}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
               AI-Simulated Schema &nbsp;•&nbsp; {fields.length} fields detected
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 text-xs text-gray-400 hover:text-yellow-400
                       px-2.5 py-1 rounded-lg border border-gray-700
                       hover:border-yellow-500 transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* ── Scrollable form body ─────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate  /* We handle validation ourselves via Zod */
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {/* Render each section */}
        {grouped.map((sec) => (
          <FormSection
            key={sec.title}
            title={sec.title}
            icon={sec.icon}
            fields={sec.fields}
            isOpen={!!openSections[sec.title]}
            onToggle={() => toggleSection(sec.title)}
          />
        ))}

        {/* ── Submit button ─────────────────────────────────────────────── */}
        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-xl bg-yellow-400 hover:bg-yellow-300
                     active:scale-95 text-gray-900 font-bold text-sm
                     transition-all duration-150 shadow-lg
                     shadow-yellow-400/10 hover:shadow-yellow-400/20"
        >
          Submit Application
        </button>

        {/* ── Status feedback banner ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {submitStatus !== "idle" && (
            <StatusBanner key={submitStatus} status={submitStatus} />
          )}
        </AnimatePresence>

        {/* Bottom padding so last field isn't hidden behind mobile nav */}
        <div className="h-4" />
      </form>
    </div>
  );
}
