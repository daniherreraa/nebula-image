const StatusBar = ({ filename, rows, columns }: { filename: string; rows: number; columns: number }) => {
  return (
    <div className="mt-6 relative">
      {/* Compact status bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-woodsmoke-950/60 via-woodsmoke-950/90 to-woodsmoke-950/60 border border-portage-500/20 backdrop-blur-sm">
        {/* Subtle hextech glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-portage-500/5 via-portage-400/10 to-portage-500/5" />

        {/* Content - responsive layout */}
        <div className="relative px-4 sm:px-5 py-3 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          {/* Filename - full width on mobile */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-500/50" />
            <span className="text-portage-300/70 text-xs font-space-grotesk uppercase tracking-wider">
              Filename:
            </span>
            <span className="text-woodsmoke-50 font-space-grotesk text-sm font-medium truncate">
              {filename}
            </span>
          </div>

          {/* Horizontal divider for mobile, vertical for desktop */}
          <div className="h-px sm:h-4 sm:w-px bg-portage-500/30" />

          {/* Rows & Columns container - same row on mobile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Rows */}
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-500/50"
                style={{ animationDelay: "0.3s" }}
              />
              <span className="text-portage-300/70 text-xs font-space-grotesk uppercase tracking-wider">
                Rows:
              </span>
              <span className="text-woodsmoke-50 font-space-grotesk text-sm font-medium tabular-nums">
                {rows.toLocaleString()}
              </span>
            </div>

            {/* Divider between rows and columns */}
            <div className="w-px h-4 bg-portage-500/30" />

            {/* Columns */}
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full bg-portage-400 animate-pulse shadow-lg shadow-portage-500/50"
                style={{ animationDelay: "0.6s" }}
              />
              <span className="text-portage-300/70 text-xs font-space-grotesk uppercase tracking-wider">
                Columns:
              </span>
              <span className="text-woodsmoke-50 font-space-grotesk text-sm font-medium tabular-nums">
                {columns}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom hextech accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-portage-500/40 to-transparent" />
      </div>
    </div>
  );
};

export default StatusBar;
