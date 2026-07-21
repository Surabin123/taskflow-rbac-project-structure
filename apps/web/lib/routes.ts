export interface RouteConfig {
  label: string;
  path: string;
  requiredPermission?: string;
  allowedRoles?: string[];
}

export const sidebarRoutes: RouteConfig[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Users", path: "/admin?tab=users", requiredPermission: "users.create", allowedRoles: ["ADMIN"] },
  { label: "Teams", path: "/admin?tab=teams", requiredPermission: "projects.manage", allowedRoles: ["ADMIN"] },
  { label: "Projects", path: "/admin?tab=projects", requiredPermission: "projects.manage", allowedRoles: ["ADMIN"] },
  { label: "Roles & Permissions", path: "/admin?tab=roles", requiredPermission: "settings.manage", allowedRoles: ["ADMIN"] },
  { label: "Tasks", path: "/tasks", allowedRoles: ["ADMIN"] },
  { label: "My Tasks", path: "/employee", allowedRoles: ["EMPLOYEE"] },
  { label: "Activity Logs", path: "/admin?tab=logs", requiredPermission: "reports.view", allowedRoles: ["ADMIN"] },
  { label: "Settings", path: "/admin?tab=settings", requiredPermission: "settings.manage", allowedRoles: ["ADMIN"] },
  { label: "Profile", path: "/profile" },
];
