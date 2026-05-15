
// ─────────────────────────────────────────────────────────────────────────────
// FORM SECTION  —  Collapsible group of related fields.
//
// Extracted into its own memoized component so that:
//   - Sections only re-render when their own fields change
//   - Toggling one section doesn't re-render sibling sections
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "./FormField";
import { FieldSchema } from "@/types";

interface Props {
  title: string;
  icon: string;
  fields: FieldSchema[];
  isOpen: boolean;
  onToggle: () => void;
}

export const FormSection = memo(function FormSection({
  title,
  icon,
  fields,
  isOpen,
  onToggle,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5
                   bg-gray-900 hover:bg-gray-800/80 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <span>{icon}</span>
          <span>{title}</span>
          {/* Field count badge */}
          <span className="text-xs font-normal text-gray-500 bg-gray-800
                           px-1.5 py-0.5 rounded-full border border-gray-700">
            {fields.length}
          </span>
        </span>

        {/* Animated chevron */}
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500 text-xs shrink-0 ml-2"
        >
           
        </motion.span>
      </button>

      {/* ── Collapsible field list ──────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 bg-gray-950">
              {fields.map((field) => (
                <FormField key={field.id} field={field} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
