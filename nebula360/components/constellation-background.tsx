"use client";

import { useEffect, useState, useRef } from "react";
import { useModelOptional } from "@/app/context";

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulseDelay: number;
  pulseDuration: number;
  driftSpeed: number;
  driftAngle: number;
}

export function ConstellationBackground() {
  const modelContext = useModelOptional();

  // Use context values if available, otherwise use defaults
  const isTraining = modelContext?.isTraining ?? false;
  const trainingProgress = modelContext?.trainingProgress ?? 0;
  const currentView = modelContext?.currentView ?? "preview";
  const hasCompletedTraining = modelContext?.hasCompletedTraining ?? false;

  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  const isResultsView = currentView === "results";

  // Update particles based on progress (0% to 100%) or completed training
  useEffect(() => {
    if (hasCompletedTraining && !isTraining) {
      // Training completed: mantener partículas ocasionales (20-30)
      const targetCount = 20 + Math.floor(Math.random() * 10);

      setParticles(prevParticles => {
        if (prevParticles.length === 0) {
          // Generar partículas iniciales para results
          const newParticles: Particle[] = [];
          for (let i = 0; i < targetCount; i++) {
            newParticles.push({
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: 2 + Math.random() * 2,
              opacity: 0.3 + Math.random() * 0.2, // Más sutiles
              pulseDelay: Math.random() * 4000,
              pulseDuration: 3000 + Math.random() * 3000, // Más lentas
              driftSpeed: 0.01 + Math.random() * 0.02, // Más lentas
              driftAngle: Math.random() * Math.PI * 2
            });
          }
          return newParticles;
        }
        return prevParticles;
      });
      return;
    }

    if (!isTraining) {
      setParticles([]);
      return;
    }

    const maxParticles = 150;
    const targetCount = Math.floor((trainingProgress / 100) * maxParticles);

    setParticles(prevParticles => {
      const currentCount = prevParticles.length;

      // Add particles if we need more
      if (currentCount < targetCount) {
        const newParticles = [...prevParticles];
        const particlesToAdd = targetCount - currentCount;

        for (let i = 0; i < particlesToAdd; i++) {
          newParticles.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 2, // 2-4px
            opacity: 0.4 + Math.random() * 0.3, // 0.4-0.7
            pulseDelay: Math.random() * 4000,
            pulseDuration: 2000 + Math.random() * 2000, // 2-4s
            driftSpeed: 0.02 + Math.random() * 0.03, // Base speed: 0.02-0.05
            driftAngle: Math.random() * Math.PI * 2
          });
        }

        return newParticles;
      }

      // Remove particles if we have too many
      if (currentCount > targetCount) {
        return prevParticles.slice(0, targetCount);
      }

      return prevParticles;
    });
  }, [isTraining, trainingProgress, isResultsView, hasCompletedTraining]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTimeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if ((isTraining || hasCompletedTraining) && particles.length > 0) {
        // Calculate speed multiplier
        let speedMultiplier = 1;
        if (hasCompletedTraining && !isTraining) {
          // Training completed: velocidad lenta y constante
          speedMultiplier = 0.5;
        } else if (isTraining) {
          // Training: acelera progresivamente
          speedMultiplier = 1 + (trainingProgress / 100) * 2; // 1.0 -> 3.0
        }

        // Animate and draw particles
        particles.forEach((particle) => {
          // Pulse animation
          const pulsePhase = ((elapsed + particle.pulseDelay) % particle.pulseDuration) / particle.pulseDuration;
          const pulse = Math.sin(pulsePhase * Math.PI * 2) * 0.2 + 0.8;

          // Drift movement
          const currentSpeed = particle.driftSpeed * speedMultiplier;
          particle.x += Math.cos(particle.driftAngle) * currentSpeed;
          particle.y += Math.sin(particle.driftAngle) * currentSpeed;

          // Wrap around
          if (particle.x < 0) particle.x = 100;
          if (particle.x > 100) particle.x = 0;
          if (particle.y < 0) particle.y = 100;
          if (particle.y > 100) particle.y = 0;

          // Draw particle
          const x = (particle.x / 100) * canvas.width;
          const y = (particle.y / 100) * canvas.height;
          const currentOpacity = particle.opacity * pulse;
          const currentScale = 1 + (pulse - 0.8) * 0.3;

          ctx.save();
          ctx.globalAlpha = currentOpacity;

          // Create radial gradient for particle glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * currentScale * 2);
          gradient.addColorStop(0, '#89A6FB'); // portage-200
          gradient.addColorStop(0.5, '#607BF4'); // portage-400
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * currentScale * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTraining, particles, isResultsView, trainingProgress, hasCompletedTraining]);

  if (!isTraining && !hasCompletedTraining) return null;

  // Calculate ambient glow opacity based on progress or completed training
  let ambientGlowOpacity = 0;
  if (hasCompletedTraining) {
    ambientGlowOpacity = 0.2; // Mantener glow completo
  } else if (isTraining) {
    ambientGlowOpacity = Math.min(trainingProgress / 100, 1) * 0.2;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Ambient Glow Layer */}
      <div
        className="absolute inset-0 ambient-glow"
        style={{
          opacity: ambientGlowOpacity,
          transition: 'opacity 0.8s ease-out'
        }}
      />

      {/* Particles Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <style jsx>{`
        /* Ambient glow background */
        .ambient-glow {
          background:
            radial-gradient(ellipse 60% 50% at 30% 40%,
                            #607BF4 0%,
                            transparent 60%),
            radial-gradient(ellipse 50% 60% at 70% 60%,
                            #89A6FB 0%,
                            transparent 50%);
          filter: blur(80px);
        }
      `}</style>
    </div>
  );
}
