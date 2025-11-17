"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, BarChart3, Brain, FileText } from "lucide-react";
import { useState } from "react";
import { useModel } from "@/app/context";

const steps = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "train", label: "Train", icon: Brain },
  { id: "results", label: "Results", icon: FileText },
];

interface FloatingStepNavProps {
  currentStep: string;
  onStepChange: (id: string) => void;
}

export default function FloatingStepNav({
  currentStep,
  onStepChange,
}: FloatingStepNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const { modelResults } = useModel();

  // Get next available step
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const nextStep = steps[currentIndex + 1];
  const canGoNext = nextStep && !(nextStep.id === "results" && !modelResults);

  return (
    <div className="fixed md:absolute bottom-0 left-0 right-0 md:right-auto w-full md:w-auto flex flex-col items-center md:items-start pb-safe z-50 md:z-auto gap-2">
      {/* Navigation Panel */}
      <div className="w-full md:w-auto px-4 md:px-0 md:pl-4">
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 600,
            damping: 40,
          }}
          className="
            relative overflow-hidden
            flex flex-row items-center justify-center gap-2 md:gap-3
            bg-gradient-to-r from-woodsmoke-950/95 via-woodsmoke-950/98 to-woodsmoke-950/95 md:bg-white/90
            backdrop-blur-md
            border border-portage-500/30 md:border-black/10
            rounded-full px-3 py-2.5 md:px-2 md:py-3
            shadow-lg md:shadow-sm
          "
        >
          {/* Hextech glow for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 md:hidden pointer-events-none" />

          {/* Bottom accent line for mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent md:hidden" />
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isHovered = hovered === step.id;
          // const isLeaving = leaving === step.id; // TODO: Implement leaving animation
          const highlightPreview = isActive || (step.id === "preview" && isHovered);

          // Detectar si este es el siguiente paso
          const currentIndex = steps.findIndex(s => s.id === currentStep);
          const isNextStep = index === currentIndex + 1;

          // Verificar si este paso debe estar deshabilitado
          const isDisabled = step.id === "results" && !modelResults;

          return (
            <motion.button
              key={step.id}
              onClick={() => !isDisabled && onStepChange(step.id)}
              onMouseEnter={() => {
                if (!isDisabled) {
                  setLeaving(null);
                  setHovered(step.id);
                }
              }}
              onMouseLeave={() => {
                setHovered(null);
                setLeaving(step.id);
              }}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              animate={isNextStep && !isDisabled ? {
                boxShadow: [
                  '0 0 0 0 rgba(96, 123, 244, 0.4)',
                  '0 0 0 8px rgba(96, 123, 244, 0)',
                  '0 0 0 0 rgba(96, 123, 244, 0)'
                ]
              } : {}}
              transition={isNextStep && !isDisabled ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              } : {}}
              disabled={isDisabled}
              className={`
                relative flex items-center gap-2
                transition-all rounded-full px-2.5 md:px-3 py-2
                ${
                  isDisabled
                    ? "bg-woodsmoke-900/30 text-portage-500/30 cursor-not-allowed opacity-50"
                    : isNextStep
                    ? "bg-portage-400 text-woodsmoke-950 cursor-pointer"
                    : isActive
                    ? step.id === "preview"
                      ? "bg-portage-100 md:bg-portage-100 text-[#1C1C1C] cursor-pointer"
                      : "bg-[#EDEEE5] md:bg-[#EDEEE5] text-[#1C1C1C] cursor-pointer"
                    : step.id === "preview"
                      ? "text-portage-200 md:text-[#5E5E4B] hover:bg-portage-500/20 md:hover:bg-portage-100 hover:text-portage-100 md:hover:text-[#1C1C1C] cursor-pointer"
                      : "text-portage-200 md:text-[#5E5E4B] hover:bg-woodsmoke-800/50 md:hover:bg-[#F3F3ED] cursor-pointer"
                }
              `}
            >
              {/* ICON container - BANDA EFFECT */}
              {/* ICON container - efecto banda corregido */}
              <div className="relative h-5 w-5 overflow-hidden flex items-center justify-center">
                <motion.div
                  animate={{
                    y: isHovered ? -30 : -10,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                  className="flex flex-col items-center"
                >
                  {/* PRIMER ICONO (posición superior, sube al hacer hover) */}
                  <div className="h-5 w-5 flex items-center justify-center absolute top-0">
                    <Icon
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        isDisabled
                          ? "text-portage-500/30"
                          : isNextStep
                          ? "text-woodsmoke-950"
                          : highlightPreview
                          ? "text-[#1C1C1C]"
                          : "text-portage-200 md:text-[#5E5E4B]"
                      }`}
                    />
                  </div>

                  {/* SEGUNDO ICONO (espera debajo y sube cuando se hace hover) */}
                  <div className="h-5 w-5 flex items-center justify-center absolute top-5">
                    <Icon
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        isDisabled
                          ? "text-portage-500/30"
                          : isNextStep
                          ? "text-woodsmoke-950"
                          : highlightPreview
                          ? "text-[#1C1C1C]"
                          : "text-portage-200 md:text-[#5E5E4B]"
                      }`}
                    />
                  </div>
                </motion.div>
              </div>

              {/* TEXT (efecto ola, intacto) */}
              <AnimatePresence mode="wait">
                {(isActive || isNextStep) && (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{
                      opacity: 1,
                      width: "auto",
                      transition: { duration: 0.25, ease: "easeOut" },
                    }}
                    exit={{
                      opacity: 0,
                      width: 0,
                      transition: { duration: 0.15, ease: "easeInOut" },
                    }}
                    className={`font-space-grotesk text-xs md:text-sm flex overflow-hidden ${
                      isNextStep ? "text-woodsmoke-50 md:text-woodsmoke-200" : ""
                    }`}
                  >
                    {step.label.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{
                          y: [20, -4, 0],
                          opacity: 1,
                          transition: {
                            delay: i * 0.035,
                            duration: 0.35,
                            ease: [0.25, 0.8, 0.25, 1],
                          },
                        }}
                        exit={{
                          y: 10,
                          opacity: 0,
                          transition: {
                            delay: i * 0.02,
                            duration: 0.15,
                            ease: "easeInOut",
                          },
                        }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
        </motion.div>
      </div>

      {/* Helper Text - Below navigation panel */}
      <div className="px-4 pb-4 md:px-0 md:pb-0 md:pl-4">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-woodsmoke-100 md:text-woodsmoke-500 font-space-grotesk text-[0.65rem] text-center md:text-left max-w-xs"
        >
          {currentStep === "preview" && "Review your dataset structure and preview the data"}
          {currentStep === "summary" && "Explore correlations and statistical summaries"}
          {currentStep === "train" && "Configure and train your machine learning model"}
          {currentStep === "results" && "Analyze model performance and predictions"}
        </motion.p>
      </div>
    </div>
  );
}
