"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.data) {
          router.replace("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [router]);

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3001/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data) {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold">Loading session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b13] flex flex-col md:flex-row font-sans">
      {/* LEFT COLUMN: Visual Brand Illustration & Features */}
      <section className="flex-1 bg-gradient-to-br from-[#0c1222] to-[#080c16] border-r border-slate-900/60 p-8 sm:p-12 md:p-16 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_50%)]" />

        {/* Top Header Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/25 flex items-center justify-center text-white font-extrabold text-sm tracking-wider">
            TF
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">TaskFlow</h1>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Enterprise Workspace</span>
          </div>
        </div>

        {/* Central tagline description */}
        <div className="my-16 max-w-lg relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Streamline task delegation & enforce role permissions.
          </h2>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed font-medium">
            Manage projects, organize teams, track deliverables, and view real-time operations activity logs in a single compliant dashboard.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Role-Based Access Control</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Strict authorization boundaries and dynamic custom permissions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Operational Auditing & Logs</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Activity timeline feeds logging logins, updates, status, and role changes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Team Collaboration Workspace</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Detailed task cards with checklist trackers, attachments, and comments.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
          Compliant Secure HTTP-Only Cookie Protocol • v2026.1
        </div>
      </section>

      {/* RIGHT COLUMN: Sign In Center Card */}
      <section className="flex-1 flex items-center justify-center p-8 bg-[#070b13]">
        <div className="w-full max-w-sm flex flex-col gap-8 animate-fade-in">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              Provide credentials to access your workspace.
            </p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/40 text-red-400 p-3 rounded-lg text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={login} className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
            >
              {loading ? "Signing in..." : "Sign In to Workspace"}
            </button>
          </form>

          <div className="border-t border-slate-900 pt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an enterprise account?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-blue-400 hover:text-blue-300 transition-colors font-bold"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}