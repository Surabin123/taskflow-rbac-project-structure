"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#0c1322] border border-slate-900 rounded-2xl p-8 shadow-xl shadow-black/40 animate-fade-in flex flex-col items-center text-center gap-6">
        {/* Visual Error Code */}
        <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-red-500 font-extrabold text-lg select-none">
          404
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-white leading-tight">Resource Not Found</h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xs mt-1">
            The folder directory path or workspace link you are trying to access does not exist or has been deleted.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => router.replace("/dashboard")}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all active:scale-[0.98] shadow-md shadow-blue-500/10"
        >
          Return to Dashboard
        </button>
      </div>
    </main>
  );
}
