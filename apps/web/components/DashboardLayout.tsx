"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import { sidebarRoutes } from "../lib/routes";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (user && user.role !== "ADMIN" && pathname.startsWith("/admin")) {
      router.replace("/dashboard");
    }
  }, [pathname, user, router]);

  const fetchSession = async () => {
    try {
      const res = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });
      if (!res.data) {
        router.replace("/");
        return;
      }

      if (res.data.role !== "ADMIN" && pathname.startsWith("/admin")) {
        router.replace("/dashboard");
        return;
      }

      setUser(res.data);
      fetchNotifications();
    } catch (err) {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3001/enterprise/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data || []);
    } catch (err) {
      setNotifications([]);
    }
  };

  const markNotificationRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.patch(`http://localhost:3001/enterprise/notifications/${id}/read`, {}, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post("http://localhost:3001/enterprise/notifications/read-all", {}, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:3001/auth/logout", {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">Initializing Workspace...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const isSelected = (path: string, tab?: string) => {
    if (tab) {
      return pathname.startsWith(path) && searchParams.get("tab") === tab;
    }
    return pathname === path && !searchParams.get("tab");
  };

  const getSidebarItems = () => {
    const userPermissions = user.permissions || [];
    return sidebarRoutes
      .filter((route) => {
        if (route.allowedRoles && !route.allowedRoles.includes(user.role)) {
          return false;
        }
        if (route.requiredPermission && user.role !== "ADMIN") {
          return userPermissions.includes(route.requiredPermission);
        }
        return true;
      })
      .map((route) => ({
        label: route.label,
        href: route.path,
      }));
  };

  const sidebarItems = getSidebarItems();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigateItem = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-900 bg-[#0c1322]/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        {/* Left Logo branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          <div
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-extrabold text-xs tracking-wider transition-transform group-hover:scale-105 active:scale-95">
              TF
            </div>
            <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors hidden sm:inline-block">
              TaskFlow <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-950/80 border border-blue-900/60 px-1.5 py-0.5 rounded-full ml-1">RBAC</span>
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks, projects, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3.5 py-1.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder-slate-500 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Actions section */}
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#0c1322]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                <div className="flex justify-between items-center px-4 py-2.5 bg-slate-950/60 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Notifications ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-850/50 flex flex-col gap-1 ${
                          !n.read ? "bg-blue-950/10" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-semibold ${!n.read ? "text-slate-100" : "text-slate-400"}`}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <button
                              onClick={(e) => markNotificationRead(n.id, e)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 font-bold p-0.5 rounded"
                              title="Mark Read"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                        <p className="text-slate-400 leading-normal">{n.message}</p>
                        <span className="text-[9px] text-slate-600 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()} at{" "}
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-left focus:outline-none"
            >
              <img
                src={
                  user.profilePicture ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop"
                }
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-700 bg-slate-850 object-cover"
              />
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase().replace("_", " ")}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-fade-in divide-y divide-slate-800">
                <div className="p-3">
                  <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1.5">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase bg-blue-950 border border-blue-900/60 text-blue-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Profile Settings
                  </button>
                  {user.role === "ADMIN" && (
                    <button
                      onClick={() => {
                        router.push("/admin?tab=settings");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      System Config
                    </button>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Workspace Wrapper */}
      <div className="flex flex-1 relative">
        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Left Navigation */}
        <aside
          className={`w-52 border-r border-slate-900 bg-[#070b13] flex flex-col justify-between py-5 px-3 z-30
            fixed top-14 bottom-0 left-0 transition-transform duration-300 md:translate-x-0 md:sticky md:top-14 md:h-[calc(100vh-56px)]
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex flex-col gap-5">
            <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2">
              Navigation
            </div>

            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => {
                const pathParts = item.href.split("?tab=");
                const pathNamePart = pathParts[0];
                const tabPart = pathParts[1];
                const active = isSelected(pathNamePart, tabPart);

                return (
                  <button
                    key={item.label}
                    onClick={() => navigateItem(item.href)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 text-left group
                      ${
                        active
                          ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-2.5"
                          : "text-slate-400 hover:bg-slate-850/50 hover:text-slate-200 border-l-2 border-transparent"
                      }
                    `}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Session footer */}
          <div className="border-t border-slate-900 pt-4 px-2 hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                Session Active
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase">
              Initializing Layout...
            </p>
          </div>
        </main>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
};
