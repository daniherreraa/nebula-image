"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockModels = [
  { id: "model-1", name: "Sales Forecast 2025" },
  { id: "model-2", name: "Customer Segmentation" },
  { id: "model-3", name: "Churn Analysis" },
];

export function AppSidebar() {
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();

  // Controla si el sidebar está animándose
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldShowText, setShouldShowText] = useState(open);

  useEffect(() => {
    if (open) {
      // Al abrir → muestra texto después
      setIsAnimating(true);
      const showTimer = setTimeout(() => {
        setShouldShowText(true);
        setIsAnimating(false);
      }, 280);
      return () => clearTimeout(showTimer);
    } else {
      // Al cerrar → oculta texto al instante
      setIsAnimating(true);
      setShouldShowText(false);
      const stopTimer = setTimeout(() => setIsAnimating(false), 280);
      return () => clearTimeout(stopTimer);
    }
  }, [open]);

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="flex flex-col justify-between bg-transparent text-woodsmoke-50 transition-all duration-300 border-none"
    >
      {/* ========== TOP SECTION ========== */}
      <SidebarContent
        className={cn(
          "flex flex-col overflow-hidden text-woodsmoke-50 transition-all duration-300",
          open
            ? "rounded-lg px-3 py-3 backdrop-blur-sm bg-woodsmoke-950/95"
            : "w-fit px-0 py-0 bg-transparent"
        )}
      >
        <SidebarMenu className="list-none">
          {/* Trigger */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="flex items-center justify-start gap-2 rounded-md p-2 text-woodsmoke-50 transition-colors hover:bg-woodsmoke-800"
            >
              {open ? (
                <PanelLeftClose className="w-5 h-5 text-woodsmoke-50" />
              ) : (
                <PanelLeftOpen className="w-5 h-5 text-woodsmoke-50" />
              )}
              <AnimatePresence>
                {shouldShowText && !isAnimating && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="font-space-grotesk text-woodsmoke-50"
                  >
                    Close
                  </motion.span>
                )}
              </AnimatePresence>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* New Model */}
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton
              onClick={() => router.push("/app")}
              className="flex items-center justify-start gap-2 rounded-lg px-3 py-2 font-space-grotesk text-sm text-woodsmoke-50 transition-colors hover:bg-woodsmoke-900"
            >
              <Plus className="w-4 h-4" />
              <AnimatePresence>
                {shouldShowText && !isAnimating && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-woodsmoke-50"
                  >
                    New Model
                  </motion.span>
                )}
              </AnimatePresence>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Recent Models */}
        <AnimatePresence>
          {shouldShowText && !isAnimating && (
            <motion.div
              key="models"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="mt-4"
            >
              <p className="text-xs font-semibold text-woodsmoke-300 mb-2 px-1">
                Recent Models
              </p>
              <div className="flex flex-col gap-1">
                {mockModels.map((model) => (
                  <AnimatePresence key={model.id}>
                    <motion.button
                      key={model.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => router.push(`/app/${model.id}`)}
                      className="text-left text-sm text-woodsmoke-50 hover:bg-woodsmoke-800 rounded-md px-2 py-1 transition-colors"
                    >
                      {model.name}
                    </motion.button>
                  </AnimatePresence>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>

      {/* ========== USER SECTION ========== */}
      <div
        className={cn(
          "border-woodsmoke-900 flex cursor-pointer items-center rounded-lg transition-all duration-300",
          open
            ? "mx-3 mb-3 mt-3 px-3 py-2.5 gap-3 bg-woodsmoke-950/95 hover:bg-woodsmoke-800/90"
            : "w-fit mx-0 mb-0 mt-3 px-0 py-0 gap-0 bg-transparent"
        )}
      >
        {/* Avatar fijo (sin movimiento) */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
          <AvatarFallback>-</AvatarFallback>
        </Avatar>

        <AnimatePresence>
          {shouldShowText && !isAnimating && (
            <motion.div
              key="user-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="text-sm font-medium text-woodsmoke-50 whitespace-nowrap">
                John Doe
              </span>
              <span className="text-xs text-woodsmoke-300 whitespace-nowrap">View profile</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sidebar>
  );
}