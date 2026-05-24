"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MOCK_TEACHERS, MOCK_EMPLOYEES } from "@/lib/mockData";
import type { Teacher, Employee } from "@/lib/types";

export default function BusRunsPage() {
  const { user } = useAuth();
  const {
    busRoutes,
    dailyBusRunHubs,
    createDailyBusRunHub,
    closeDailyBusRunHub,
  } = useAppStore();

  const [selectedRoute, setSelectedRoute] = useState<string>(busRoutes[0]?.id || "");
  const [selectedDirection, setSelectedDirection] = useState<"pickup" | "dropoff">("pickup");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [hubDate, setHubDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<"today" | "create">("today");

  const today = new Date().toISOString().split("T")[0];
  const todayHubs = dailyBusRunHubs.filter((h) => h.date === today && h.status === "active");

  const allAvailableUsers = [
    ...MOCK_TEACHERS.map((t: Teacher) => ({
      id: t.id,
      name: t.full_name,
      role: "teacher",
    })),
    ...MOCK_EMPLOYEES.map((e: Employee) => ({
      id: e.id,
      name: e.full_name || "",
      role: "staff",
    })),
  ].filter((u) => u.name);

  const handleCreateHub = () => {
    if (!selectedRoute) {
      toast.error("Select a route");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("Assign at least one user");
      return;
    }

    const assignedUsers = selectedUsers.map((userId) => {
      const user = allAvailableUsers.find((u) => u.id === userId);
      return {
        user_id: userId,
        user_name: user?.name || "Unknown",
        role: user?.role || "staff",
      };
    });

    const newHub = createDailyBusRunHub(hubDate, selectedRoute, selectedDirection, assignedUsers);
    if (newHub) {
      toast.success(`Bus run created for ${hubDate}`);
      setSelectedUsers([]);
      setHubDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleCloseHub = (hubId: string) => {
    closeDailyBusRunHub(hubId);
    toast.success("Bus run closed");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <DashboardShell
      role="admin"
      navItems={[
        { icon: "👥", label: "Students", href: "/admin/students" },
        { icon: "👨‍🏫", label: "Teachers", href: "/admin/teachers" },
        { icon: "🚌", label: "Bus Runs", href: "/admin/bus-runs" },
        { icon: "🍽️", label: "Collections", href: "/admin/collections" },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">🚌 Daily Bus Runs</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(147,51,234,0.95)" }}>
            Create and manage daily bus run assignments for drivers and staff.
          </p>
        </header>

        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("today")}
            className="px-4 py-2 text-sm font-bold transition-colors"
            style={{
              color: activeTab === "today" ? "#FFD700" : "rgba(255,255,255,0.6)",
              borderBottom: activeTab === "today" ? "2px solid #FFD700" : "none",
            }}
          >
            📅 Today's Runs
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 text-sm font-bold transition-colors"
            style={{
              color: activeTab === "create" ? "#FFD700" : "rgba(255,255,255,0.6)",
              borderBottom: activeTab === "create" ? "2px solid #FFD700" : "none",
            }}
          >
            ➕ Create Run
          </button>
        </div>

        {activeTab === "today" && (
          <div className="glass rounded-2xl p-6 space-y-6">
            {todayHubs.length > 0 ? (
              todayHubs.map((hub) => {
                const route = busRoutes.find((r) => r.id === hub.route_id);
                return (
                  <div key={hub.id} className="space-y-4 pb-4 border-b border-white/10 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{route?.name}</h3>
                        <p className="text-sm text-gray-400">
                          {hub.direction === "pickup" ? "🌅 Morning Pickup" : "🌆 Afternoon Dropoff"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCloseHub(hub.id)}
                        className="text-xs px-3 py-1 rounded-lg font-bold"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          color: "#EF4444",
                        }}
                      >
                        Close
                      </button>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-2">Assigned Staff</p>
                      <div className="flex flex-wrap gap-2">
                        {hub.assigned_users.map((u) => (
                          <span
                            key={u.user_id}
                            className="px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ background: "rgba(147,51,234,0.3)" }}
                          >
                            {u.user_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🚌</div>
                <h3 className="text-lg font-bold text-white mb-2">No active bus runs today</h3>
                <p className="text-sm text-gray-400">Create a bus run to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white mb-4">Create Bus Run</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Run Date</label>
                <input
                  type="date"
                  value={hubDate}
                  onChange={(e) => setHubDate(e.target.value)}
                  min={today}
                  className="w-full mt-2 px-4 py-2 rounded-lg text-white text-sm"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Route</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full mt-2 px-4 py-2 rounded-lg text-white text-sm"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <option value="">Select a route</option>
                  {busRoutes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Direction</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["pickup", "dropoff"] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setSelectedDirection(dir)}
                      className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background:
                          selectedDirection === dir ? "rgba(147,51,234,0.3)" : "rgba(255,255,255,0.05)",
                        color: selectedDirection === dir ? "#A855F7" : "rgba(255,255,255,0.6)",
                        border: selectedDirection === dir ? "1px solid #A855F7" : "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {dir === "pickup" ? "🌅 Morning Pickup" : "🌆 Afternoon Dropoff"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Assign Staff</label>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {allAvailableUsers.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: selectedUsers.includes(u.id)
                          ? "rgba(147,51,234,0.2)"
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-white">{u.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{u.role}</span>
                    </label>
                  ))}
                </div>
                {selectedUsers.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedUsers.length} person{selectedUsers.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <button
                onClick={handleCreateHub}
                className="btn-gold w-full py-3 text-sm font-bold"
              >
                Create Bus Run
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
