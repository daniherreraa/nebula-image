import { signIn } from "@/lib/auth";
import { Chrome } from "lucide-react";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", {redirectTo: "/app"});
      }}
    >
      <button
        className="relative group w-full overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/30 backdrop-blur-sm transition-all duration-300 hover:border-portage-400/60 cursor-pointer"
        type="submit"
      >
        {/* Hextech corners */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-portage-500/40 group-hover:border-portage-400/80 transition-colors duration-300" />

        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/0 via-portage-400/10 to-portage-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Button content */}
        <div className="relative px-6 py-4 flex items-center justify-center gap-3">
          <Chrome className="w-5 h-5 text-portage-400 group-hover:text-portage-300 transition-colors" />
          <span className="text-portage-300 font-space-grotesk font-medium group-hover:text-portage-200 transition-colors">
            Sign in with Google
          </span>
        </div>
      </button>
    </form>
  );
}
