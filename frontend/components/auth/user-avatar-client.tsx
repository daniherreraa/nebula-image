// components/auth/user-avatar-client.tsx
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LogOut, Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/app/context/theme-context";

interface UserSession {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const UserAvatarClient = () => {
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch session from API route
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full border-2 border-portage-500/40 bg-portage-500/20 animate-pulse" />
    );
  }

  if (!session?.user) return null;

  const userInitials = session.user.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleSignOut = async () => {
    try {
      // Get CSRF token
      const csrfResponse = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfResponse.json();

      // Call signout endpoint
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          csrfToken,
          callbackUrl: "/",
        }),
      });

      // Force a full page reload to clear all client state and redirect
      window.location.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: force reload to home
      window.location.replace("/");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative group">
          <Avatar className="w-9 h-9 border-2 border-portage-500/40 hover:border-portage-400/80 transition-colors cursor-pointer">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback className="bg-portage-500/20 text-portage-200 font-space-grotesk text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 border-0 shadow-none"
        align="end"
        sideOffset={8}
      >
        {/* Hextech styled popover */}
        <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hextech-grid-avatar-client" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="currentColor" strokeWidth="0.5" className="text-portage-400" fill="none" />
                  <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-portage-400" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hextech-grid-avatar-client)" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5 pointer-events-none" />

          <div className="relative p-4">
            {/* User info */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12 border-2 border-portage-500/40">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback className="bg-portage-500/20 text-portage-200 font-space-grotesk">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-portage-200 font-space-grotesk text-sm font-medium truncate">
                  {session.user.name}
                </p>
                <p className="text-portage-400/70 font-space-grotesk text-xs truncate">
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-portage-500/30 to-transparent mb-3" />

            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="relative group w-full text-left transition-all duration-300 mb-2"
            >
              {/* Hextech corners */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

              <div className="relative px-3 py-2 bg-woodsmoke-900/50 border border-portage-500/20 group-hover:border-portage-400/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-portage-500/0 via-portage-400/5 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 text-portage-400" />
                    ) : theme === "light" ? (
                      <Moon className="w-4 h-4 text-portage-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-portage-300 font-space-grotesk text-sm">
                      {theme === "dark" ? "Light Mode" : theme === "light" ? "Piltover Day" : "Dark Mode"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-portage-400' : 'bg-woodsmoke-600'}`} />
                    <div className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-portage-400' : 'bg-woodsmoke-600'}`} />
                    <div className={`w-2 h-2 rounded-full ${theme === 'piltover-day' ? 'bg-amber-400' : 'bg-woodsmoke-600'}`} />
                  </div>
                </div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              type="button"
              className="relative group w-full text-left transition-all duration-300"
            >
              {/* Hextech corners */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

              <div className="relative px-3 py-2 bg-woodsmoke-900/50 border border-portage-500/20 group-hover:border-portage-400/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-portage-500/0 via-portage-400/5 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-portage-400 group-hover:text-portage-300 transition-colors" />
                  <span className="text-portage-300 font-space-grotesk text-sm group-hover:text-portage-200 transition-colors">
                    Sign Out
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAvatarClient;
