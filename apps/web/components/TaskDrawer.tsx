"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, Select, Badge, Textarea } from "./UI";

interface TaskDrawerProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  currentUser: any;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  currentUser,
}) => {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Checklist states
  const [checklist, setChecklist] = useState<any[]>([]);
  const [newCheckItem, setNewCheckItem] = useState("");

  // Comments states
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Attachments states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachLoading, setAttachLoading] = useState(false);

  // Edit states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("TODO");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("Backend");
  const [msg, setMsg] = useState("");

  const isEditor = currentUser?.role === "ADMIN" || currentUser?.permissions?.includes("tasks.edit");

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskData();
      loadUsers();
    }
  }, [isOpen, taskId]);

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/users", { withCredentials: true });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTaskData = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.get("http://localhost:3001/tasks", { withCredentials: true });
      const current = res.data.find((t: any) => t.id === taskId);
      if (current) {
        setTask(current);
        setEditTitle(current.title);
        setEditDesc(current.description || "");
        setEditStatus(current.status);
        setEditPriority(current.priority);
        setEditAssignee(current.assignedToId.toString());
        setEditDueDate(current.dueDate || "");
        setEditCategory(current.category || "Backend");
        setChecklist(current.checklist || []);
      }

      setCommentsLoading(true);
      const commRes = await axios.get(`http://localhost:3001/enterprise/tasks/${taskId}/comments`, {
        withCredentials: true,
      });
      setComments(commRes.data || []);
      setCommentsLoading(false);

      const attachRes = await axios.get(`http://localhost:3001/enterprise/tasks/${taskId}/attachments`, {
        withCredentials: true,
      });
      setAttachments(attachRes.data || []);
    } catch (err) {
      console.error("Failed loading drawer task data", err);
    } finally {
      setLoading(false);
      setCommentsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    setMsg("");
    try {
      const patchData: any = {
        status: editStatus,
      };

      if (isEditor) {
        patchData.title = editTitle;
        patchData.description = editDesc;
        patchData.priority = editPriority;
        patchData.assignedToId = Number(editAssignee);
        patchData.dueDate = editDueDate;
        patchData.category = editCategory;
      }

      await axios.patch(`http://localhost:3001/tasks/${taskId}`, patchData, {
        withCredentials: true,
      });
      setMsg("Task details synchronized successfully.");
      if (onTaskUpdated) onTaskUpdated();
      loadTaskData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Failed to update details.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = async (itemId: string, currentVal: boolean) => {
    if (!taskId) return;
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !currentVal } : item,
    );
    setChecklist(updated);

    try {
      await axios.patch(
        `http://localhost:3001/enterprise/tasks/${taskId}/extension`,
        { checklist: updated },
        { withCredentials: true },
      );
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim() || !taskId) return;

    const newItem = {
      id: "c_" + Date.now(),
      text: newCheckItem.trim(),
      completed: false,
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewCheckItem("");

    try {
      await axios.patch(
        `http://localhost:3001/enterprise/tasks/${taskId}/extension`,
        { checklist: updated },
        { withCredentials: true },
      );
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId) return;

    try {
      const res = await axios.post(
        `http://localhost:3001/enterprise/tasks/${taskId}/comments`,
        { content: newComment.trim() },
        { withCredentials: true },
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateAttachment = async () => {
    if (!taskId) return;
    setAttachLoading(true);

    const mockFiles = [
      { name: "Product_Redesign_Schema.pdf", size: "2.4 MB" },
      { name: "Security_Audit_Report.docx", size: "1.1 MB" },
      { name: "Workflow_Permissions.xlsx", size: "850 KB" },
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];

    try {
      const res = await axios.post(
        `http://localhost:3001/enterprise/tasks/${taskId}/attachments`,
        {
          fileName: picked.name,
          fileSize: picked.size,
          fileUrl: "#",
        },
        { withCredentials: true },
      );
      setAttachments((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setAttachLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalCheck = checklist.length;
  const completedCheck = checklist.filter((c) => c.completed).length;
  const progressPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Drawer Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Container Panel */}
      <div className="relative w-full max-w-lg bg-[#0c1221] border-l border-slate-900 shadow-2xl flex flex-col h-full animate-slide-in font-sans">
        {/* Header toolbar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TASK #{taskId}</span>
            {task?.category && <Badge variant="info">{task.category}</Badge>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading Spinner */}
        {!task && loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading task details...</span>
          </div>
        ) : !task ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Task details could not be found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 divide-y divide-slate-900">
            {/* Status alerts */}
            {msg && (
              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400 text-xs">
                {msg}
              </div>
            )}

            {/* SECTION 1: Core Details Form */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                {isEditor ? (
                  <Input
                    label="Task Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                ) : (
                  <h2 className="text-base font-bold text-white leading-snug">{task.title}</h2>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {isEditor ? (
                  <Textarea
                    label="Description"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                    {task.description || "No description provided."}
                  </p>
                )}
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Select
                  label="Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  options={[
                    { value: "TODO", label: "TO DO" },
                    { value: "IN_PROGRESS", label: "IN PROGRESS" },
                    { value: "DONE", label: "DONE" },
                  ]}
                />

                <Select
                  label="Priority"
                  value={editPriority}
                  disabled={!isEditor}
                  onChange={(e) => setEditPriority(e.target.value)}
                  options={[
                    { value: "LOW", label: "Low Priority" },
                    { value: "MEDIUM", label: "Medium Priority" },
                    { value: "HIGH", label: "High Priority" },
                  ]}
                />

                <Select
                  label="Assignee"
                  value={editAssignee}
                  disabled={!isEditor}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  options={[
                    { value: "", label: "-- Select Member --" },
                    ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` })),
                  ]}
                />

                <Input
                  label="Due Date"
                  type="date"
                  disabled={!isEditor}
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />

                {isEditor && (
                  <Select
                    label="Department Scope"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    options={[
                      { value: "Frontend", label: "Frontend Dev" },
                      { value: "Backend", label: "Backend Dev" },
                      { value: "Design", label: "UI/UX Design" },
                      { value: "QA", label: "QA & Compliance" },
                      { value: "Management", label: "Management" },
                      { value: "Operations", label: "Operations" },
                    ]}
                  />
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={handleSaveDetails} loading={loading}>
                  Save Attributes
                </Button>
              </div>
            </div>

            {/* SECTION 2: Checklist Progress */}
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Subtask Checklist</h3>
                <span className="text-xs text-slate-500 font-bold">{progressPercent}% done</span>
              </div>

              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {checklist.length === 0 ? (
                <p className="text-xs text-slate-500">No checklist items defined.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 cursor-pointer group select-none"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id, item.completed)}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500/20"
                      />
                      <span
                        className={`text-xs transition-colors ${
                          item.completed
                            ? "line-through text-slate-500"
                            : "text-slate-300 group-hover:text-slate-200"
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {isEditor && (
                <form onSubmit={handleAddCheckItem} className="flex gap-2">
                  <input
                    placeholder="New checklist item..."
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="flex-1 bg-slate-950/80 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
                  />
                  <Button variant="outline" size="sm" type="submit">
                    Add
                  </Button>
                </form>
              )}
            </div>

            {/* SECTION 3: Attachments */}
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Attachments</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateAttachment}
                  loading={attachLoading}
                >
                  Attach File
                </Button>
              </div>

              {attachments.length === 0 ? (
                <p className="text-xs text-slate-500">No attachments uploaded yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex justify-between items-center p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg hover:border-slate-800 transition-colors"
                    >
                      <div className="text-left">
                        <div className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                          {file.name || file.fileName}
                        </div>
                        <div className="text-[10px] text-slate-500">{file.size || file.fileSize}</div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: Collaboration Comments Stream */}
            <div className="flex flex-col gap-4 pt-6 pb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Comments Feed</h3>

              <div className="flex flex-col gap-3.5 max-h-60 overflow-y-auto pr-1">
                {commentsLoading ? (
                  <p className="text-xs text-slate-500">Fetching comments feed...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-slate-500">No comments posted yet. Start the conversation!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5 items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-800/40 text-[9px] font-bold text-blue-300 flex items-center justify-center uppercase shrink-0 mt-0.5">
                        {c.userName ? c.userName[0] : "U"}
                      </div>
                      <div className="flex-1 text-left bg-slate-950/30 border border-slate-900 rounded-xl p-2.5">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-200">{c.userName}</span>
                            <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-900 px-1.5 rounded">
                              {c.userRole}
                            </span>
                          </div>
                          <span className="text-[8px] text-slate-600">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex flex-col gap-2 mt-2">
                <textarea
                  placeholder="Post a comment or status update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-900 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500/50 resize-none h-16"
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" type="submit" disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
