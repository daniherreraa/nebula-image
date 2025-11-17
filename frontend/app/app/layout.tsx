"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Plus, PanelLeftClose, Eye, Target, TrendingUp } from "lucide-react";
import { ModelProvider, useModel } from "@/app/context";
import { ErrorThemeProvider, useErrorTheme } from "@/app/context/ErrorThemeContext";
import { ThemeProvider } from "@/app/context/theme-context";
import { InteractiveRunes } from "@/components/interactive-runes";
import ModelsSidebar from "@/components/machine/models-sidebar";
import UserAvatarClient from "@/components/auth/user-avatar-client";
import { useRouter } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { clearDataset, currentView, setCurrentView, dataset } = useModel();
  const { themeColor } = useErrorTheme();
  const router = useRouter();

  const handleNewModel = () => {
    clearDataset();
    router.push("/app");
  };

  return (
    <SidebarProvider>
      <div className="relative flex flex-row w-svw h-svh overflow-hidden bg-woodsmoke-950">
        {/* Sidebar */}
        <ModelsSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Contenedor de runas (capa inferior) */}
        <div className="absolute inset-0 z-10">
          <InteractiveRunes />
        </div>

        {/* Efectos de luz reactivos (capa media) */}
        <div className="absolute inset-0 z-20 transition-all duration-1000">
          <div className={`absolute -top-[12rem] w-[90%] h-[30%] ${themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"} rounded-4xl blur-[210.10000610351562px] transform left-1/2 -translate-x-1/2 antialiased transition-all duration-1000`} />
          <div className={`absolute -bottom-[12rem] w-[90%] h-[30%] ${themeColor === "carnation" ? "bg-carnation-400" : "bg-portage-400"} rounded-4xl blur-[210.10000610351562px] transform left-1/2 -translate-x-1/2 antialiased transition-all duration-1000`} />
        </div>

        {/* Contenido principal (capa superior) */}
        <main className="flex-1 p-6 pb-0 lg:pb-6 relative flex flex-col overflow-hidden text-woodsmoke-50 z-50">
          <div className="w-full h-8 flex flex-row justify-between items-center relative z-[100]">
            <div className="flex flex-row gap-4 items-center text-portage-400">
              {/* Sidebar toggle button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:text-portage-300 transition-colors"
                aria-label="Open models sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>

              {/* New model button with tooltip */}
              <div className="relative group">
                <button
                  onClick={handleNewModel}
                  className="block hover:text-portage-300 transition-colors"
                  aria-label="Create new model"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]">
                  <div className="relative">
                    {/* Hextech corners */}
                    <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-l border-t border-portage-400/60" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-r border-t border-portage-400/60" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-l border-b border-portage-400/60" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-r border-b border-portage-400/60" />

                    <div className="relative bg-woodsmoke-900/95 border border-portage-500/30 px-3 py-1.5 whitespace-nowrap backdrop-blur-sm">
                      <span className="text-portage-300 font-space-grotesk text-xs">New Model</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Avatar */}
            <UserAvatarClient />
          </div>
          <div className="flex-1 overflow-hidden pb-24 lg:pb-0">
            {children}
          </div>
        </main>

        {/* Mobile/Tablet Bottom Navigation Bar - Hextech Style - Only show if dataset exists */}
        {dataset && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60]">
            <div className="relative overflow-hidden bg-woodsmoke-950/40 border-t border-portage-500/20 backdrop-blur-md">
            {/* Hextech top corners */}
            <div className="absolute -top-0.5 left-4 w-2 h-2 border-l border-t border-portage-500/40" />
            <div className="absolute -top-0.5 right-4 w-2 h-2 border-r border-t border-portage-500/40" />

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/50 to-transparent" />

            {/* Hextech glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-portage-500/5 via-portage-400/10 to-transparent pointer-events-none" />

            <div className="relative flex items-center justify-around pt-3 pb-4">
              {/* Preview */}
              <button
                onClick={() => setCurrentView("preview")}
                className="flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className={`relative w-16 h-8 flex items-center justify-center transition-all duration-300 ${
                  currentView === "preview"
                    ? "bg-portage-500/20 border border-portage-500/40"
                    : "border border-transparent"
                }`}>
                  {/* Hextech micro corners on icon container when active */}
                  {currentView === "preview" && (
                    <>
                      <div className="absolute -top-0.5 -left-0.5 w-1 h-1 border-l border-t border-portage-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 border-r border-t border-portage-400" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 border-l border-b border-portage-400" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-r border-b border-portage-400" />
                    </>
                  )}
                  <Eye className={`w-5 h-5 transition-colors ${
                    currentView === "preview" ? "text-portage-300" : "text-portage-400/60 group-hover:text-portage-300"
                  }`} />
                </div>
                <span className={`font-space-grotesk text-xs uppercase tracking-wider transition-colors ${
                  currentView === "preview" ? "text-portage-300" : "text-portage-400/60 group-hover:text-portage-300"
                }`}>Preview</span>
              </button>

              {/* Variable Selection */}
              <button
                onClick={() => setCurrentView("selection")}
                className="flex flex-col items-center gap-1 transition-all duration-300 group relative"
              >
                <div className={`relative w-16 h-8 flex items-center justify-center transition-all duration-300 ${
                  currentView === "selection"
                    ? "bg-portage-500/20 border border-portage-500/40"
                    : "border border-transparent"
                }`}>
                  {/* Hextech micro corners on icon container when active */}
                  {currentView === "selection" && (
                    <>
                      <div className="absolute -top-0.5 -left-0.5 w-1 h-1 border-l border-t border-portage-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 border-r border-t border-portage-400" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 border-l border-b border-portage-400" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-r border-b border-portage-400" />
                    </>
                  )}
                  <Target className={`w-5 h-5 transition-colors ${
                    currentView === "selection" ? "text-portage-300" : "text-portage-400/60 group-hover:text-portage-300"
                  }`} />
                  {/* Pulsating ring hint when in preview */}
                  {currentView === "preview" && (
                    <div className="absolute inset-0 animate-ping-slow opacity-50">
                      <div className="absolute inset-0 border border-portage-400/50" />
                    </div>
                  )}
                </div>
                <span className={`font-space-grotesk text-xs uppercase tracking-wider transition-colors ${
                  currentView === "selection" ? "text-portage-300" : "text-portage-400/60 group-hover:text-portage-300"
                }`}>Train</span>
              </button>

              {/* Results */}
              <button
                onClick={() => setCurrentView("results")}
                className="flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className={`relative w-16 h-8 flex items-center justify-center transition-all duration-300 ${
                  currentView === "results"
                    ? "bg-portage-500/20 border border-portage-500/40"
                    : "border border-transparent"
                }`}>
                  {/* Hextech micro corners on icon container when active */}
                  {currentView === "results" && (
                    <>
                      <div className="absolute -top-0.5 -left-0.5 w-1 h-1 border-l border-t border-portage-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 border-r border-t border-portage-400" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 border-l border-b border-portage-400" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-r border-b border-portage-400" />
                    </>
                  )}
                  <TrendingUp className={`w-5 h-5 transition-colors ${
                    currentView === "results" ? "text-portage-300" : "text-portage-400/60 group-hover:text-portage-300"
                  }`} />
                </div>
                <span className={`font-space-grotesk text-xs uppercase tracking-wider transition-colors ${
                  currentView === "results" ? "text-portage-300" : "text-portage-400/60 group-hover:text-portage-300"
                }`}>Results</span>
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </SidebarProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ModelProvider>
        <ErrorThemeProvider>
          <LayoutContent>{children}</LayoutContent>
        </ErrorThemeProvider>
      </ModelProvider>
    </ThemeProvider>
  );
}
