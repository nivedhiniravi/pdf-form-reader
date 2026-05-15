# 📄 PDF Form Reader

A React-based AI-powered PDF form extraction and interaction tool built for the **Frontend Evaluation — Remote Coding Assignment**.

---

## 🎯 Overview

PDF Form Reader renders a bank-style PDF on the left and dynamically generates a fully functional form on the right — driven by a JSON schema that simulates what a real AI pipeline (GPT-4o Vision, AWS Textract, or Google Document AI) would extract from the scanned document.

The standout feature is **bidirectional synchronisation**: focusing any form field instantly scrolls the PDF to the corresponding region and animates a highlight overlay over the exact bounding box.

---

## ✨ Features

- 📋 **24 fields** dynamically rendered from a JSON schema
- 🔤 **7 field types** — text, number, email, date, tel, checkbox, select
- 🔗 **PDF ↔ Form sync** — focus a field → PDF scrolls + highlights that region
- 🗂️ **Collapsible sections** mirroring the PDF layout
- ✅ **Zod validation** — per-field on blur + full-form on submit
- 🎞️ **Framer Motion animations** — field mount, checkbox, overlay, banners
- 📱 **Responsive** — side-by-side on desktop, tabbed on mobile
- 🔄 **Reset & Submit** — wired end-to-end with status feedback

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript (strict) |
| Build Tool | Vite |
| Styling | TailwindCSS |
| State Management | Zustand |
| Validation | Zod |
| Animations | Framer Motion |
| PDF Rendering | react-pdf |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nivedhiniravi/pdf-form-reader.git
cd pdf-form-reader

# 2. Install dependencies
npm install

# 3. Place the PDF in the public folder
cp your-form.pdf public/sample-form.pdf

# 4. Start the development server
npm run dev
```

App runs at **http://localhost:5173**

### Production Build

```bash
npm run build
npm run preview
```

---

## 🏗️ Project Structure

```
src/
├── App.tsx                  # Root — loads schema, renders two-panel layout
├── components/
│   ├── PDFViewer.tsx        # PDF canvas + highlight overlay orchestrator
│   ├── HighlightOverlay.tsx # Animated bounding-box highlight on focused field
│   ├── DynamicForm.tsx      # Right panel — grouped sections + submit/reset
│   ├── FormSection.tsx      # Memoized collapsible section wrapper
│   ├── FormField.tsx        # Memoized single-field renderer (7 types)
│   └── StatusBanner.tsx     # Animated submit success/error banner
├── store/
│   └── formStore.ts         # Zustand store — schema, values, errors, focus
├── lib/
│   ├── schema.ts            # AI_EXTRACTED_SCHEMA + FORM_SECTIONS
│   └── validation.ts        # buildZodSchema() + validateSingleField()
└── types/
    └── index.ts             # FieldSchema, FormSectionDef, BoundingBox types
```

---

## 🧠 Approach

### Dual-Panel Layout
The app is split into two panels:
- **Left** — PDF rendered via `react-pdf` with percentage-based bounding box overlays
- **Right** — Dynamic form generated entirely from `AI_EXTRACTED_SCHEMA`

### Focus Synchronisation
When a user focuses a form field:
1. `setFocusedField(id)` updates Zustand
2. `PDFViewer` subscribes to `focusedFieldId` — its `useEffect` fires
3. The PDF canvas scrolls to the field's y-position
4. `HighlightOverlay` animates a yellow glow over the exact bounding box
5. On blur → `setFocusedField(null)` → overlay fades out

### Bounding Box Coordinates
All coordinates are **percentage-based** relative to the PDF page — making overlays pixel-perfect at any canvas size or zoom level.

---

## 🗃️ State Management Strategy

**Zustand** was chosen over Redux and React Context for three reasons:

1. **No boilerplate** — single store file, no actions/reducers
2. **Selector isolation** — `useFormStore((s) => s.values[field.id])` means Field A changing never re-renders Field B
3. **DevTools support** — full Redux DevTools integration via middleware

The store manages five concerns: **Schema**, **Values**, **Errors**, **Focus**, and **PDF Navigation**.

---

## 🤖 AI-Based Field Extraction (Production Approach)

In this assignment, extraction is simulated via a manually crafted JSON schema. In production, the pipeline would be:

1. User uploads PDF → backend stores it
2. Each page is rendered to a high-resolution PNG
3. PNG is sent to **GPT-4o Vision** or **Google Document AI FORM_PARSER**
4. AI returns field labels, types, bounding boxes, and pre-filled values
5. Backend normalises coordinates to percentage-based `pdfBounds`
6. React app fetches the schema via REST API and renders dynamically

### AI Services Compared

| Service | Strength |
|---|---|
| GPT-4o Vision | Best semantic understanding of field types |
| AWS Textract | Excellent bounding box accuracy |
| Google Document AI | Native normalised coordinates from FORM_PARSER |
| Azure Form Recognizer | Strong table and checkbox detection |

---

## 📋 Assignment Requirements Checklist

| Requirement | Status |
|---|---|
| PDF Display | ✅ react-pdf with page navigation |
| Dynamic Form (≥5 fields) | ✅ 24 fields from JSON schema |
| Focus Sync | ✅ Zustand → scroll + highlight overlay |
| Field Types (text, number, checkbox) | ✅ 7 types supported |
| State Management | ✅ Zustand with DevTools |
| Zod Validation (Bonus) | ✅ Per-field blur + full-form submit |
| Framer Motion (Bonus) | ✅ 7 components animated |
| UI Polish (Bonus) | ✅ Dark theme, responsive, collapsible sections |

---

## 👤 Author

**Nivedhini Ravi**  
Frontend Evaluation Submission — May 2026
