"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Button, Input, Select, Badge, Card, Textarea } from "../../components/UI";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [rolesMap, setRolesMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "teams" | "projects" | "roles" | "settings">("users");

  // Create User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("EMPLOYEE");
  const [userMsg, setUserMsg] = useState("");
  const [userError, setUserError] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  // Create Team Form State
  const [teamName, setTeamName] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [teamMsg, setTeamMsg] = useState("");
  const [teamError, setTeamError] = useState("");

  // Create Project Form State
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectMsg, setProjectMsg] = useState("");
  const [projectError, setProjectError] = useState("");

  // Roles & Permissions State
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleMsg, setRoleMsg] = useState("");
  const [roleError, setRoleError] = useState("");

  const availablePermissions = [
    { id: "users.create", label: "Create Users" },
    { id: "users.edit", label: "Edit Users" },
    { id: "users.delete", label: "Delete Users" },
    { id: "tasks.create", label: "Create Tasks" },
    { id: "tasks.edit", label: "Edit Tasks" },
    { id: "tasks.delete", label: "Delete Tasks" },
    { id: "projects.manage", label: "Manage Projects & Teams" },
    { id: "reports.view", label: "View Reports & Logs" },
    { id: "settings.manage", label: "Manage Workspace Settings" },
  ];

  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });

      if (!res.data || res.data.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }

      setUser(res.data);
      loadAdminData();
    } catch (err) {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const usersRes = await axios.get("http://localhost:3001/users", { withCredentials: true });
      setUsersList(usersRes.data || []);

      const tasksRes = await axios.get("http://localhost:3001/tasks", { withCredentials: true });
      setTasksList(tasksRes.data || []);

      const teamsRes = await axios.get("http://localhost:3001/enterprise/teams", { withCredentials: true });
      setTeamsList(teamsRes.data || []);

      const projRes = await axios.get("http://localhost:3001/enterprise/projects", { withCredentials: true });
      setProjectsList(projRes.data || []);

      const logsRes = await axios.get("http://localhost:3001/enterprise/activity-logs", { withCredentials: true });
      setActivityLogs(logsRes.data || []);

      const settingsRes = await axios.get("http://localhost:3001/enterprise/settings", { withCredentials: true });
      setSystemSettings(settingsRes.data || null);

      const rolesRes = await axios.get("http://localhost:3001/enterprise/roles", { withCredentials: true });
      setRolesMap(rolesRes.data || {});
    } catch (err) {
      console.error("Failed loading admin datasets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg("");
    setUserError("");

    if (!newUserName || !newUserEmail) {
      setUserError("Please provide name and email.");
      return;
    }

    setUserLoading(true);
    try {
      await axios.post(
        "http://localhost:3001/users",
        {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword || "password123",
          role: newUserRole,
        },
        { withCredentials: true }
      );

      setUserMsg("User created successfully!");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      loadAdminData();
    } catch (err: any) {
      setUserError(err.response?.data?.message || "Failed to create user");
    } finally {
      setUserLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await axios.patch(
        `http://localhost:3001/users/${userId}/role`,
        { role },
        { withCredentials: true }
      );
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? All associated tasks will be removed.")) return;
    try {
      await axios.delete(`http://localhost:3001/users/${userId}`, {
        withCredentials: true,
      });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      await axios.patch(`http://localhost:3001/users/${userId}/suspend`, {}, { withCredentials: true });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      await axios.patch(`http://localhost:3001/users/${userId}/activate`, {}, { withCredentials: true });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignManager = async (userId: number, managerIdStr: string) => {
    const managerId = managerIdStr ? Number(managerIdStr) : null;
    try {
      await axios.patch(
        `http://localhost:3001/users/${userId}/manager`,
        { managerId },
        { withCredentials: true }
      );
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Teams CRUD
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamMsg("");
    setTeamError("");

    if (!teamName || !teamLeadId) {
      setTeamError("Team name and manager lead choice are required.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/enterprise/teams",
        {
          name: teamName,
          leadId: Number(teamLeadId),
        },
        { withCredentials: true }
      );
      setTeamMsg("Team initialized successfully.");
      setTeamName("");
      setTeamLeadId("");
      loadAdminData();
    } catch (err: any) {
      setTeamError(err.response?.data?.message || "Failed to create team.");
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await axios.delete(`http://localhost:3001/enterprise/teams/${id}`, { withCredentials: true });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Projects CRUD
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectMsg("");
    setProjectError("");

    if (!projectName) {
      setProjectError("Project name is required.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/enterprise/projects",
        {
          name: projectName,
          description: projectDesc,
        },
        { withCredentials: true }
      );
      setProjectMsg("Project registered successfully.");
      setProjectName("");
      setProjectDesc("");
      loadAdminData();
    } catch (err: any) {
      setProjectError(err.response?.data?.message || "Failed to create project.");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://localhost:3001/enterprise/projects/${id}`, { withCredentials: true });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Roles CRUD
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleMsg("");
    setRoleError("");

    if (!newRoleName.trim()) {
      setRoleError("Role name is required.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/enterprise/roles",
        {
          name: newRoleName.trim(),
          permissions: selectedPermissions,
        },
        { withCredentials: true }
      );
      setRoleMsg(`Role "${newRoleName.toUpperCase()}" created successfully.`);
      setNewRoleName("");
      setSelectedPermissions([]);
      loadAdminData();
    } catch (err: any) {
      setRoleError(err.response?.data?.message || "Failed to create custom role.");
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (!confirm(`Are you sure you want to delete custom role "${roleName}"?`)) return;
    try {
      await axios.delete(`http://localhost:3001/enterprise/roles/${roleName}`, { withCredentials: true });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  // Settings
  const handleToggleSettings = async (field: string, val: boolean) => {
    try {
      const updated = { ...systemSettings, [field]: val };
      setSystemSettings(updated);
      await axios.patch("http://localhost:3001/enterprise/settings", { [field]: val }, { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  const roleOptions = Object.keys(rolesMap).map((r) => ({
    value: r,
    label: r === "ADMIN" ? "Administrator" : r === "EMPLOYEE" ? "Employee (Staff)" : r,
  }));

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-900 pb-4">
          <div className="text-left">
            <h1 className="text-xl font-bold text-white">
              Administrative Control Center
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Superuser workspace management matrix. Enforce RBAC security, manage roles, and audit operations.
            </p>
          </div>
          {/* Tab Selection */}
          <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-lg shrink-0 select-none overflow-x-auto">
            {["users", "teams", "projects", "roles", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-colors capitalize ${
                  activeTab === tab ? "bg-blue-600 text-white font-extrabold" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tab Body Render */}

        {/* TAB 1: USERS ADMINISTRATION */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 flex flex-col gap-4">
              <Card className="text-left flex flex-col gap-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">User Directory</h3>
                  <span className="text-[10px] text-slate-500 font-bold">{usersList.length} users registered</span>
                </div>

                <table className="w-full text-xs text-slate-300 border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                      <th align="left" className="py-2.5">User</th>
                      <th align="left" className="py-2.5">Role</th>
                      <th align="left" className="py-2.5">Manager Lead</th>
                      <th align="left" className="py-2.5">Status</th>
                      <th align="right" className="py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-850/20 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop"}
                              alt={u.name}
                              className="w-7 h-7 rounded-full border border-slate-800 object-cover"
                            />
                            <div className="text-left">
                              <div className="font-bold text-slate-100">{u.name}</div>
                              <div className="text-[10px] text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {Object.keys(rolesMap).map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            value={u.managerId || ""}
                            onChange={(e) => handleAssignManager(u.id, e.target.value)}
                            className="bg-slate-950 border border-slate-900 text-[10px] font-semibold text-slate-400 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer max-w-[150px] truncate"
                          >
                            <option value="">-- No Lead --</option>
                            {usersList.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          {u.isSuspended ? (
                            <Badge variant="error">Suspended</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                        </td>
                        <td className="py-3" align="right">
                          <div className="flex gap-2 justify-end">
                            {u.isSuspended ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] py-1 px-2 border-emerald-950 hover:bg-emerald-950/20 text-emerald-400"
                                onClick={() => handleActivateUser(u.id)}
                              >
                                Activate
                              </Button>
                            ) : (
                              u.role !== "ADMIN" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] py-1 px-2 border-red-950 hover:bg-red-950/20 text-red-400"
                                  onClick={() => handleSuspendUser(u.id)}
                                >
                                  Suspend
                                </Button>
                              )
                            )}
                            {u.role !== "ADMIN" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[10px] py-1 px-2 hover:bg-red-950/20 text-red-500 hover:text-red-400"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Create user form */}
            <div className="flex flex-col gap-4">
              <Card className="text-left flex flex-col gap-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Initialize User</h3>

                {userMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 rounded-lg text-emerald-400 text-xs">
                    {userMsg}
                  </div>
                )}
                {userError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-lg text-red-400 text-xs">
                    {userError}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
                  <Input
                    label="Full Name *"
                    placeholder="John Developer"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="john@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                  <Input
                    label="Password (Default: password123)"
                    type="password"
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                  <Select
                    label="Role Assignment"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    options={roleOptions}
                  />

                  <Button variant="primary" type="submit" className="mt-2 text-xs py-2" loading={userLoading}>
                    Deploy User Account
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: TEAMS MANAGEMENT */}
        {activeTab === "teams" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card className="text-left flex flex-col gap-4 overflow-x-auto">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Teams</h3>
                <table className="w-full text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                      <th align="left" className="py-2.5">Team Name</th>
                      <th align="left" className="py-2.5">Manager Lead</th>
                      <th align="left" className="py-2.5">Members Count</th>
                      <th align="right" className="py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {teamsList.map((t) => {
                      const lead = usersList.find((u) => u.id === t.leadId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-850/10 transition-colors">
                          <td className="py-3 font-bold text-slate-100">{t.name}</td>
                          <td className="py-3 text-slate-300">{lead?.name || `User #${t.leadId}`}</td>
                          <td className="py-3">
                            <span className="bg-slate-900 text-slate-400 px-2 py-0.5 border border-slate-800 rounded font-semibold text-[10px]">
                              {t.memberIds?.length || 0} Staff members
                            </span>
                          </td>
                          <td className="py-3" align="right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[10px] py-1 text-red-500 hover:bg-red-950/20"
                              onClick={() => handleDeleteTeam(t.id)}
                            >
                              Dissolve
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>

            <Card className="text-left flex flex-col gap-4 h-fit">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Create New Team</h3>
              {teamMsg && <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded text-xs">{teamMsg}</div>}
              {teamError && <div className="p-2 bg-red-950/40 text-red-400 border border-red-900/40 rounded text-xs">{teamError}</div>}

              <form onSubmit={handleCreateTeam} className="flex flex-col gap-3">
                <Input
                  label="Team Name *"
                  placeholder="Platform Engineering"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <Select
                  label="Assign Team Lead *"
                  value={teamLeadId}
                  onChange={(e) => setTeamLeadId(e.target.value)}
                  options={[
                    { value: "", label: "-- Choose Lead --" },
                    ...usersList.map((l) => ({ value: l.id, label: l.name })),
                  ]}
                />
                <Button variant="primary" type="submit" className="mt-2 text-xs py-2">
                  Initialize Team Unit
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 3: PROJECTS MANAGEMENT */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card className="text-left flex flex-col gap-4 overflow-x-auto">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Project Portfolio</h3>
                <table className="w-full text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                      <th align="left" className="py-2.5">Project Name</th>
                      <th align="left" className="py-2.5">Scope Description</th>
                      <th align="right" className="py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {projectsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-850/10 transition-colors">
                        <td className="py-3 font-bold text-slate-100">{p.name}</td>
                        <td className="py-3 text-slate-400 leading-relaxed max-w-sm truncate">{p.description}</td>
                        <td className="py-3" align="right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] py-1 text-red-500 hover:bg-red-950/20"
                            onClick={() => handleDeleteProject(p.id)}
                          >
                            Delete Project
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            <Card className="text-left flex flex-col gap-4 h-fit">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Register Project</h3>
              {projectMsg && <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded text-xs">{projectMsg}</div>}
              {projectError && <div className="p-2 bg-red-950/40 text-red-400 border border-red-900/40 rounded text-xs">{projectError}</div>}

              <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
                <Input
                  label="Project Title *"
                  placeholder="HIPAA Compliance v2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <Textarea
                  label="Description Scope"
                  placeholder="Technical scope details..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  rows={4}
                />
                <Button variant="primary" type="submit" className="mt-2 text-xs py-2">
                  Commit Project Scope
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 4: DYNAMIC ROLES & PERMISSIONS */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card className="text-left flex flex-col gap-4 overflow-x-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">System & Custom Roles</h3>
                  <span className="text-[10px] text-slate-500 font-bold">{Object.keys(rolesMap).length} roles defined</span>
                </div>

                <div className="flex flex-col gap-4">
                  {Object.entries(rolesMap).map(([roleName, perms]) => (
                    <div key={roleName} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white tracking-wide">{roleName}</span>
                          {roleName === "ADMIN" && <Badge variant="info">Full Control</Badge>}
                          {roleName === "EMPLOYEE" && <Badge variant="default">Default Staff</Badge>}
                        </div>
                        {roleName !== "ADMIN" && roleName !== "EMPLOYEE" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] text-red-500 hover:bg-red-950/20 py-1"
                            onClick={() => handleDeleteRole(roleName)}
                          >
                            Delete Role
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {roleName === "ADMIN" ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-900/40 px-2 py-0.5 rounded">
                            * (All System Privileges Granted)
                          </span>
                        ) : perms.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic">No special permissions assigned</span>
                        ) : (
                          perms.map((p) => (
                            <span key={p} className="text-[10px] font-semibold text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2 py-0.5 rounded">
                              {p}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="text-left flex flex-col gap-4 h-fit">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Create Custom Role</h3>
              {roleMsg && <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded text-xs">{roleMsg}</div>}
              {roleError && <div className="p-2 bg-red-950/40 text-red-400 border border-red-900/40 rounded text-xs">{roleError}</div>}

              <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
                <Input
                  label="Role Name *"
                  placeholder="e.g. AUDITOR or MANAGER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300">Assign Permissions</label>
                  <div className="flex flex-col gap-2 bg-slate-950/60 p-3 border border-slate-900 rounded-lg max-h-56 overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="primary" type="submit" className="text-xs py-2">
                  Register Role Architecture
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* TAB 5: SYSTEM SETTINGS & AUDIT LOGS */}
        {activeTab === "settings" && systemSettings && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4 h-fit">
              <Card className="text-left flex flex-col gap-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Settings</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between cursor-pointer border-b border-slate-900 pb-3">
                    <div className="text-left pr-2">
                      <span className="text-xs font-bold text-slate-200">Staff Register Role Chooser</span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        Allows guest signup to pick employee role options.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.allowRoleSelectionOnRegister}
                      onChange={(e) => handleToggleSettings("allowRoleSelectionOnRegister", e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 bg-slate-950 border-slate-800"
                    />
                  </label>

                  <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-semibold leading-relaxed">
                    <span>SECURITY CONSTRAINTS ACTIVE:</span>
                    <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5">
                      <li>Secure Cookie Storage Mode</li>
                      <li>Strict Endpoint Auth Guards</li>
                      <li>Input Injection Sanitation</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="xl:col-span-2">
              <Card className="text-left flex flex-col gap-4 max-h-[500px] overflow-hidden">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Global Audit Logs</h3>
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-slate-500">No activity logs found.</p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start border-b border-slate-900 pb-2.5 text-xs text-slate-300">
                        <span className="text-slate-500 font-bold mt-0.5">•</span>
                        <div className="text-left flex-1">
                          <div>
                            <span className="font-bold text-slate-100">{log.userName}</span>: {log.action}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{log.details}</p>
                          <span className="text-[9px] text-slate-600 block mt-1 font-semibold">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}