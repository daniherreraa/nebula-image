// app/components/machine/views/preview.tsx
"use client";
import { useState } from "react";
import { useModel } from "@/app/context";
import TablePreview from "../tablepreview";
import StatusBar from "@/components/machine/statusbar";
import CorrelationPanel from "@/components/machine/correlationpanel";
import NumericVariableStats from "../numericvariablestats";
import CategoricalVariableStats from "../categoricalvariablestats";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Preview = () => {
  const { dataset, setCurrentView } = useModel();
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  if (!dataset) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-woodsmoke-400">No dataset available</p>
      </div>
    );
  }

  // Determine if selected column is numeric or categorical
  const getColumnType = (columnName: string): 'numeric' | 'categorical' => {
    if (!dataset.preview || dataset.preview.length === 0) return 'categorical';

    const columnData = dataset.preview.map(row => row[columnName]).filter(val => val !== null && val !== undefined);
    if (columnData.length === 0) return 'categorical';

    // Check if most values are numbers
    const numericCount = columnData.filter(val => typeof val === 'number').length;
    return numericCount > columnData.length * 0.5 ? 'numeric' : 'categorical';
  };

  const handleColumnClick = (columnName: string) => {
    setSelectedColumn(columnName);
  };

  const getColumnData = (columnName: string) => {
    return dataset.preview.map(row => row[columnName]);
  };

  // Get column summary from backend data
  const getColumnSummary = (columnName: string) => {
    if (!dataset.data_summary?.columns_summary) return undefined;
    return dataset.data_summary.columns_summary.find(
      (col) => col.column === columnName
    );
  };

  return (
    <>
      {/* Title with Step Number */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-portage-400 font-tanker text-3xl md:text-4xl opacity-60">01</span>
        <h2 className="text-portage-300 font-space-grotesk text-base md:text-lg uppercase tracking-[0.2em]">
          Data Previsualization
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 via-portage-400/30 to-transparent" />
      </div>

      <StatusBar
        filename={dataset.filename}
        rows={dataset.rows}
        columns={dataset.columns}
      />

      <div className="mt-2 flex flex-col lg:h-[46vh] lg:flex-row gap-4 overflow-hidden relative">
        <div className="w-full lg:w-[60%] flex relative">
          <TablePreview
            column_names={dataset.column_names}
            preview_data={dataset.preview}
            onColumnClick={handleColumnClick}
            selectedColumn={selectedColumn || undefined}
          />

          {/* Stats Overlay */}
          <AnimatePresence>
            {selectedColumn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 z-10 overflow-auto hextech-scroll"
              >
                {/* Overlay background with Hextech styling */}
                <div className="relative min-h-full bg-gradient-to-r from-woodsmoke-950/98 via-woodsmoke-950/99 to-woodsmoke-950/98 backdrop-blur-md border border-portage-500/30">
                  {/* Hextech glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-portage-500/10 via-portage-400/20 to-portage-500/10 pointer-events-none" />

                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/60 to-transparent" />

                  <div className="relative p-4 md:p-6 space-y-4">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setSelectedColumn(null)}
                        className="relative group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/30 hover:border-portage-400/60 transition-all duration-300"
                      >
                        {/* Hextech corners */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <ArrowLeft className="relative w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
                        <span className="relative text-portage-300 font-space-grotesk text-sm group-hover:text-portage-200 transition-colors">
                          Back to Table
                        </span>
                      </button>

                      <div className="flex items-center gap-3 flex-1">
                        <h2 className="text-portage-300 font-tanker text-lg md:text-xl tracking-normal">
                          Variable Details
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-portage-500/50 to-transparent" />
                      </div>
                    </div>

                    {/* Stats Component */}
                    {getColumnType(selectedColumn) === "numeric" ? (
                      <NumericVariableStats
                        variableName={selectedColumn}
                        data={getColumnData(selectedColumn)}
                        columnSummary={getColumnSummary(selectedColumn)}
                      />
                    ) : (
                      <CategoricalVariableStats
                        variableName={selectedColumn}
                        data={getColumnData(selectedColumn)}
                        columnSummary={getColumnSummary(selectedColumn)}
                      />
                    )}
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-[40%] lg:sticky lg:top-0 flex h-full">
          <CorrelationPanel columns={dataset.column_names} />
        </div>
      </div>

      {/* Helper Text and Navigation */}
      <div className="mt-6 flex flex-col gap-4">
        <p className="text-woodsmoke-100 font-space-grotesk text-base leading-relaxed">
          If everything looks good with your data, you can proceed to configure your model.
          Review the table to ensure your data is properly formatted, check the correlations to understand relationships between variables,
          and click on any column header to see detailed statistics. Once you're satisfied with the data quality,
          move to the next step to start building your machine learning model by selecting your target variable and predictors.
        </p>

        <button
          onClick={() => setCurrentView("train")}
          className="relative group overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/40 w-full sm:w-auto sm:self-end"
        >
          {/* Hextech corners */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Button content */}
          <div className="relative px-6 py-3 flex items-center justify-center gap-3">
            <span className="text-portage-300 font-space-grotesk text-sm uppercase tracking-[0.15em] group-hover:text-portage-200 transition-colors">
              Proceed to Variable Selection
            </span>
            <ArrowRight className="w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
          </div>
        </button>
      </div>

      <style jsx>{`
        .hextech-scroll::-webkit-scrollbar {
          width: 0.5rem;
          height: 0.5rem;
        }

        .hextech-scroll::-webkit-scrollbar-track {
          background: var(--color-woodsmoke-950);
          border-left: 0.0625rem solid rgba(66, 83, 233, 0.15);
        }

        .hextech-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            var(--color-portage-400),
            var(--color-portage-500)
          );
          border-radius: 0.25rem;
          border: 0.0625rem solid var(--color-portage-500);
          opacity: 0.7;
        }

        .hextech-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            var(--color-portage-400),
            var(--color-portage-500)
          );
          box-shadow: 0 0 0.75rem rgba(96, 123, 244, 0.5);
          opacity: 1;
        }

        .hextech-scroll::-webkit-scrollbar-corner {
          background: var(--color-woodsmoke-950);
        }

        .hextech-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--color-portage-400) var(--color-woodsmoke-950);
        }
      `}</style>
    </>
  );
};

export default Preview;
