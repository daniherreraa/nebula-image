"use client";

import { useErrorTheme } from "@/app/context/ErrorThemeContext";
import { AlertTriangle, Zap, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorDisplayProps {
  message: string;
  type?: "user" | "platform" | "network";
  title?: string;
}

export const ErrorDisplay = ({
  message,
  type = "platform",
  title = "Error"
}: ErrorDisplayProps) => {
  const { themeColor } = useErrorTheme();

  const getIcon = () => {
    switch (type) {
      case "user":
        return AlertTriangle;
      case "network":
        return Zap;
      default:
        return XCircle;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-center justify-center w-full h-full p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        {/* Main error container with steampunk/arcane aesthetic */}
        <div className="relative group">
          {/* Glow effect - changes from portage to carnation */}
          <div className={`absolute -inset-[1px] bg-gradient-to-r ${
            themeColor === "carnation"
              ? "from-carnation-400/40 via-carnation-500/60 to-carnation-400/40"
              : "from-portage-400/40 via-portage-500/60 to-portage-400/40"
          } blur-md opacity-75 group-hover:opacity-100 transition duration-300`} />

          {/* Inner glow */}
          <div className={`absolute -inset-[2px] bg-gradient-to-r ${
            themeColor === "carnation"
              ? "from-carnation-600/20 via-carnation-400/30 to-carnation-600/20"
              : "from-portage-600/20 via-portage-400/30 to-portage-600/20"
          } blur-xl opacity-50`} />

          {/* Content box */}
          <div className="relative bg-woodsmoke-950/95 backdrop-blur-xl border border-woodsmoke-800/50">
            {/* Top accent line */}
            <div className={`h-[2px] bg-gradient-to-r ${
              themeColor === "carnation"
                ? "from-transparent via-carnation-400 to-transparent"
                : "from-transparent via-portage-400 to-transparent"
            }`} />

            {/* Corner decorations - steampunk style */}
            <div className="absolute top-0 left-0 w-6 h-6">
              <div className={`absolute top-0 left-0 w-full h-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute top-0 left-0 h-full w-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute top-1 left-1 w-1 h-1 rounded-full ${
                themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"
              }`} />
            </div>
            <div className="absolute top-0 right-0 w-6 h-6">
              <div className={`absolute top-0 right-0 w-full h-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute top-0 right-0 h-full w-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${
                themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"
              }`} />
            </div>
            <div className="absolute bottom-0 left-0 w-6 h-6">
              <div className={`absolute bottom-0 left-0 w-full h-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute bottom-0 left-0 h-full w-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute bottom-1 left-1 w-1 h-1 rounded-full ${
                themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"
              }`} />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6">
              <div className={`absolute bottom-0 right-0 w-full h-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute bottom-0 right-0 h-full w-[1px] ${
                themeColor === "carnation" ? "bg-carnation-400/60" : "bg-portage-400/60"
              }`} />
              <div className={`absolute bottom-1 right-1 w-1 h-1 rounded-full ${
                themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"
              }`} />
            </div>

            {/* Main content */}
            <div className="relative p-8 space-y-6">
              {/* Icon with animated glow */}
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    boxShadow: themeColor === "carnation"
                      ? [
                          "0 0 20px rgba(236, 72, 153, 0.3)",
                          "0 0 40px rgba(236, 72, 153, 0.5)",
                          "0 0 20px rgba(236, 72, 153, 0.3)",
                        ]
                      : [
                          "0 0 20px rgba(147, 144, 255, 0.3)",
                          "0 0 40px rgba(147, 144, 255, 0.5)",
                          "0 0 20px rgba(147, 144, 255, 0.3)",
                        ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`p-4 rounded-full ${
                    themeColor === "carnation"
                      ? "bg-carnation-500/10 border-carnation-400/30"
                      : "bg-portage-500/10 border-portage-400/30"
                  } border`}
                >
                  <Icon className={`w-12 h-12 ${
                    themeColor === "carnation" ? "text-carnation-400" : "text-portage-400"
                  }`} strokeWidth={1.5} />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <h3 className={`font-space-grotesk text-2xl tracking-wide ${
                  themeColor === "carnation" ? "text-carnation-300" : "text-portage-300"
                }`}>
                  {title}
                </h3>
                <div className={`h-[1px] w-24 mx-auto bg-gradient-to-r ${
                  themeColor === "carnation"
                    ? "from-transparent via-carnation-400/50 to-transparent"
                    : "from-transparent via-portage-400/50 to-transparent"
                }`} />
              </div>

              {/* Error message */}
              <div className={`p-4 bg-woodsmoke-900/50 border ${
                themeColor === "carnation" ? "border-carnation-500/20" : "border-portage-500/20"
              } backdrop-blur-sm`}>
                <p className={`font-space-grotesk text-sm leading-relaxed ${
                  themeColor === "carnation" ? "text-carnation-200/90" : "text-portage-200/90"
                } text-center`}>
                  {message}
                </p>
              </div>

              {/* Decorative bottom accent */}
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className={`w-1 h-1 rounded-full ${
                      themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom accent line */}
            <div className={`h-[2px] bg-gradient-to-r ${
              themeColor === "carnation"
                ? "from-transparent via-carnation-400 to-transparent"
                : "from-transparent via-portage-400 to-transparent"
            }`} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
