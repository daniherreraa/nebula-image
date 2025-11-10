import { InteractiveRunes } from "@/components/interactive-runes";
import SignIn from "@/components/auth/signin-button";
import { Sparkles } from "lucide-react";
import { safeAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await safeAuth();

  // If already logged in, redirect to app
  if (session?.user) {
    redirect("/app");
  }

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

      {/* Login Card */}
      <div className="relative z-50 w-full max-w-md px-6">
        {/* Hextech Card */}
        <div className="relative group">
          {/* Hextech corners */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-portage-400/60" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-portage-400/60" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-portage-400/60" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-portage-400/60" />

          <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/80 via-woodsmoke-950/95 to-woodsmoke-950/80 border border-portage-500/30 backdrop-blur-xl">
            {/* Background hextech pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hextech-grid-login" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="currentColor" strokeWidth="0.5" className="text-portage-400" fill="none" />
                    <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-portage-400" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hextech-grid-login)" />
              </svg>
            </div>

            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-portage-500/10 via-portage-400/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative p-12">
              {/* Logo/Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-portage-400 blur-xl opacity-50" />
                  <Sparkles className="relative w-16 h-16 text-portage-400" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-tanker text-portage-200 tracking-wide mb-2">
                  Nebula 360
                </h1>
                <div className="h-px bg-gradient-to-r from-transparent via-portage-500/50 to-transparent mb-4" />
                <p className="text-portage-400/70 font-space-grotesk text-sm leading-relaxed">
                  Advanced Machine Learning Platform
                </p>
              </div>

              {/* Sign In Button - Styled version */}
              <div className="mt-8">
                <SignIn />
              </div>

              {/* Footer text */}
              <div className="mt-8 text-center">
                <p className="text-portage-400/50 font-space-grotesk text-xs">
                  Sign in to access your models and analytics
                </p>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-portage-400/40 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
