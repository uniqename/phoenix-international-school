"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import type { UserActivityLog, UserRole } from "@/lib/types";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const userActivityLogs = useAppStore((s) => s.userActivityLogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "">("");
  const [filterAction, setFilterAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const uniqueActions = useMemo(
    () => [...new Set(userActivityLogs.map((l) => l.action))].sort(),
    [userActivityLogs]
  );

  const uniqueRoles = useMemo(
    () => [...new Set(userActivityLogs.map((l) => l.role))] as UserRole[],
    [userActivityLogs]
  );

  const filtered = useMemo(() => {
    return userActivityLogs.filter((log) => {
      const searchMatch =
        searchTerm === "" ||
        log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.target && log.target.toLowerCase().includes(searchTerm.toLowerCase()));

      const roleMatch = filterRole === "" || log.role === filterRole;
      const actionMatch = filterAction === "" || log.action === filterAction;

      const logDate = new Date(log.timestamp);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const dateMatch =
        (!start || logDate >= start) && (!end || logDate <= end);

      return searchMatch && roleMatch && actionMatch && dateMatch;
    });
  }, [userActivityLogs, searchTerm, filterRole, filterAction, startDate, endDate]);

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 mb-1">📋 Audit Logs</h1>
        <p className="text-sm text-gray-600">
          Track all user activity across the system · {filtered.length} total entries
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              🔍 Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="User, action, or target…"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              👤 Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "")}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none"
            >
              <option value="">All roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              ⚙️ Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none"
            >
              <option value="">All actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              📅 From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              📅 To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No activity logs found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">
                    Target
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-bold">{log.user_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-bold"
                        style={{
                          background:
                            log.role === "admin"
                              ? "rgba(239,68,68,0.1)"
                              : log.role === "teacher"
                              ? "rgba(168,85,247,0.1)"
                              : log.role === "parent"
                              ? "rgba(59,130,246,0.1)"
                              : "rgba(107,114,128,0.1)",
                          color:
                            log.role === "admin"
                              ? "#dc2626"
                              : log.role === "teacher"
                              ? "#a855f7"
                              : log.role === "parent"
                              ? "#3b82f6"
                              : "#6b7280",
                        }}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {log.target || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-purple-600">
            {filtered.length}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Matching entries</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-blue-600">
            {new Set(filtered.map((l) => l.user_id)).size}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Unique users</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-green-600">
            {new Set(filtered.map((l) => l.action)).size}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Action types</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-orange-600">
            {userActivityLogs.length}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Total activities</p>
        </div>
      </div>
    </DashboardShell>
  );
}
