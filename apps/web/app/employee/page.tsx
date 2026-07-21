"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "../../components/DashboardLayout";
import { TaskDrawer } from "../../components/TaskDrawer";
import { Badge, Card } from "../../components/UI";

export default function EmployeePage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkEmployeeAuth();
  }, []);

  const checkEmployeeAuth = async () => {
    try {
      const res = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });

      if (!res.data) {
        router.replace("/");
        return;
      }

      setUser(res.data);
      loadEmployeeTasks();
    } catch (err) {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3001/tasks", {
        withCredentials: true,
      });
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    try {
      await axios.patch(
        `http://localhost:3001/tasks/${taskId}`,
        { status },
        { withCredentials: true }
      );
      loadEmployeeTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setDrawerOpen(true);
  };

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col gap-6">
        {/* Banner */}
        <div className="text-left border-b border-slate-900 pb-4">
          <h1 className="text-xl font-bold text-white">
            Staff Workplace
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Review your deliverables backlog, track checklists progress, and sync status updates.
          </p>
        </div>

        {/* Deliverables Board Card */}
        <Card className="text-left flex flex-col gap-4 overflow-x-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">My Assigned Deliverables</h3>
            <span className="text-[10px] text-slate-500 font-bold">{tasks.length} active assignments</span>
          </div>

          <table className="w-full text-xs text-slate-300 border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                <th align="left" className="py-2.5">Task Title</th>
                <th align="left" className="py-2.5">Priority</th>
                <th align="left" className="py-2.5">Due Date</th>
                <th align="left" className="py-2.5">Status Update</th>
                <th align="right" className="py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No pending assignments on your plate.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => handleOpenTask(task.id)}
                    className="hover:bg-slate-850/20 transition-colors cursor-pointer select-none"
                  >
                    <td className="py-3.5 pr-4">
                      <span className="font-bold text-slate-100 block">{task.title}</span>
                      {task.description && (
                        <p className="text-[10px] text-slate-500 mt-0.5 max-w-sm truncate">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5">
                      <Badge variant={task.priority === "HIGH" ? "error" : task.priority === "MEDIUM" ? "warning" : "default"}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-slate-400 font-semibold">{task.dueDate || "No deadline"}</td>
                    <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value, e)}
                        className={`bg-slate-950 border border-slate-900 text-[10px] font-bold rounded px-2 py-1 outline-none cursor-pointer
                          ${
                            task.status === "DONE"
                              ? "text-emerald-400 border-emerald-950"
                              : task.status === "IN_PROGRESS"
                              ? "text-amber-400 border-amber-950"
                              : "text-slate-400"
                          }
                        `}
                      >
                        <option value="TODO" className="text-red-400 bg-slate-950">TO DO</option>
                        <option value="IN_PROGRESS" className="text-amber-400 bg-slate-950">IN PROGRESS</option>
                        <option value="DONE" className="text-emerald-400 bg-slate-950">DONE</option>
                      </select>
                    </td>
                    <td className="py-3.5 text-blue-400 font-bold hover:text-blue-300" align="right">
                      Inspect & Collaborate
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Slide-over details drawer */}
        <TaskDrawer
          taskId={selectedTaskId}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedTaskId(null);
          }}
          onTaskUpdated={loadEmployeeTasks}
          currentUser={user}
        />
      </div>
    </DashboardLayout>
  );
}