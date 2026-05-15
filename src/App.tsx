
// ─────────────────────────────────────────────────────────────────────────────
// APP  —  Root component
//
// Responsibilities:
//   1. Load the AI-extracted JSON schema into Zustand on mount
//   2. Render the two-panel layout (PDF left, Form right)
//   3. Handle responsive layout:
//        Desktop (≥768px) → side-by-side 50/50
//        Mobile  (<768px) → tabbed with PDF / Form switcher
//
// The PDF ↔ Form sync is automatic — it flows through Zustand:
//   FormField.onFocus → setFocusedField → PDFViewer.useEffect → scroll + highlight
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { PDFViewer } from "./components/PDFViewer";
import { DynamicForm } from "./components/DynamicForm";
import { useFormStore } from "./store/formStore";
import { AI_EXTRACTED_SCHEMA, FORM_TITLE } from "./lib/schema";

const PDF_URL = "/sample-form.pdf";

type Tab = "form" | "pdf";

export default function App() {
  const { setFields, initValues } = useFormStore();

  // Mobile-only tab state
  const [activeTab, setActiveTab] = useState<Tab>("form");

  // Load schema into global store once on mount
  useEffect(() => {
    setFields(AI_EXTRACTED_SCHEMA);
    initValues(AI_EXTRACTED_SCHEMA);
  }, [setFields, initValues]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── App header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-2.5
                         bg-gray-900 border-b border-gray-800 shrink-0 z-10">

        <div className="w-7 h-7 bg-yellow-400 rounded flex items-center
                        justify-center shrink-0 shadow-md shadow-yellow-400/20">
          <span className="text-gray-900 text-xs font-black tracking-tighter">C0</span>
        </div>

        <h1 className="font-bold text-sm tracking-wide text-white">
          PDF Form Reader
        </h1>

        {/* Field count pill */}
        <span className="hidden sm:inline text-xs bg-gray-800 text-gray-400
                         px-2 py-0.5 rounded-full border border-gray-700">
          {AI_EXTRACTED_SCHEMA.length} fields • 7 types
        </span>

        {/* Hint text — desktop only */}
        <p className="ml-auto text-xs text-gray-600 hidden lg:block">
           Focus any field to see it highlighted on the PDF
        </p>
      </header>

      {/* ── Mobile tab switcher (hidden on md+) ──────────────────────────── */}
      <div className="flex md:hidden border-b border-gray-800 bg-gray-900 shrink-0">
        {(["form", "pdf"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "flex-1 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-gray-200",
            ].join(" ")}
          >
            {tab === "pdf" ? "  PDF Viewer" : "  Fill Form"}
          </button>
        ))}
      </div>

      {/* ── Two-panel body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — PDF Viewer
            Desktop: always visible, half width
            Mobile:  visible only when activeTab === "pdf" */}
        <div className={[
          "overflow-hidden",
          "md:block md:w-1/2 md:border-r md:border-gray-800",
          activeTab === "pdf" ? "flex-1 w-full" : "hidden",
        ].join(" ")}>
          <PDFViewer pdfUrl={PDF_URL} fields={AI_EXTRACTED_SCHEMA} />
        </div>

        {/* RIGHT — Dynamic Form
            Desktop: always visible, half width
            Mobile:  visible only when activeTab === "form" */}
        <div className={[
          "overflow-hidden",
          "md:block md:w-1/2",
          activeTab === "form" ? "flex-1 w-full" : "hidden",
        ].join(" ")}>
          <DynamicForm fields={AI_EXTRACTED_SCHEMA} formTitle={FORM_TITLE} />
        </div>

      </div>
    </div>
  );
}
