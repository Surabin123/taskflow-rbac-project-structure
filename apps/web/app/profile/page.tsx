"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, Input, Select, Button } from "../../components/UI";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit details form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password reset form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const router = useRouter();

  const avatarChoices = [
    { value: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop", label: "Default Avatar" },
    { value: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop", label: "Executive Lead" },
    { value: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop", label: "Tech Professional" },
    { value: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop", label: "Design Expert" },
    { value: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop", label: "Operation Coordinator" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });

      if (!res.data) {
        router.replace("/");
        return;
      }

      setUser(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
      setPhone(res.data.phone || "");
      setDepartment(res.data.department || "");
      setAvatar(res.data.profilePicture || avatarChoices[0].value);
    } catch (err) {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");

    if (!name || !email) {
      setProfileError("Name and email are required fields.");
      return;
    }

    setProfileLoading(true);

    try {
      await axios.patch(
        `http://localhost:3001/users/${user.id}/profile`,
        {
          name,
          email,
          phone,
          department,
          profilePicture: avatar,
        },
        { withCredentials: true }
      );
      setProfileMsg("Profile updated successfully! Refreshing session...");
      window.location.reload();
    } catch (err: any) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg("");
    setPassError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Confirm password does not match new password.");
      return;
    }

    setPassLoading(true);

    try {
      await axios.patch(
        `http://localhost:3001/users/${user.id}/password`,
        {
          oldPassword,
          newPassword,
        },
        { withCredentials: true }
      );
      setPassMsg("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError(
        err.response?.data?.message || "Failed to update password. Please check your credentials."
      );
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col gap-6">
        {/* Header Title */}
        <div className="text-left border-b border-slate-900 pb-4">
          <h1 className="text-xl font-bold text-white">
            Profile & Account Configuration
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure your professional workspace profile details, select avatar items, and modify security passwords.
          </p>
        </div>

        {/* Dual Form block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PROFILE CARD */}
          <Card className="lg:col-span-2 text-left flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workspace Profile Details</h3>

            {profileMsg && <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded text-xs">{profileMsg}</div>}
            {profileError && <div className="p-2.5 bg-red-950/40 text-red-400 border border-red-900/40 rounded text-xs">{profileError}</div>}

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-slate-950/20 p-4 border border-slate-900 rounded-xl">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-full border border-slate-800 object-cover"
                />
                <div className="flex-1">
                  <Select
                    label="Workspace Avatar Selector"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    options={avatarChoices}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Display Name *"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Select
                  label="Department / Team Scope"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={[
                    { value: "General Staff", label: "General Staff" },
                    { value: "Frontend", label: "Frontend Development" },
                    { value: "Backend", label: "Backend Development" },
                    { value: "Design", label: "UI/UX Design" },
                    { value: "QA", label: "QA & Compliance" },
                    { value: "Management", label: "Engineering Management" },
                    { value: "Operations", label: "IT Operations" },
                  ]}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" loading={profileLoading} className="text-xs py-2 px-4 shadow-md shadow-blue-500/10">
                  Update Profile Details
                </Button>
              </div>
            </form>
          </Card>

          {/* PASSWORD CARD */}
          <Card className="text-left flex flex-col gap-4 h-fit">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Modify Security Password</h3>

            {passMsg && <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded text-xs">{passMsg}</div>}
            {passError && <div className="p-2.5 bg-red-950/40 text-red-400 border border-red-900/40 rounded text-xs">{passError}</div>}

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
              <Input
                label="Current Password *"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <Input
                label="New Password *"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password *"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button variant="primary" type="submit" loading={passLoading} className="mt-2 text-xs py-2">
                Confirm Password Update
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
