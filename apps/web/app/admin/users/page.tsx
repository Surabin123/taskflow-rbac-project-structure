"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin?tab=users");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Redirecting...</p>
      </div>
    </div>
  );
}
