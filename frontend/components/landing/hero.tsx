import { InteractiveRunes } from "@/components/interactive-runes";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative w-svw h-svh bg-woodsmoke-950 flex items-center justify-center overflow-hidden">
      {/* Animated Runes Background */}
      <div className="absolute inset-0 z-10">
        <InteractiveRunes />
      </div>

      {/* Portage light effects */}
      <div className="absolute inset-0 z-20">
        <div className="absolute -top-[12rem] w-[90%] h-[30%] bg-portage-400 rounded-4xl blur-[210.10000610351562px] transform left-1/2 -translate-x-1/2 antialiased" />
        <div className="absolute -bottom-[12rem] w-[90%] h-[30%] bg-portage-400 rounded-4xl blur-[210.10000610351562px] transform left-1/2 -translate-x-1/2 antialiased" />
      </div>

      {/* Hero Content */}
      <div className="relative z-50 w-full max-w-4xl px-6">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-portage-400 blur-xl opacity-50" />
              <Sparkles className="relative w-20 h-20 text-portage-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-7xl font-tanker text-portage-200 tracking-wide mb-6">
            Nebula 360
          </h1>

          <div className="h-px bg-gradient-to-r from-transparent via-portage-500/50 to-transparent mb-8 max-w-md mx-auto" />

          <p className="text-portage-300 font-space-grotesk text-xl leading-relaxed mb-4 max-w-2xl mx-auto">
            Advanced Machine Learning Platform
          </p>

          <p className="text-portage-400/70 font-space-grotesk text-base leading-relaxed mb-12 max-w-xl mx-auto">
            Build, train, and deploy ML models with ease. Analyze your data with powerful visualizations and get instant insights.
          </p>

          {/* CTA Button */}
          <Link
            href="/auth/login"
            className="relative group inline-block"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/30 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/60">
              {/* Hextech corners */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Button content */}
              <div className="relative px-8 py-4 flex items-center justify-center gap-3">
                <span className="text-portage-300 font-space-grotesk font-medium text-lg group-hover:text-portage-200 transition-colors">
                  Get Started
                </span>
                <ArrowRight className="w-5 h-5 text-portage-400 group-hover:text-portage-300 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Version Badge */}
      <div className="absolute bottom-4 right-4 z-50 text-portage-400/50 font-space-grotesk text-xs">
        v1.0.0 | commit: 28b41c5
      </div>
    </div>
  );
};

export default Hero;