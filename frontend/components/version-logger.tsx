"use client";

import { useEffect } from "react";

const VERSION = "1.0.0";
const GIT_COMMIT = "0d93276";
const BUILD_DATE = new Date().toISOString();

export default function VersionLogger() {
  useEffect(() => {
    console.log(
      "%c🚀 Nebula 360 ML Platform",
      "color: #8B7AB8; font-size: 20px; font-weight: bold;"
    );
    console.log(
      "%cVersion Information",
      "color: #A78BFA; font-size: 14px; font-weight: bold;"
    );
    console.log(`Version: ${VERSION}`);
    console.log(`Git Commit: ${GIT_COMMIT}`);
    console.log(`Build Date: ${BUILD_DATE}`);
    console.log(
      "%cBackend Health Check: https://nebulabackend.azurewebsites.net/health",
      "color: #60A5FA; font-size: 12px;"
    );
  }, []);

  return null; // This component doesn't render anything
}
