"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MOCK_TEACHERS } from "@/lib/mockData";
import type { Teacher } from "@/lib/types";

export default function CollectionsPage() {
  const { user } = useAuth();
  const {
    dailyCollectionHubs,
    createDailyHub,
    recordCanteenCollection,
    closeDailyHub,
  } = useAppStore();

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [hubDate, setHubDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [activeTab, setActiveTab] = useState<"today" | "records" | "create">("today");

  const today = new Date().toISOString().split("T")[0];
  const todayHub = dailyCollectionHubs.find(
    (h) => h.date === today && h.status === "active"
  );

  const handleCreateHub = () => {
    if (selectedTeachers.length === 0) {
      toast.error("Select at least one teacher");
      return;
    }
    const assignedTeachers = selectedTeachers.map((tid) => {
      const teacher = MOCK_TEACHERS.find((t) => t.id === tid);
      return {
        teacher_id: tid,
        teacher_name: teacher?.full_name || "Unknown",
      };
    });
    const newHub = createDailyHub(hubDate, assignedTeachers);
    if (newHub) {
      toast.success(`Hub created for ${hubDate}`);
      setSelectedTeachers([]);
      setHubDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleRecordCollection = () => {
    if (!todayHub) {
      toast.error("No active hub for today");
      return;
    }
    if (!selectedTeacher || !studentId || !studentName || !amount) {
      toast.error("Fill all fields");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    const teacher = MOCK_TEACHERS.find((t) => t.id === selectedTeacher);
    recordCanteenCollection(
      todayHub.id,
      selectedTeacher,
      teacher?.full_name || "Unknown",
      studentId,
      studentName,
      numAmount
    );
    toast.success("Collection recorded");
    setStudentId("");
    setStudentName("");
    setAmount("");
  };

  const handleCloseHub = (hubId: string) => {
    closeDailyHub(hubId);
    toast.success("Hub closed");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <DashboardShell
      role="admin"
      navItems={[
        { icon: "👥", label: "Students", href: "/admin/students" },
        { icon: "👨‍🏫", label: "Teachers", href: "/admin/teachers" },
        { icon: "📚", label: "Classes", href: "/admin/classes" },
        { icon: "💳", label: "Fees", href: "/admin/fees" },
        { icon: "🍽️", label: "Collections", href: "/admin/collections" },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">🍽️ Daily Collection Hub</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(147,51,234,0.95)" }}>
            Manage canteen collections from teachers and students.
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
            📅 Today's Hub
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className="px-4 py-2 text-sm font-bold transition-colors"
            style={{
              color: activeTab === "records" ? "#FFD700" : "rgba(255,255,255,0.6)",
              borderBottom: activeTab === "records" ? "2px solid #FFD700" : "none",
            }}
          >
            📊 Records
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 text-sm font-bold transition-colors"
            style={{
              color: activeTab === "create" ? "#FFD700" : "rgba(255,255,255,0.6)",
              borderBottom: activeTab === "create" ? "2px solid #FFD700" : "none",
            }}
          >
            ➕ Create Hub
          </button>
        </div>

        {activeTab === "today" && (
          <div className="glass rounded-2xl p-6 space-y-6">
            {todayHub ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Hub Status
                    </label>
                    <div className="mt-2 text-lg font-semibold text-green-400">
                      ✓ Active
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Daily Total
                    </label>
                    <div className="mt-2 text-lg font-semibold text-white">
                      GH₵ {todayHub.daily_total.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Collections Made
                    </label>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {todayHub.collections.length}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3">
                    👨‍🏫 Assigned Teachers ({todayHub.assigned_teachers.length})
                  </h3>
                  <div className="space-y-2">
                    {todayHub.assigned_teachers.map((t) => (
                      <div
                        key={t.teacher_id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <span className="text-sm text-white">{t.teacher_name}</span>
                        <span className="text-xs text-gray-400">
                          {todayHub.collections.filter((c) => c.teacher_id === t.teacher_id).length} records
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    ➕ Record New Collection
                  </h3>
                  <div className="space-y-2">
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg text-white text-sm"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      <option value="">Select teacher</option>
                      {todayHub.assigned_teachers.map((t) => (
                        <option key={t.teacher_id} value={t.teacher_id}>
                          {t.teacher_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg text-white text-sm placeholder-white/40"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Student name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg text-white text-sm placeholder-white/40"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Amount (GH₵)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg text-white text-sm placeholder-white/40"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleRecordCollection}
                    className="btn-gold w-full py-2 text-sm font-bold"
                  >
                    Record Collection
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    📋 Today's Collections ({todayHub.collections.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {todayHub.collections.length > 0 ? (
                      todayHub.collections.map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          <div className="text-white">
                            <div className="font-semibold">{col.student_name}</div>
                            <div className="text-xs text-gray-400">
                              {col.teacher_name} at {new Date(col.recorded_at).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-white font-bold">GH₵ {col.amount.toFixed(2)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        No collections yet
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleCloseHub(todayHub.id)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#EF4444",
                  }}
                >
                  Close Hub
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No active hub for today
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create a hub to start collecting canteen fees.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "records" && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white mb-4">
              📊 Hub History
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dailyCollectionHubs.length > 0 ? (
                dailyCollectionHubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="px-4 py-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold">{hub.date}</div>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          background:
                            hub.status === "active"
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(107,114,128,0.2)",
                          color:
                            hub.status === "active" ? "#22C55E" : "#9CA3AF",
                        }}
                      >
                        {hub.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                      <div>
                        Teachers: {hub.assigned_teachers.length}
                      </div>
                      <div>
                        Collections: {hub.collections.length}
                      </div>
                      <div>
                        Total: GH₵ {hub.daily_total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No hubs created yet
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white mb-4">
              ➕ Create Collection Hub
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Hub Date
                </label>
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
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Assign Teachers
                </label>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {MOCK_TEACHERS.map((teacher: Teacher) => (
                    <label
                      key={teacher.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: selectedTeachers.includes(teacher.id)
                          ? "rgba(147,51,234,0.2)"
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeachers([
                              ...selectedTeachers,
                              teacher.id,
                            ]);
                          } else {
                            setSelectedTeachers(
                              selectedTeachers.filter(
                                (id) => id !== teacher.id
                              )
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-white">{teacher.full_name}</span>
                    </label>
                  ))}
                </div>
                {selectedTeachers.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedTeachers.length} teacher
                    {selectedTeachers.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <button
                onClick={handleCreateHub}
                className="btn-gold w-full py-3 text-sm font-bold"
              >
                Create Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
