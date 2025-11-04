"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-5 w-10 shrink-0 items-center border border-portage-500/30 transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-woodsmoke-900/80 data-[state=checked]:bg-woodsmoke-900/80 data-[state=checked]:border-portage-400/60",
        className
      )}
      {...props}
    >
      {/* Hextech corners */}
      <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-l border-t border-portage-500/40 peer-data-[state=checked]:border-portage-400/80 transition-colors duration-300 pointer-events-none" />
      <div className="absolute -top-[1px] -right-[1px] w-1.5 h-1.5 border-r border-t border-portage-500/40 peer-data-[state=checked]:border-portage-400/80 transition-colors duration-300 pointer-events-none" />
      <div className="absolute -bottom-[1px] -left-[1px] w-1.5 h-1.5 border-l border-b border-portage-500/40 peer-data-[state=checked]:border-portage-400/80 transition-colors duration-300 pointer-events-none" />
      <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-r border-b border-portage-500/40 peer-data-[state=checked]:border-portage-400/80 transition-colors duration-300 pointer-events-none" />

      {/* Glow effect when checked */}
      <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 data-[state=checked]:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-3.5 bg-portage-500/60 data-[state=checked]:bg-portage-400 border border-portage-400/40 data-[state=checked]:border-portage-300 transition-all duration-300 data-[state=checked]:translate-x-[calc(100%+5px)] data-[state=unchecked]:translate-x-0.5 relative z-10"
        )}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-portage-400/30 data-[state=checked]:bg-portage-300/50 blur-[1px] transition-all duration-300" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
