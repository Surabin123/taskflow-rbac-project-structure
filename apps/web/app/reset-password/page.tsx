"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  const getPasswordStrength = () => {
    if (!password) return { label: "None", color: "bg-slate-800", width: "w-0" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", width: "w-1/2" };
      case 3:
        return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
      default:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    }
  };

  const strength = getPasswordStrength();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/auth/reset-password", {
        token,
        password,
      });

      if (res.data) {
        setSuccess("Password updated successfully! Redirecting to Sign In...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to reset password. Please request a new token."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-[#0c1322] border border-slate-900 rounded-2xl p-8 shadow-xl shadow-black/40 animate-fade-in flex flex-col gap-6 font-sans">
      <div className="text-left">
        <h2 className="text-xl font-bold text-white">Reset Password</h2>
        <p className="text-slate-500 text-xs mt-1">
          Provide your recovery token and define a new secure password.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3 rounded-lg text-xs leading-relaxed font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-3 rounded-lg text-xs leading-relaxed font-medium">
          {success}
        </div>
      )}

      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Recovery Token *</label>
          <input
            type="text"
            required
            placeholder="6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">New Password *</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>

        {password && (
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
              <span>Password Strength</span>
              <span className="text-slate-300">{strength.label}</span>
            </div>
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Confirm Password *</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
        >
          {loading ? "Resetting password..." : "Confirm Password Reset"}
        </button>
      </form>

      <div className="border-t border-slate-900 pt-5 text-center">
        <p className="text-xs text-slate-500 font-medium">
          Remembered your credentials?{" "}
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 hover:text-blue-400 transition-colors font-bold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <main className="min-h-screen bg-[#070b13] flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="text-slate-400 font-sans text-xs font-semibold uppercase tracking-wider">
          Loading Reset Form...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
