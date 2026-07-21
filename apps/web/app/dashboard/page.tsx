"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "../../components/DashboardLayout";
import { TaskDrawer } from "../../components/TaskDrawer";
import { Card, Button, Badge } from "../../components/UI";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Calendar states (Employee Only)
  const [currentDate, setCurrentDate] = useState(new Date());

  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });
      setUser(userRes.data);

      const tasksRes = await axios.get("http://localhost:3001/tasks", {
        withCredentials: true,
      });
      setTasks(tasksRes.data || []);

      if (userRes.data.role === "ADMIN") {
        const usersRes = await axios.get("http://localhost:3001/users", {
          withCredentials: true,
        });
        setUsersList(usersRes.data || []);

        const projRes = await axios.get("http://localhost:3001/enterprise/projects", {
          withCredentials: true,
        });
        setProjectsList(projRes.data || []);

        const teamsRes = await axios.get("http://localhost:3001/enterprise/teams", {
          withCredentials: true,
        });
        setTeamsList(teamsRes.data || []);

        const logsRes = await axios.get("http://localhost:3001/enterprise/activity-logs", {
          withCredentials: true,
        });
        setLogs(logsRes.data || []);
      }
    } catch (err) {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col gap-6 animate-pulse p-4">
          <div className="h-28 bg-slate-900 border border-slate-850 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="h-24 bg-slate-900 border border-slate-850 rounded-xl" />
            <div className="h-24 bg-slate-900 border border-slate-850 rounded-xl" />
            <div className="h-24 bg-slate-900 border border-slate-850 rounded-xl" />
            <div className="h-24 bg-slate-900 border border-slate-850 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            <div className="md:col-span-2 h-96 bg-slate-900 border border-slate-850 rounded-xl" />
            <div className="h-96 bg-slate-900 border border-slate-850 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const role = user.role;

  // Render Admin Dashboard
  const renderAdminDashboard = () => {
    const todoCount = tasks.filter((t) => t.status === "TODO").length;
    const progressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const doneCount = tasks.filter((t) => t.status === "DONE").length;
    const totalCount = tasks.length;

    const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    return (
      <div className="flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-[#0e1628] border border-blue-900/20 rounded-xl p-6 text-left relative overflow-hidden">
          <h2 className="text-xl font-bold text-white">System Operations Center</h2>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xl font-medium">
            Welcome back, Administrator. Enforce roles, oversee task dispatch, and monitor real-time security activities.
          </p>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-left flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Users</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-white">{usersList.length}</span>
              <span className="text-[10px] text-emerald-500 font-semibold">Registered</span>
            </div>
          </Card>
          <Card className="text-left flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Projects</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-white">{projectsList.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">Monitored</span>
            </div>
          </Card>
          <Card className="text-left flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Tasks</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-white">{totalCount}</span>
              <span className="text-[10px] text-blue-500 font-medium">{donePercent}% completed</span>
            </div>
          </Card>
          <Card className="text-left flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teams Registered</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-white">{teamsList.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">Assigned</span>
            </div>
          </Card>
        </div>

        {/* Primary Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 text-left flex flex-col gap-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workspace Task Status</h3>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0f172a" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${donePercent} ${100 - donePercent}`}
                    strokeDashoffset="0"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-white">{donePercent}%</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Done</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block leading-none font-semibold">COMPLETED</span>
                    <span className="text-xs font-bold text-white mt-1 block">{doneCount} tasks</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block leading-none font-semibold">IN PROGRESS</span>
                    <span className="text-xs font-bold text-white mt-1 block">{progressCount} tasks</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block leading-none font-semibold">TO DO</span>
                    <span className="text-xs font-bold text-white mt-1 block">{todoCount} tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="text-left flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 text-xs font-semibold py-2"
                onClick={() => router.push("/admin?tab=users")}
              >
                Create & Manage Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 text-xs font-semibold py-2"
                onClick={() => router.push("/admin?tab=teams")}
              >
                Setup Work Teams
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 text-xs font-semibold py-2"
                onClick={() => router.push("/admin?tab=projects")}
              >
                Register Project Scope
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 text-xs font-semibold py-2"
                onClick={() => router.push("/admin?tab=roles")}
              >
                Roles & Permissions Matrix
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-2 text-xs font-semibold py-2 mt-1 shadow-md shadow-blue-500/10"
                onClick={() => router.push("/admin?tab=users")}
              >
                Admin Security Center
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="text-left flex flex-col gap-4 max-h-96 overflow-hidden">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Real-time Activity Logs</h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500">No activity logged.</p>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <div key={log.id} className="flex gap-2 items-start border-b border-slate-900 pb-2">
                    <span className="text-slate-500 text-xs font-bold mt-0.5">•</span>
                    <div className="text-left">
                      <div className="text-xs text-slate-300">
                        <span className="font-bold text-white">{log.userName}</span>: {log.action}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{log.details}</p>
                      <span className="text-[9px] text-slate-600 block mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="text-left flex flex-col gap-4 max-h-96 overflow-hidden">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recently Delegated Tasks</h3>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500">No tasks delegated.</p>
              ) : (
                tasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="flex justify-between items-center p-2.5 bg-slate-950/20 border border-slate-900 rounded-lg hover:border-slate-800 transition-colors cursor-pointer select-none"
                  >
                    <div className="text-left max-w-[240px]">
                      <span className="text-xs font-bold text-slate-200 block truncate">{task.title}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
                        To: {task.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                    <Badge variant={task.status === "DONE" ? "success" : task.status === "IN_PROGRESS" ? "warning" : "default"}>
                      {task.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Render Employee Dashboard
  const renderEmployeeDashboard = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    const calendarCells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      calendarCells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      calendarCells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
    }

    const todoTasks = tasks.filter((t) => t.status === "TODO");
    const progressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
    const completedTasks = tasks.filter((t) => t.status === "DONE");

    let profileScore = 40;
    if (user.phone) profileScore += 30;
    if (user.department && user.department !== "General Staff") profileScore += 30;

    return (
      <div className="flex flex-col gap-6">
        <div className="bg-gradient-to-r from-blue-900/10 via-[#0a0f1d] to-[#0c1421] border border-slate-900 rounded-xl p-5 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-left">
            <h2 className="text-xl font-bold text-white">Workplace Dashboard</h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
              Hello, {user.name}. Logged in role: <span className="font-bold text-blue-400">{user.role}</span>.
            </p>
          </div>
          <div className="w-full sm:w-48 text-left">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1 select-none">
              <span>Profile Setup</span>
              <span>{profileScore}%</span>
            </div>
            <div className="w-full h-1 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${profileScore}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <Card className="text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Assignments</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{todoTasks.length + progressTasks.length}</h2>
          </Card>
          <Card className="text-left">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Completed Deliverables</span>
            <h2 className="text-2xl font-extrabold text-emerald-500 mt-1">{completedTasks.length}</h2>
          </Card>
          <Card className="text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Assigned Tasks</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">{tasks.length}</h2>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 text-left flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deliverables Due Calendar</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="px-2 py-1 bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-300 rounded hover:bg-slate-900 transition-colors uppercase"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide px-1">
                  {currentDate.toLocaleString("default", { month: "short", year: "numeric" })}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="px-2 py-1 bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-300 rounded hover:bg-slate-900 transition-colors uppercase"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span key={day} className="text-[10px] font-bold text-slate-600 uppercase py-1">
                  {day}
                </span>
              ))}

              {calendarCells.map((dateObj, idx) => {
                if (!dateObj) return <div key={`pad-${idx}`} className="aspect-square bg-slate-950/10 rounded" />;

                const dateStr = dateObj.toISOString().split("T")[0];
                const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

                return (
                  <div
                    key={`day-${dateStr}`}
                    className="aspect-square bg-slate-950/40 border border-slate-900/60 rounded p-1 flex flex-col justify-between items-start min-h-[46px]"
                  >
                    <span className="text-[9px] font-bold text-slate-500">{dateObj.getDate()}</span>
                    <div className="w-full flex flex-col gap-0.5 mt-0.5">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleOpenTask(t.id)}
                          title={t.title}
                          className="w-full text-[8px] truncate bg-blue-600/10 border border-blue-900/30 text-blue-400 font-bold px-1 rounded cursor-pointer leading-tight py-0.5 select-none"
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="text-left flex flex-col gap-4 max-h-[450px] overflow-hidden">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">My Pending Workload</h3>
            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
              {[...todoTasks, ...progressTasks].length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  No pending deliverables. You are fully caught up!
                </div>
              ) : (
                [...todoTasks, ...progressTasks].map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="p-3 bg-slate-950/20 border border-slate-900 hover:border-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-200 block truncate max-w-[170px]">{task.title}</span>
                      <Badge variant={task.status === "IN_PROGRESS" ? "warning" : "default"}>
                        {task.status === "IN_PROGRESS" ? "Progress" : "To Do"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[10px] text-slate-600 font-bold">DUE: {task.dueDate || "N/A"}</span>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                        Inspect
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col py-1">
        {role === "ADMIN" ? renderAdminDashboard() : renderEmployeeDashboard()}

        <TaskDrawer
          taskId={selectedTaskId}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedTaskId(null);
          }}
          onTaskUpdated={fetchDashboardData}
          currentUser={user}
        />
      </div>
    </DashboardLayout>
  );
}