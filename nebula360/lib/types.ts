export type FileInputProps = {
  file: File | null;
  setFile: (file: File | null) => void;
}

export interface PreviewData {
  header: string[];
  first_rows: Record<string, string | number | null>[];
}
