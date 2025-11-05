"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import runespath from "@/app/assets/runes.svg";
import { useModelOptional } from "@/app/context";
import { ConstellationBackground } from "./constellation-background";

export function InteractiveRunes() {
  const pathname = usePathname();
  const [isDragging, setIsDragging] = useState(false);
  const modelContext = useModelOptional();

  // Use context values if available, otherwise use defaults
  const isTraining = modelContext?.isTraining ?? false;
  const trainingProgress = modelContext?.trainingProgress ?? 0;
  const currentView = modelContext?.currentView ?? "preview";
  const hasCompletedTraining = modelContext?.hasCompletedTraining ?? false;

  const [flash, setFlash] = useState(0);

  // Refs for GSAP animations
  const smallRuneRef = useRef<HTMLDivElement>(null);
  const mediumRuneRef = useRef<HTMLDivElement>(null);
  const largeRuneRef = useRef<HTMLDivElement>(null);

  // Detectar si estamos en la página de upload o preview
  const isUploadPage = pathname === "/app";
  const isPreviewPage = pathname?.startsWith("/app/") && pathname !== "/app";
  const isResultsView = currentView === "results";

  useEffect(() => {
    if (!isUploadPage) return;

    // Detectar drag sobre la ventana
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Solo desactivar si salimos completamente de la ventana
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [isUploadPage]);

  // Control rotation speed with GSAP based on training progress
  useEffect(() => {
    if (!smallRuneRef.current || !mediumRuneRef.current || !largeRuneRef.current) return;

    if (hasCompletedTraining) {
      // Training completed: maintain slow, mystical speed
      gsap.to(smallRuneRef.current, {
        rotation: "+=360",
        duration: 50,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
      gsap.to(mediumRuneRef.current, {
        rotation: "-=360",
        duration: 70,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
      gsap.to(largeRuneRef.current, {
        rotation: "+=360",
        duration: 90,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
    } else if (isTraining) {
      // Calculate target duration based on progress (20s -> 2s)
      const baseSmall = 20;
      const baseMedium = 30;
      const baseLarge = 40;

      const speedMultiplier = Math.max(1 - (trainingProgress / 100) * 0.9, 0.1);

      const targetSmallDuration = baseSmall * speedMultiplier;
      const targetMediumDuration = baseMedium * speedMultiplier;
      const targetLargeDuration = baseLarge * speedMultiplier;

      // Use timeScale to smoothly accelerate instead of killing and recreating animations
      // This prevents jarring transitions
      const smallTween = gsap.to(smallRuneRef.current, {
        rotation: "+=360",
        duration: targetSmallDuration,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });

      const mediumTween = gsap.to(mediumRuneRef.current, {
        rotation: "-=360",
        duration: targetMediumDuration,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });

      const largeTween = gsap.to(largeRuneRef.current, {
        rotation: "+=360",
        duration: targetLargeDuration,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });

    } else if (isPreviewPage) {
      gsap.to(smallRuneRef.current, {
        rotation: "+=360",
        duration: 30,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
      gsap.to(mediumRuneRef.current, {
        rotation: "-=360",
        duration: 45,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
      gsap.to(largeRuneRef.current, {
        rotation: "+=360",
        duration: 60,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
    } else {
      gsap.to(smallRuneRef.current, {
        rotation: "+=360",
        duration: 60,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
      gsap.to(mediumRuneRef.current, {
        rotation: "-=360",
        duration: 80,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
      gsap.to(largeRuneRef.current, {
        rotation: "+=360",
        duration: 100,
        ease: "none",
        repeat: -1,
        overwrite: "auto",
      });
    }
  }, [isTraining, trainingProgress, isPreviewPage, isResultsView, hasCompletedTraining]);

  // Random flashes during training
  useEffect(() => {
    if (!isTraining || trainingProgress >= 100) return;

    const flashInterval = setInterval(() => {
      // Random flash between 0.5 and 1.5
      setFlash(Math.random() * 1 + 0.5);
      setTimeout(() => setFlash(0), 150); // Flash duration
    }, Math.random() * 1000 + 500); // Random interval between 500-1500ms

    return () => clearInterval(flashInterval);
  }, [isTraining, trainingProgress]);

  // Color transition durante training y results
  const getRuneColor = () => {
    // If training completed, always keep illuminated state
    if (hasCompletedTraining) {
      const brightness = 1.8;
      const saturation = 1.8;
      const baseGlow = 16; // Glow completo

      return {
        filter: `brightness(${brightness}) saturate(${saturation}) hue-rotate(10deg) drop-shadow(0 0 ${baseGlow}px rgba(96, 123, 244, 0.8)) drop-shadow(0 0 ${baseGlow * 1.5}px rgba(137, 166, 251, 0.5))`,
        transition: "filter 0.8s ease-out",
      };
    }

    if (!isTraining) return {};

    // Transition to brighter portage color based on progress
    const colorProgress = Math.min(trainingProgress / 80, 1); // Reach full color at 80%

    // Aumentar brillo significativamente (1.0 -> 1.8)
    const brightness = 1 + (colorProgress * 0.8);

    // Aumentar saturación (1.0 -> 1.8)
    const saturation = 1 + (colorProgress * 0.8);

    // Flash effect: más intenso al principio, más sutil al final
    const flashIntensity = flash * (1 - colorProgress * 0.5);

    // Base glow que crece con el progreso
    const baseGlow = 4 + (colorProgress * 12); // 4px -> 16px
    const flashGlow = flashIntensity * 12; // hasta 12px extra

    // Colores más brillantes: usar portage-300 y portage-200
    const glowOpacity = 0.4 + colorProgress * 0.4 + flashIntensity * 0.3;
    const secondaryGlowOpacity = 0.2 + colorProgress * 0.3 + flashIntensity * 0.2;

    return {
      filter: `brightness(${brightness}) saturate(${saturation}) hue-rotate(${
        colorProgress * 10
      }deg) drop-shadow(0 0 ${baseGlow + flashGlow}px rgba(96, 123, 244, ${glowOpacity})) drop-shadow(0 0 ${(baseGlow + flashGlow) * 1.5}px rgba(137, 166, 251, ${secondaryGlowOpacity}))`,
      transition: flash > 0 ? "filter 0.15s ease-out" : "filter 0.8s ease-out",
    };
  };

  const runeStyle = getRuneColor();

  return (
    <>
      {/* Constellation Background Layer - Behind everything */}
      <ConstellationBackground />

      {/* Runa pequeña (scale 1) - gira en sentido horario */}
      <div
        className={`absolute w-[20em] sm:w-[30em] lg:w-[40em] h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none transition-all duration-500 ${
          isDragging && isUploadPage ? "rune-glow" : ""
        }`}
        style={runeStyle}
      >
        <div ref={smallRuneRef}>
          <Image
            src={runespath}
            alt="Runes Background"
            className="w-full h-auto object-cover"
            priority={true}
          />
        </div>
      </div>

      {/* Runa mediana (scale 1.7) - gira en sentido antihorario */}
      <div
        className="absolute w-[20em] sm:w-[30em] lg:w-[40em] h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={runeStyle}
      >
        <div ref={mediumRuneRef}>
          <Image
            src={runespath}
            alt="Runes Background"
            className="w-full h-auto object-cover scale-[1.5] sm:scale-[1.6] lg:scale-[1.7]"
            priority={true}
          />
        </div>
      </div>

      {/* Runa grande (scale 3) - gira en sentido horario */}
      <div
        className="absolute w-[20em] sm:w-[30em] lg:w-[40em] h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={runeStyle}
      >
        <div ref={largeRuneRef}>
          <Image
            src={runespath}
            alt="Runes Background"
            className="w-full h-auto object-cover scale-[2.2] sm:scale-[2.6] lg:scale-[3]"
            priority={true}
          />
        </div>
      </div>

      <style jsx>{`
        .rune-glow {
          filter: drop-shadow(0 0 2px rgba(96, 123, 244, 0.8))
            drop-shadow(0 0 4px rgba(96, 123, 244, 0.5));
        }

        .rune-glow :global(img) {
          filter: brightness(1.2) saturate(1.15);
        }

        .rune-glow::before {
          content: "";
          position: absolute;
          inset: -10%;
          background: radial-gradient(
            circle,
            rgba(96, 123, 244, 0.08) 0%,
            rgba(96, 123, 244, 0.04) 40%,
            transparent 70%
          );
          z-index: -1;
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
}
