"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ErrorState {
  hasError: boolean;
  errorMessage: string | null;
  errorType: "user" | "platform" | "network" | null;
}

interface ErrorThemeContextType {
  errorState: ErrorState;
  setError: (message: string, type?: "user" | "platform" | "network") => void;
  clearError: () => void;
  themeColor: "portage" | "carnation";
}

const ErrorThemeContext = createContext<ErrorThemeContextType | undefined>(undefined);

export function ErrorThemeProvider({ children }: { children: React.ReactNode }) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    errorMessage: null,
    errorType: null,
  });

  const setError = useCallback((message: string, type: "user" | "platform" | "network" = "platform") => {
    setErrorState({
      hasError: true,
      errorMessage: message,
      errorType: type,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorMessage: null,
      errorType: null,
    });
  }, []);

  const themeColor = errorState.hasError ? "carnation" : "portage";

  return (
    <ErrorThemeContext.Provider value={{ errorState, setError, clearError, themeColor }}>
      {children}
    </ErrorThemeContext.Provider>
  );
}

export function useErrorTheme() {
  const context = useContext(ErrorThemeContext);
  if (context === undefined) {
    throw new Error("useErrorTheme must be used within an ErrorThemeProvider");
  }
  return context;
}
