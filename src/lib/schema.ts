// ─────────────────────────────────────────────────────────────────────────────
// AI-EXTRACTED JSON SCHEMA
//
// Source document: India Post — Post Office Savings Bank
//                  ATM Card / Internet / Mobile / SMS Banking Service Request
//
// In a production system, this object is returned dynamically by:
//   • GPT-4o Vision  — PDF page rendered to PNG → sent to OpenAI API
//   • AWS Textract   — AnalyzeDocument with FORMS feature
//   • Google Doc AI  — FORM_PARSER processor
//
// For this assignment (no API key), every field, value, type, and
// bounding-box coordinate was manually mapped from the scanned form.
//
// BOUNDING BOX FORMAT:
//   All x, y, width, height values are PERCENTAGES of the page dimensions.
//   This ensures overlays are pixel-perfect at any rendered canvas size.
// ─────────────────────────────────────────────────────────────────────────────

import { FieldSchema, FormSectionDef } from "@/types";

export const FORM_TITLE =
  "Post Office Savings Bank — ATM / Internet / Mobile / SMS Banking Request";

// ── Section definitions ───────────────────────────────────────────────────────
// Each section groups fields that fall within a y% range on the PDF.
// The yMin / yMax values were measured from the scanned form layout.
export const FORM_SECTIONS: FormSectionDef[] = [
  { title: "Header Information", icon: " ", yMin: 0,  yMax: 24  },
  { title: "Applicant's Name",   icon: " ", yMin: 24, yMax: 33.8  },
  { title: "ATM Card For",       icon: " ", yMin: 33.8, yMax: 39.8  },
  { title: "Contact Details",    icon: " ", yMin: 39.8, yMax: 50  },
  { title: "Service Requests",   icon: " ", yMin: 50, yMax: 87  },
];

// ── Field schema ─────────────────────────────────────────────────────────────
export const AI_EXTRACTED_SCHEMA: FieldSchema[] = [

  // ── SECTION 1 • Header ─────────────────────────────────────────────────────
  {
    id: "postOffice",
    label: "Post Office",
    type: "text",
    defaultValue: "Delhi GPO",  
    required: true,
    placeholder: "Enter post office name",
    pdfBounds: { page: 1, x: 11.7, y: 18.7, width: 38, height: 2.5 },
  },
  {
    id: "applicationDate",
    label: "Date",
    type: "date",
    defaultValue: "2019-08-01",
    required: true,
    pdfBounds: { page: 1, x: 65, y: 19.8, width: 25, height: 2.5 },
  },
  {
    id: "cifId",
    label: "CIF ID",
    type: "number",
    defaultValue: "321502150",
    required: true,
    placeholder: "8-digit CIF number",
    pdfBounds: { page: 1, x: 12, y: 22.1, width: 36, height: 2.5 },
  },
  {
    id: "primaryAccountId",
    label: "Primary Account ID",
    type: "number",
    defaultValue: "4458312548",
    required: true,
    placeholder: "Account number",
    pdfBounds: { page: 1, x: 49.2, y: 22.1, width: 40, height: 2.5 },
  },

  // ── SECTION 2 • Applicant Name ─────────────────────────────────────────────
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    defaultValue: "RJKultheep",
    required: true,
    placeholder: "First name (block letters)",
    pdfBounds: { page: 1, x: 12, y: 28.4, width: 58, height: 1.5 },
  },
  {
    id: "middleName",
    label: "Middle Name",
    type: "text",
    defaultValue: "",
    required: false,
    placeholder: "Middle name",
    pdfBounds: { page: 1, x: 11.7, y: 30.4, width: 58, height: 1.5 },
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    defaultValue: "",
    required: true,
    placeholder: "Last name (block letters)",
    pdfBounds: { page: 1, x: 11.7, y: 32.4, width: 58, height: 1.5 },
  },

  // ── SECTION 3 • ATM Card For ───────────────────────────────────────────────
  {
    id: "atmCardFor",
    label: "ATM Card Required For",
    type: "select",
    defaultValue: "Self",
    required: true,
    options: ["Self", "Joint 'B' Account Holder", "Not Needed"],
    pdfBounds: { page: 1, x: 12, y: 37.4, width: 80, height: 2.5 },
  },

  // ── SECTION 4 • Contact Details ────────────────────────────────────────────
  {
    id: "mobileNumber",
    label: "Mobile Number",
    type: "tel",
    defaultValue: "6378451260",
    required: true,
    placeholder: "10-digit mobile number",
    pdfBounds: { page: 1, x: 11.2, y: 43.2, width: 41 , height: 2 },
  },
  {
    id: "panNumber",
    label: "PAN Number",
    type: "text",
    defaultValue: "FTFBS12GM",
    required: true,
    placeholder: "e.g. ABCDE1234F",
    pdfBounds: { page: 1, x: 54, y: 43.5, width: 38, height: 2 },
  },
  {
    id: "emailId",
    label: "Email ID",
    type: "email",
    defaultValue: "kultheepr@gmail.com",
    required: true,
    placeholder: "your@email.com",
    pdfBounds: { page: 1, x: 11.2, y: 45.8, width: 70, height: 1.5  },
  },
  {
    id: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    defaultValue: "1976-03-06",
    required: true,
    pdfBounds: { page: 1, x: 11.2, y: 47.5, width: 50, height: 2 },
  },
  {
    id: "mothersMaidenName",
    label: "Mother's Maiden Name",
    type: "text",
    defaultValue: "Rejina",
    required: true,
    placeholder: "Mother's maiden name",
    pdfBounds: { page: 1, x: 53.3, y: 47.9, width: 38, height: 1.5 },
  },

  // ── SECTION 5 • Service Request Checkboxes ─────────────────────────────────
  {
    id: "reqInstantAtm",
    label: "Instant ATM Card",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 57, width: 6, height: 2.5 },
  },
  {
    id: "reqNewPersonalisedAtm",
    label: "New Personalised ATM Card",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 86, y: 60, width: 3, height: 2.5 },
  },
  {
    id: "reqReplacedPersonalisedAtm",
    label: "Replaced Personalised ATM Card",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 86, y: 63.2, width: 3, height: 2.5 },
  },
  {
    id: "reqReplacementWithInstant",
    label: "Replacement with Instant ATM Card",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 66.4, width: 6, height: 2.5 },
  },
  {
    id: "reqAtmPin",
    label: "ATM Card PIN Request",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 72.4, width: 6, height: 2.5 },
  },
   {
    id: "reqAtmCardHotList",
    label: "ATM Card Hold List Request",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 69.5, width: 6, height: 2 },
  },
  {
    id: "reqInternetAndMobile",
    label: "Internet Banking and Mobile Banking",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 75.8, width: 6, height: 2 },
  },
  {
    id: "reqInternetBanking",
    label: "Internet Banking",
    type: "checkbox",
    defaultValue: true,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 78.5, width: 6, height: 2 },
  },
  {
    id: "reqSmsBanking",
    label: "SMS Banking",
    type: "checkbox",
    defaultValue: false,
    required: false,
    pdfBounds: { page: 1, x: 77, y: 81, width: 6, height: 2 },
  },

  // ── SECTION 6 • Linked Accounts ────────────────────────────────────────────
  {
    id: "linkedAccount1",
    label: "Linked SB Account ID — 1",
    type: "number",
    defaultValue: "",
    required: false,
    placeholder: "Secondary account number",
    pdfBounds: { page: 1, x: 63.6, y: 84.8, width: 22, height: 1 },
  },
  {
    id: "linkedAccount2",
    label: "Linked SB Account ID — 2",
    type: "number",
    defaultValue: "",
    required: false,
    placeholder: "Secondary account number",
    pdfBounds: { page: 1, x: 63.6, y: 86.1, width: 22, height: 1 },
  },
];
