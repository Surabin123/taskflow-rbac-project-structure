"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
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
      const res = await axios.post("http://localhost:3001/auth/register", {
        name: `${firstName} ${lastName}`,
        email,
        password,
        role: "EMPLOYEE",
      });

      if (res.data) {
        setSuccess("Account created successfully! Redirecting to Sign In...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b13] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#0c1322] border border-slate-900 rounded-2xl p-8 shadow-xl shadow-black/40 animate-fade-in flex flex-col gap-6">
        {/* Header */}
        <div className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-extrabold tracking-wider">TF</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enterprise Network</span>
          </div>
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1">Get started with your collaborative workspace.</p>
        </div>

        {/* Alerts */}
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

        {/* Register Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">First Name *</label>
              <input
                type="text"
                required
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Username</label>
            <input
              type="text"
              placeholder="janedoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address *</label>
            <input
              type="email"
              required
              placeholder="jane.doe@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Role Selection</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white outline-none transition-all cursor-pointer"
              >
                <option value="EMPLOYEE" className="bg-slate-950">Employee (Staff)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Phone (Optional)</label>
              <input
                type="text"
                placeholder="+1 (555) 0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-900/60 border border-slate-850 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {password && (
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Password Strength</span>
                <span className="text-slate-300">{strength.label}</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
          >
            {loading ? "Registering account..." : "Register Enterprise Account"}
          </button>
        </form>

        <div className="border-t border-slate-900 pt-5 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{" "}
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
