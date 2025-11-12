// components/machine/models-sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Plus, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useModel } from "@/app/context/ModelContext";
import { listModels, MLModelListItem } from "@/lib/api/models";

interface ModelsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModelsSidebar = ({ isOpen, onClose }: ModelsSidebarProps) => {
  const router = useRouter();
  const { clearDataset, modelId } = useModel();
  const [models, setModels] = useState<MLModelListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load models when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedModels = await listModels();
      setModels(fetchedModels);
    } catch (err: unknown) {
      console.error("Error loading models:", err);
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelClick = (modelId: string) => {
    router.push(`/app?modelId=${modelId}`);
    onClose();
  };

  const handleNewModel = () => {
    clearDataset(); // Reset all state including runes
    router.push("/app");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-woodsmoke-950/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 z-[9999]"
          >
            {/* Hextech styled container */}
            <div className="relative h-full overflow-hidden bg-gradient-to-r from-woodsmoke-950/95 via-woodsmoke-950/98 to-woodsmoke-950/95 border-r border-portage-500/20 backdrop-blur-md">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hextech-grid-sidebar" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="currentColor" strokeWidth="0.5" className="text-portage-400" fill="none" />
                      <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-portage-400" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hextech-grid-sidebar)" />
                </svg>
              </div>

              {/* Top gradient glow */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-portage-500/10 via-portage-400/5 to-transparent pointer-events-none" />

              <div className="relative h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-portage-500/20">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-portage-400" />
                    <h2 className="text-portage-200 font-tanker text-xl tracking-wide">
                      My Models
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-portage-500/10 group-hover:bg-portage-400/20 transition-colors rounded-sm" />
                    <X className="relative w-5 h-5 text-portage-400 group-hover:text-portage-300 transition-colors" />
                  </button>
                </div>

                {/* New Model Button */}
                <div className="p-4 border-b border-portage-500/10">
                  <button
                    onClick={handleNewModel}
                    className="relative group w-full overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/30 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/60"
                  >
                    {/* Hextech corners */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Button content */}
                    <div className="relative px-4 py-3 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
                      <span className="text-portage-300 font-space-grotesk text-sm font-medium group-hover:text-portage-200 transition-colors">
                        New Model
                      </span>
                    </div>
                  </button>
                </div>

                {/* Models List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-2 border-portage-400/20 border-t-portage-400 rounded-full animate-spin" />
                      <p className="text-portage-400/50 font-space-grotesk text-sm mt-3">
                        Loading models...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400/70 font-space-grotesk text-sm">
                        {error}
                      </p>
                      <button
                        onClick={loadModels}
                        className="mt-3 text-portage-400 font-space-grotesk text-xs underline hover:text-portage-300 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  ) : models.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-portage-400/50 font-space-grotesk text-sm">
                        No models yet
                      </p>
                      <p className="text-portage-400/30 font-space-grotesk text-xs mt-1">
                        Create your first model to get started
                      </p>
                    </div>
                  ) : (
                    models.map((model) => {
                      const isActive = modelId === model.id;

                      return (
                        <button
                          key={model.id}
                          onClick={() => handleModelClick(model.id)}
                          className={`relative group w-full text-left transition-all duration-300 ${
                            isActive ? "scale-[1.02]" : ""
                          }`}
                        >
                          {/* Hextech corners */}
                          <div className={`absolute -top-1 -left-1 w-2 h-2 border-l border-t transition-colors duration-300 ${
                            isActive
                              ? "border-portage-400/80"
                              : "border-portage-500/40 group-hover:border-portage-400/60"
                          }`} />
                          <div className={`absolute -top-1 -right-1 w-2 h-2 border-r border-t transition-colors duration-300 ${
                            isActive
                              ? "border-portage-400/80"
                              : "border-portage-500/40 group-hover:border-portage-400/60"
                          }`} />
                          <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-l border-b transition-colors duration-300 ${
                            isActive
                              ? "border-portage-400/80"
                              : "border-portage-500/40 group-hover:border-portage-400/60"
                          }`} />
                          <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-r border-b transition-colors duration-300 ${
                            isActive
                              ? "border-portage-400/80"
                              : "border-portage-500/40 group-hover:border-portage-400/60"
                          }`} />

                          <div className={`relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border backdrop-blur-sm transition-all duration-300 ${
                            isActive
                              ? "border-portage-400/60 brightness-110"
                              : "border-portage-500/20 group-hover:border-portage-400/40"
                          }`}>
                            {/* Active indicator bar */}
                            {isActive && (
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-portage-400" />
                            )}

                            {/* Hextech glow */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none transition-opacity duration-300 ${
                              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                            }`} />

                            <div className="relative p-4 space-y-2">
                              {/* Model Name */}
                              <h3 className="text-portage-200 font-space-grotesk font-medium text-sm truncate">
                                {model.model_name || `Model: ${model.outcome_variable}`}
                              </h3>

                              {/* Model Type */}
                              <p className="text-portage-400/70 font-space-grotesk text-xs">
                                {model.selected_model}
                              </p>

                              {/* Divider */}
                              <div className="h-px bg-gradient-to-r from-transparent via-portage-500/20 to-transparent" />

                              {/* Info */}
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <p className="text-portage-400/50 font-space-grotesk text-[10px] uppercase tracking-wider mb-0.5">
                                    Outcome
                                  </p>
                                  <p className="text-portage-300 font-space-grotesk text-xs truncate">
                                    {model.outcome_variable}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {model.has_results ? (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-green-400/80" />
                                      <p className="text-green-400/70 font-space-grotesk text-[10px] uppercase tracking-wider">
                                        Trained
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-portage-400/50" />
                                      <p className="text-portage-400/50 font-space-grotesk text-[10px] uppercase tracking-wider">
                                        Pending
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Created date */}
                              <p className="text-portage-400/40 font-space-grotesk text-[10px]">
                                {new Date(model.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-portage-500/10">
                  <div className="flex items-center justify-between">
                    <p className="text-portage-400/50 font-space-grotesk text-xs">
                      {models.length} {models.length === 1 ? "model" : "models"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModelsSidebar;
