// ─────────────────────────────────────────────────────────────────────────────
// TYPES  —  Central type definitions used across the entire application.
// All components, the store, and the schema reference these types.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every supported HTML input type that the dynamic form can render.
 * Driven by the AI-extracted JSON schema — no hardcoding needed.
 */
export type FieldType =
  | "text"      // free-text inputs (names, addresses)
  | "number"    // purely numeric (account IDs, CIF numbers)
  | "email"     // email address — validated by Zod + browser
  | "date"      // date picker — value stored as YYYY-MM-DD
  | "tel"       // phone / mobile numbers
  | "checkbox"  // boolean tick box
  | "select";   // dropdown — requires `options` array

/**
 * Bounding box of a detected field on a specific PDF page.
 *
 * ALL values are PERCENTAGES (0–100) of the page's rendered dimensions.
 * Using percentages (instead of pixels) means the overlay is correct
 * at any zoom level or screen resolution — no recalculation needed.
 *
 * How AI models produce these:
 *  - GPT-4o Vision   → estimated from visual position in image
 *  - AWS Textract    → BoundingBox (0–1 fractions) × 100
 *  - Google Doc AI   → NormalizedVertices × 100
 */
export interface PDFBounds {
  page: number;    // 1-indexed PDF page number
  x: number;       // left edge as % of page width
  y: number;       // top edge as % of page height
  width: number;   // field width as % of page width
  height: number;  // field height as % of page height
}

/**
 * One field in the AI-extracted JSON schema.
 *
 * This is the single unit of data that flows through the entire app:
 *   AI extraction → schema.ts → Zustand store → DynamicForm → FormField
 *                                             → PDFViewer → HighlightOverlay
 */
export interface FieldSchema {
  id: string;                                // unique camelCase identifier
  label: string;                             // display label in the form
  type: FieldType;                           // determines which input to render
  defaultValue: string | boolean | number;   // pre-filled value from the PDF
  required: boolean;                         // drives Zod validation
  placeholder?: string;                      // hint text for empty inputs
  options?: string[];                        // required when type === "select"
  pdfBounds: PDFBounds;                      // position on the PDF page
}

/**
 * Logical grouping of fields into form sections.
 * Sections mirror the visual sections of the PDF form.
 */
export interface FormSectionDef {
  title: string;
  icon: string;
  yMin: number;   // minimum y% — fields with y >= yMin belong here
  yMax: number;   // maximum y% — fields with y < yMax belong here
}
