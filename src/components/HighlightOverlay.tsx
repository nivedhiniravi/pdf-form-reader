// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT OVERLAY
//
// Transparent div placed directly on top of the PDF page canvas.
// Renders a bounding box for every detected field.
//
// Visual states:
//   • All fields (idle)  → subtle blue outline — shows detected regions
//   • Focused field      → bright yellow glow + animated pulse ring
//
// Coordinates use percentages so the overlay is accurate at any canvas size.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import { FieldSchema } from "../types";
import { useFormStore } from "../store/formStore";

interface Props {
  fields: FieldSchema[];
  /** The PDF page number this overlay is placed on (1-indexed) */
  page: number;
}

export const HighlightOverlay = memo(function HighlightOverlay({ fields, page }: Props) {
  const focusedFieldId = useFormStore((s) => s.focusedFieldId);

  // Only render boxes for fields that appear on this page
  const pageFields = fields.filter((f) => f.pdfBounds.page === page);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      data-testid="highlight-overlay"
    >
      {pageFields.map((field) => {
        const { x, y, width, height } = field.pdfBounds;
        const isFocused = field.id === focusedFieldId;

        return (
          <AnimatePresence key={field.id}>

            {/* ── Main highlight box ─────────────────────────────────────── */}
            <motion.div
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
                borderRadius: 3,
              }}
              animate={{
                backgroundColor: isFocused
                  ? "rgba(255, 230, 0, 0.18)"
                  : "rgba(59, 130, 246, 0.04)",
                boxShadow: isFocused
                  ? "0 0 0 2px #FFE600, 0 0 14px 4px rgba(255,230,0,0.35)"
                  : "0 0 0 1.5px rgba(59,130,246,0.50)",
              }}
              transition={{ duration: 0.18 }}
            />

            {/* ── Pulse ring (only when focused) ────────────────────────── */}
            {isFocused && (
              <motion.div
                key={`${field.id}-pulse`}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  border: "2px solid #FFE600",
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut" }}
              />
            )}

          </AnimatePresence>
        );
      })}
    </div>
  );
});