"use client";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const interventionPlans = useAppStore((s) => s.interventionPlans);
  const getTeacherInterventionStats = useAppStore((s) => s.getTeacherInterventionStats);
  const grades = useAppStore((s) => s.grades);
  const students = useAppStore((s) => s.students);
  const teachers = useAppStore((s) => s.teachers);

  const teacher = teachers.find((t) => t.full_name === user?.full_name);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const stats = teacher ? getTeacherInterventionStats(teacher.id) : { active: 0, completed: 0, successRate: 0, bySubject: {} };

  // Get all active plans for the teacher
  const teacherPlans = interventionPlans.filter(
    (p) => p.assigned_by_teacher_id === teacher?.id
  );

  // Calculate metrics
  const activePlans = teacherPlans.filter((p) => p.status === "assigned");
  const completedPlans = teacherPlans.filter((p) => p.status === "completed");
  const classStudents = students.filter((s) => s.class_name === teacher?.class_name);
  const percentageWithIntervention = classStudents.length
    ? Math.round((activePlans.length / classStudents.length) * 100)
    : 0;

  // Calculate average days to improve
  const improvementData = completedPlans.map((plan) => {
    const startDate = new Date(plan.created_at);
    const endDate = plan.completed_at ? new Date(plan.completed_at) : new Date();
    const days = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { plan, days };
  });

  const avgDaysToComplete =
    improvementData.length > 0
      ? Math.round(
          improvementData.reduce((sum, item) => sum + item.days, 0) /
            improvementData.length
        )
      : 0;

  // Subject breakdown
  const subjectBreakdown = Object.entries(stats.bySubject).map(([subject, count]) => ({
    subject,
    count: count as number,
    successRate: completedPlans.filter((p) => p.subject === subject).length > 0
      ? Math.round(
          (completedPlans.filter((p) => p.subject === subject).length /
            teacherPlans.filter((p) => p.subject === subject).length) *
            100
        )
      : 0,
  }));

  // Filter by subject if selected
  const filteredPlans = selectedSubject
    ? teacherPlans.filter((p) => p.subject === selectedSubject)
    : teacherPlans;

  // Calculate success rate for filtered plans
  const filteredCompletedCount = filteredPlans.filter(
    (p) => p.status === "completed"
  ).length;
  const filteredImprovedCount = filteredCompletedCount;
  const filteredSuccessRate =
    filteredCompletedCount > 0
      ? Math.round((filteredImprovedCount / filteredCompletedCount) * 100)
      : 0;

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-white">Intervention Analytics</h2>
        <p className="text-sm text-gray-500">Track the effectiveness of your intervention plans</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active Plans",
            value: activePlans.length,
            icon: "📚",
            color: "#3B82F6",
            subtitle: `${percentageWithIntervention}% of class`,
          },
          {
            label: "Completed",
            value: completedPlans.length,
            icon: "✅",
            color: "#10B981",
            subtitle: `${stats.successRate}% success rate`,
          },
          {
            label: "Avg Duration",
            value: `${avgDaysToComplete}d`,
            icon: "⏱️",
            color: "#F59E0B",
            subtitle: "Days to complete",
          },
          {
            label: "Total Plans",
            value: teacherPlans.length,
            icon: "📊",
            color: "#8B5CF6",
            subtitle: "All time",
          },
        ].map((metric, idx) => (
          <div key={idx} className="glass rounded-2xl p-4 card-hover">
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-2xl font-black mb-1" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-600">{metric.label}</div>
            <div className="text-xs text-gray-500 mt-1">{metric.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Subject Breakdown */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="font-black text-gray-900 mb-4">📈 Subject Breakdown</h3>
        {subjectBreakdown.length === 0 ? (
          <p className="text-sm text-gray-600">No interventions yet</p>
        ) : (
          <div className="space-y-3">
            {subjectBreakdown.map((item) => (
              <div
                key={item.subject}
                onClick={() =>
                  setSelectedSubject(
                    selectedSubject === item.subject ? null : item.subject
                  )
                }
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedSubject === item.subject
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{item.subject}</h4>
                  <span className="text-sm font-black text-gray-700">
                    {item.count} plan{item.count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${item.successRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {item.successRate}% success rate
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Plan Table */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">
            {selectedSubject ? `${selectedSubject} Plans` : "All Plans"}
          </h3>
          {selectedSubject && (
            <button
              onClick={() => setSelectedSubject(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Clear Filter
            </button>
          )}
        </div>

        {filteredPlans.length === 0 ? (
          <p className="text-sm text-gray-600">No plans found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-3 font-black text-gray-700">
                    Student
                  </th>
                  <th className="text-left py-3 px-3 font-black text-gray-700">
                    Subject
                  </th>
                  <th className="text-left py-3 px-3 font-black text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-3 font-black text-gray-700">
                    Progress
                  </th>
                  <th className="text-left py-3 px-3 font-black text-gray-700">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => {
                  const startDate = new Date(plan.created_at);
                  const endDate = plan.completed_at
                    ? new Date(plan.completed_at)
                    : new Date();
                  const days = Math.round(
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const completedSteps = plan.steps.filter((s) => s.completed).length;
                  const progress = plan.steps.length
                    ? Math.round((completedSteps / plan.steps.length) * 100)
                    : 0;

                  return (
                    <tr key={plan.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {plan.student_name}
                      </td>
                      <td className="py-3 px-3 text-gray-700">{plan.subject}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-black px-2 py-1 rounded-full ${
                            plan.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {plan.status === "completed" ? "Done" : "Active"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-700">{days} days</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="glass rounded-2xl p-5 mt-6">
        <h3 className="font-black text-gray-900 mb-3">📥 Export Report</h3>
        <button
          onClick={() => {
            const csv = [
              ["Student", "Subject", "Status", "Progress", "Urgency", "Created Date"],
              ...filteredPlans.map((p) => [
                p.student_name || "",
                p.subject,
                p.status,
                `${(p.steps.filter((s) => s.completed).length / p.steps.length) * 100}%`,
                p.urgency,
                new Date(p.created_at).toLocaleDateString(),
              ]),
            ]
              .map((row) => row.join(","))
              .join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `interventions-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          📊 Download CSV Report
        </button>
      </div>
    </DashboardShell>
  );
}
