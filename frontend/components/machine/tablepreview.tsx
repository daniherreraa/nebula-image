// app/components/machine/tablepreview.tsx
import { memo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TablePreviewProps {
  column_names: string[];
  preview_data: Array<Record<string, string | number | boolean | null>>;
  onColumnClick?: (columnName: string) => void;
  selectedColumn?: string;
}

const TablePreview = memo(function TablePreview({column_names, preview_data, onColumnClick, selectedColumn}: TablePreviewProps) {
  // Only animate the first column if no column is selected
  const shouldAnimateFirstColumn = !selectedColumn && column_names.length > 0;
  const formatValue = useCallback((value: string | number | boolean | null) => {
    if (value === null) {
      return <span className="text-portage-400/40 italic text-xs">null</span>;
    }

    if (typeof value === 'number') {
      return <span className="tabular-nums">{value.toFixed(4)}</span>;
    }

    return <span className="tabular-nums">{String(value)}</span>;
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm w-full h-full flex flex-col">
      {/* Instructional text */}
      {!selectedColumn && (
        <div className="px-4 pt-3 pb-2 border-b border-portage-500/10">
          <p className="text-sm text-portage-300 font-space-grotesk flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-portage-400 animate-pulse"></span>
            <span>Click on any column header to view detailed statistics</span>
          </p>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[0.0625rem] bg-gradient-to-r from-transparent via-portage-400/40 to-transparent" />

      <div className="relative overflow-x-auto overflow-y-auto hextech-scroll flex-1">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-b border-portage-500/20 hover:bg-transparent">
              {column_names.map((column) => (
                <TableHead
                  key={column}
                  className={`text-portage-300 font-space-grotesk text-xs uppercase tracking-wider bg-woodsmoke-900/90 backdrop-blur-sm border-r border-portage-500/10 last:border-r-0 ${
                    onColumnClick ? 'cursor-pointer hover:bg-portage-500/20 transition-all duration-300' : ''
                  } ${
                    selectedColumn === column ? 'bg-portage-500/30' : ''
                  } ${
                    shouldAnimateFirstColumn && column === column_names[0] ? 'relative overflow-hidden' : ''
                  }`}
                  onClick={() => onColumnClick?.(column)}
                >
                  <div className="flex items-center gap-2 py-1">
                    <div className={`w-1 h-1 rounded-full ${
                      selectedColumn === column 
                        ? 'bg-portage-300 shadow-lg shadow-portage-300/50' 
                        : shouldAnimateFirstColumn && column === column_names[0]
                          ? 'bg-portage-400 animate-pulse'
                          : 'bg-portage-400'
                    }`} />
                    {column}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {preview_data.map((row, idx) => (
              <TableRow 
                key={idx}
                className="border-b border-portage-500/10 hover:bg-portage-500/5 transition-colors duration-200 group"
              >
                {column_names.map((column) => (
                  <TableCell 
                    key={column}
                    className="font-space-grotesk text-sm text-woodsmoke-100 border-r border-portage-500/5 last:border-r-0 group-hover:text-woodsmoke-50 transition-colors"
                  >
                    {formatValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-[0.0625rem] bg-gradient-to-r from-transparent via-portage-400/30 to-transparent" />
      
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-portage-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-portage-600/10 to-transparent pointer-events-none" />
      
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(66, 83, 233, 0.7);
          }
          70% {
            box-shadow: 0 0 0 0.25rem rgba(66, 83, 233, 0);
          }
        }
        
        .hextech-scroll::-webkit-scrollbar {
          width: 0.5rem;
          height: 0.5rem;
        }
        
        .hextech-scroll::-webkit-scrollbar-track {
          background: var(--color-woodsmoke-950);
          border-left: 0.0625rem solid rgba(66, 83, 233, 0.15);
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
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
    </div>
  )
});

export default TablePreview