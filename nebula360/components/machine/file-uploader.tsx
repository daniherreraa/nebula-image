// app/components/FileUploader.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useModel } from "@/app/context";

const FileUploader = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  
  const { setModelId, setDataset, setIsLoading } = useModel();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setFileName(file.name);

    const generatedModelId = uuidv4();
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setIsLoading(true);

      // En el navegador usamos localhost, en el servidor usamos el nombre del servicio Docker
      const apiUrl = typeof window !== 'undefined'
        ? 'http://localhost:8000'
        : process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("API Response:", data);
      console.log("Generated Model ID:", generatedModelId);

      // Transform backend response to match frontend DatasetInfo structure
      const transformedData = {
        success: data.success,
        message: data.message,
        filename: data.file_info?.filename || file.name,
        rows: data.data_summary?.shape?.rows || 0,
        columns: data.data_summary?.shape?.columns || 0,
        column_names: data.data_summary?.columns || [],
        preview: data.data_summary?.preview || [],
        encoding: data.file_info?.encoding || 'utf-8',
        separator: data.file_info?.separator || ',',
        // Include full backend data for advanced features
        data_summary: data.data_summary,
        file_info: data.file_info,
      };

      setModelId(generatedModelId);
      setDataset(transformedData);
      
      router.push(`/app/${generatedModelId}`);
      
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
      setIsLoading(false);
    }
  }, [router, setModelId, setDataset, setIsLoading]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps()}
      className="absolute w-[38em] h-[38em] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
    >
      <input {...getInputProps()} />

      <div className="rounded-lg p-6 flex flex-col items-start justify-between w-96 h-fit border-2 border-woodsmoke-50/0 text-[#1C1C1C] transition-all duration-200 pointer-events-none">
        <div className="flex flex-col">
          <h1 className="font-tanker text-2xl text-woodsmoke-50">Upload your file</h1>
          <p className="font-space-grotesk text-base text-woodsmoke-400">
            Upload your CSV file and let us guide you through the process
          </p>
        </div>

        <button
          type="button"
          onClick={open}
          disabled={uploading}
          className={`mt-4 w-full h-10 bg-woodsmoke-950 border border-woodsmoke-900 text-woodsmoke-50 flex items-center justify-center gap-2 font-space-grotesk text-sm transition-colors pointer-events-auto ${
            uploading
              ? "bg-woodsmoke-900 text-woodsmoke-50 cursor-not-allowed"
              : "bg-woodsmoke-900 text-woodsmoke-50 hover:bg-woodsmoke-900 hover:border-woodsmoke-700 cursor-pointer"
          }`}
        >
          {uploading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                className="w-4 h-4 border-2 border-[#4C4C3A] border-t-transparent rounded-full"
              />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {fileName ? fileName : "Click here or drop your file"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;