"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "../../components/DashboardLayout";
import { TaskDrawer } from "../../components/TaskDrawer";
import { Badge, Card, Button } from "../../components/UI";

export default function TasksPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState<"title" | "dueDate" | "priority" | "status">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer states
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const meRes = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });
      setUser(meRes.data);

      const res = await axios.get("http://localhost:3001/tasks", {
        withCredentials: true,
      });
      setTasks(res.data || []);

      const usersRes = await axios.get("http://localhost:3001/users", {
        withCredentials: true,
      });
      setUsersList(usersRes.data || []);

      const projRes = await axios.get("http://localhost:3001/enterprise/projects", {
        withCredentials: true,
      });
      setProjectsList(projRes.data || []);
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

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  if (loading) return null;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesProject = !projectFilter || task.projectId === Number(projectFilter);
    const matchesAssignee = !assigneeFilter || task.assignedToId === Number(assigneeFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === "dueDate") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      comparison = dateA - dateB;
    } else if (sortBy === "priority") {
      const priorityWeights: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      comparison = (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0);
    } else if (sortBy === "status") {
      const statusWeights: Record<string, number> = { TODO: 1, IN_PROGRESS: 2, DONE: 3 };
      comparison = (statusWeights[a.status] || 0) - (statusWeights[b.status] || 0);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="text-left border-b border-slate-900 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">
              Tasks Repository
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Filter deliverables backlog, sort fields, search descriptions, and inspect tasks details drawer.
            </p>
          </div>
        </div>

        {/* Filter Controls Row */}
        <Card className="p-4 flex flex-col gap-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="flex flex-col gap-1 lg:col-span-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Search backlog</span>
              <input
                placeholder="Search titles, descriptions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-900 text-xs text-white rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-900 text-xs text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="">-- All --</option>
                <option value="TODO">TO DO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Priority</span>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-900 text-xs text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="">-- All --</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Project Link</span>
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-900 text-xs text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="">-- All --</option>
                {projectsList.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Board table lists */}
        <Card className="text-left flex flex-col gap-4 overflow-x-auto">
          <table className="w-full text-xs text-slate-300 border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold select-none">
                <th align="left" className="py-3 cursor-pointer hover:text-slate-200" onClick={() => toggleSort("title")}>
                  Task Title {sortBy === "title" && (sortOrder === "asc" ? "(asc)" : "(desc)")}
                </th>
                <th align="left" className="py-3">Category</th>
                <th align="left" className="py-3">Assignee</th>
                <th align="left" className="py-3 cursor-pointer hover:text-slate-200" onClick={() => toggleSort("priority")}>
                  Priority {sortBy === "priority" && (sortOrder === "asc" ? "(asc)" : "(desc)")}
                </th>
                <th align="left" className="py-3 cursor-pointer hover:text-slate-200" onClick={() => toggleSort("dueDate")}>
                  Due Date {sortBy === "dueDate" && (sortOrder === "asc" ? "(asc)" : "(desc)")}
                </th>
                <th align="left" className="py-3 cursor-pointer hover:text-slate-200" onClick={() => toggleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "(asc)" : "(desc)")}
                </th>
                <th align="right" className="py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {currentTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No matching deliverables found in backlog directory.
                  </td>
                </tr>
              ) : (
                currentTasks.map((t) => {
                  const project = projectsList.find((p) => p.id === t.projectId);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleOpenTask(t.id)}
                      className="hover:bg-slate-850/20 transition-colors cursor-pointer select-none"
                    >
                      <td className="py-3.5 pr-4">
                        <span className="font-bold text-slate-100 block">{t.title}</span>
                        {project && (
                          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block mt-0.5">
                            {project.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {t.category ? (
                          <Badge variant="info">{t.category}</Badge>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-300">{t.assignedTo?.name || `User #${t.assignedToId}`}</td>
                      <td className="py-3.5">
                        <Badge variant={t.priority === "HIGH" ? "error" : t.priority === "MEDIUM" ? "warning" : "default"}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-slate-400 font-semibold">{t.dueDate || "No deadline"}</td>
                      <td className="py-3.5">
                        <Badge variant={t.status === "DONE" ? "success" : t.status === "IN_PROGRESS" ? "warning" : "default"}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-blue-400 font-bold hover:text-blue-300" align="right">
                        Inspect
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-slate-900 pt-4 select-none">
              <span className="text-[10px] text-slate-500 font-semibold">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  className="py-1 px-2.5 text-[10px]"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-6 h-6 rounded text-[10px] font-bold ${
                        currentPage === idx + 1 ? "bg-blue-600 text-white" : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  className="py-1 px-2.5 text-[10px]"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        <TaskDrawer
          taskId={selectedTaskId}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedTaskId(null);
          }}
          onTaskUpdated={loadPageData}
          currentUser={user}
        />
      </div>
    </DashboardLayout>
  );
}