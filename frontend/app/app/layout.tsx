"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Plus, PanelLeftClose } from "lucide-react";
import { ModelProvider, useModel } from "@/app/context";
import { InteractiveRunes } from "@/components/interactive-runes";
import ModelsSidebar from "@/components/machine/models-sidebar";
import UserAvatarClient from "@/components/auth/user-avatar-client";
import { useRouter } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { clearDataset } = useModel();
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

        {/* Efectos de luz portage (capa media) */}
        <div className="absolute inset-0 z-20">
          <div className="absolute -top-[12rem] w-[90%] h-[30%] bg-portage-400 rounded-4xl blur-[210.10000610351562px] transform left-1/2 -translate-x-1/2 antialiased" />
          <div className="absolute -bottom-[12rem] w-[90%] h-[30%] bg-portage-400 rounded-4xl blur-[210.10000610351562px] transform left-1/2 -translate-x-1/2 antialiased" />
        </div>

        {/* Contenido principal (capa superior) */}
        <main className="flex-1 p-6 relative flex flex-col overflow-hidden text-woodsmoke-50 z-50">
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
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ModelProvider>
      <LayoutContent>{children}</LayoutContent>
    </ModelProvider>
  );
}
