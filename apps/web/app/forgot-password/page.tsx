"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setToken("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/auth/forgot-password", {
        email,
      });

      if (res.data) {
        setSuccess("A password reset token has been generated.");
        setToken(res.data.token);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to request password reset."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#0c1322] border border-slate-900 rounded-2xl p-8 shadow-xl shadow-black/40 animate-fade-in flex flex-col gap-6">
        <div className="text-left">
          <h2 className="text-xl font-bold text-white">Forgot Password</h2>
          <p className="text-slate-500 text-xs mt-1">
            Enter your email to request an authentication reset token.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3 rounded-lg text-xs leading-relaxed font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-3 rounded-lg text-xs flex flex-col gap-2">
            <span className="leading-relaxed font-medium">{success}</span>
            {token && (
              <div className="mt-2 bg-slate-950/60 p-2.5 border border-slate-900 rounded text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  MOCK EMAIL RESET TOKEN
                </span>
                <span className="text-base font-extrabold text-blue-400 tracking-widest">
                  {token}
                </span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleRequestToken} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
          >
            {loading ? "Requesting token..." : "Generate Reset Token"}
          </button>
        </form>

        {token && (
          <button
            onClick={() => router.push(`/reset-password?token=${token}`)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-all active:scale-[0.98]"
          >
            Proceed to Reset Password
          </button>
        )}

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
    </main>
  );
}
