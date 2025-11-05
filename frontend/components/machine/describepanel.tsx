import { PreviewData } from "@/lib/types";

interface DescribePanelProps {
  data: PreviewData;
  selectedColumn: string | null;
}

export default function DescribePanel({
  data,
  selectedColumn,
}: DescribePanelProps) {
  if (!selectedColumn) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-black/50 font-space-grotesk">
        Select one of the columns to see related statistics.
      </div>
    );
  }

  const columnValues = data.first_rows
    .map((row) => row[selectedColumn])
    .filter((val) => typeof val === "number");

  if (columnValues.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-black/50 font-space-grotesk">
        The selected column does not contain numeric data for statistical
        summary.
      </div>
    );
  }

  const mean =
    columnValues.reduce((sum, val) => sum + val, 0) / columnValues.length;
  const min = Math.min(...columnValues);
  const max = Math.max(...columnValues);
  const std = Math.sqrt(
    columnValues.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
      columnValues.length
  );

  return (
    <div className="p-4 h-full border-l border-black/10">
      <div className="mb-4">
        <h2 className="font-tanker text-2xl">{selectedColumn}</h2>
        <p className="text-sm text-black/50 font-space-grotesk">
          Summary statistics for the selected variable.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Mean" value={mean.toFixed(2)} />
        <Stat label="Std Dev" value={std.toFixed(2)} />
        <Stat label="Min" value={min} />
        <Stat label="Max" value={max} />
      </div>

      {/* 
        Aquí puedes agregar secciones adicionales:
        - Histograma o boxplot de la variable
        - Porcentaje de valores faltantes
        - Distribución categórica
        - Outliers detectados
      */}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <h4 className="font-tanker text-lg leading-none">{label}</h4>
      <p className="text-black/70 font-space-grotesk">{value}</p>
    </div>
  );
}
