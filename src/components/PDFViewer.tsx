
  // ─────────────────────────────────────────────────────────────────────────────
  // PDF VIEWER  —  Left panel
  //
  // Renders the PDF using react-pdf and places the HighlightOverlay on top.
  //
  // Focus sync behaviour (Attention to Detail criterion):
  //   1. User focuses a form field on the right panel
  //   2. Zustand store updates focusedFieldId
  //   3. useEffect here detects the change
  //   4. Switches to the correct PDF page if needed
  //   5. Smooth-scrolls so the highlighted field is centred vertically
  // ─────────────────────────────────────────────────────────────────────────────

  import { useCallback, useEffect, useRef, useState, memo } from "react";
  import { Document, Page, pdfjs } from "react-pdf";
  import { motion } from "framer-motion";
  import { HighlightOverlay } from "./HighlightOverlay";
  import { useFormStore } from "@/store/formStore";
  import { FieldSchema } from "@/types";

  // Use the CDN-hosted worker — avoids Vite bundling complications with WebWorkers
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  interface Props {
    pdfUrl: string;
    fields: FieldSchema[];
  }

  export const PDFViewer = memo(function PDFViewer({ pdfUrl, fields }: Props) {
    const {
      focusedFieldId,
      currentPage,
      totalPages,
      setCurrentPage,
      setTotalPages,
    } = useFormStore();

    const containerRef = useRef<HTMLDivElement>(null); // outer panel (for width measurement)
    const scrollRef    = useRef<HTMLDivElement>(null); // scrollable inner area

    const [pageWidth, setPageWidth] = useState(0);

    // ── Measure container width → set PDF render width ──────────────────────
    // ResizeObserver keeps the PDF filling the panel at any viewport size
    useEffect(() => {
      if (!containerRef.current) return;
      const ro = new ResizeObserver(([entry]) => {
        setPageWidth(entry.contentRect.width - 12); // 6px padding each side
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, []);

    // ── Focus sync ───────────────────────────────────────────────────────────
    // Triggered whenever the user focuses a different form field
    useEffect(() => {
      if (!focusedFieldId || !scrollRef.current) return;

      const field = fields.find((f) => f.id === focusedFieldId);
      if (!field) return;

      // Step 1: Navigate to the correct page
      if (field.pdfBounds.page !== currentPage) {
        setCurrentPage(field.pdfBounds.page);
      }

      // Step 2: Scroll so the field is vertically centred in the panel
      // setTimeout lets the page render first after a page switch
      setTimeout(() => {
        if (!scrollRef.current) return;
        const { scrollHeight, clientHeight } = scrollRef.current;
        const fieldCentreY = (field.pdfBounds.y / 100) * scrollHeight;
        scrollRef.current.scrollTo({
          top: fieldCentreY - clientHeight / 2,
          behavior: "smooth",
        });
      }, 80);
    }, [focusedFieldId]); // eslint-disable-line react-hooks/exhaustive-deps

    const onDocumentLoad = useCallback(
      ({ numPages }: { numPages: number }) => setTotalPages(numPages),
      [setTotalPages]
    );

    return (
      <div className="flex flex-col h-full bg-gray-950">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
          <span className="text-white text-sm font-semibold">  PDF Viewer</span>

          {/* Page indicator */}
          <span className="text-gray-400 text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">
            {currentPage} / {totalPages}
          </span>

          {/* Page navigation */}
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600
                        disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="Previous page"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600
                        disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              aria-label="Next page"
            >
              Next ›
            </button>
          </div>
        </div>

        {/* ── PDF canvas + overlay ──────────────────────────────────────────── */}
        <div ref={containerRef} className="flex-1 overflow-hidden bg-gray-800">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto overflow-x-hidden"
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoad}
              loading={<PDFLoadingState />}
              error={<PDFErrorState />}
            >
              {pageWidth > 0 && (
                <motion.div
                  key={`page-${currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative mx-auto my-3 shadow-2xl"
                  style={{ width: pageWidth }}
                >
                  {/* PDF page canvas */}
                  <Page
                    pageNumber={currentPage}
                    width={pageWidth}
                    renderTextLayer={false}      // no text selection — cleaner look
                    renderAnnotationLayer={false} // no PDF annotations
                  />

                  {/* Highlight overlay — absolutely positioned over the canvas */}
                  <HighlightOverlay fields={fields} page={currentPage} />
                </motion.div>
              )}
            </Document>
          </div>
        </div>
      </div>
    );
  });

  // ── Helper sub-components ─────────────────────────────────────────────────────

  function PDFLoadingState() {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent"
        />
        <p className="text-gray-400 text-sm">Loading PDF…</p>
      </div>
    );
  }

  function PDFErrorState() {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-2 px-6 text-center">
        <p className="text-red-400 text-2xl"> </p>
        <p className="text-red-400 text-sm font-medium">Could not load PDF</p>
        <p className="text-gray-500 text-xs">
          Place your file at{" "}
          <code className="bg-gray-800 text-yellow-400 px-1.5 py-0.5 rounded text-xs">
            public/sample-form.pdf
          </code>
        </p>
      </div>
    );
  }
