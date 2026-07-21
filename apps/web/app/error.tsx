"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Next.js Error Boundary caught exception:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#0c1322] border border-slate-900 rounded-2xl p-8 shadow-xl shadow-black/40 animate-fade-in flex flex-col items-center text-center gap-6">
        {/* Visual Error Code */}
        <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-amber-500 font-extrabold text-lg select-none">
          500
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-white leading-tight">Runtime Exception</h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xs mt-1">
            An unexpected compile or network exception occurred inside your browser session workspace.
          </p>
        </div>

        {/* Actions grid */}
        <div className="w-full flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all active:scale-[0.98] shadow-md shadow-blue-500/10"
          >
            Retry Session
          </button>
          <button
            onClick={() => router.replace("/dashboard")}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold text-xs rounded-lg border border-slate-700 transition-all active:scale-[0.98]"
          >
            Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
