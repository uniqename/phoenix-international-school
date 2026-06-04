"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import React from "react";

const ADMIN_NAV = [
  { icon: "🏠", label: "Dashboard", href: "/admin" },
  { icon: "📈", label: "Analytics", href: "/admin/analytics" },
  { icon: "👥", label: "Students", href: "/admin#students" },
  { icon: "👨‍🏫", label: "Teachers", href: "/admin#teachers" },
  { icon: "⚙️", label: "Settings", href: "/admin#settings" },
];

export default function AdminAnalyticsPage() {
  const interventionPlans = useAppStore((s) => s.interventionPlans);
  const students = useAppStore((s) => s.students);
  const teachers = useAppStore((s) => s.teachers);
  const grades = useAppStore((s) => s.grades);

  // Calculate school-wide metrics
  const activeInterventions = interventionPlans.filter(
    (p) => p.status === "assigned"
  ).length;
  const completedInterventions = interventionPlans.filter(
    (p) => p.status === "completed"
  ).length;
  const totalInterventions = interventionPlans.length;

  const successfulInterventions = interventionPlans.filter((p) => {
    if (p.status !== "completed") return false;
    const improvedGrades = grades.filter(
      (g) =>
        g.student_id === p.student_id &&
        g.subject === p.subject &&
        g.raw_score >= 60 &&
        new Date(g.created_at || "") > new Date(p.created_at)
    );
    return improvedGrades.length > 0;
  }).length;

  const schoolSuccessRate =
    completedInterventions > 0
      ? Math.round((successfulInterventions / completedInterventions) * 100)
      : 0;

  const percentageWithIntervention =
    students.length > 0
      ? Math.round(
          (interventionPlans.filter(
            (p) => p.student_id && p.student_id.length > 0
          ).length /
            students.length) *
            100
        )
      : 0;

  // Subject breakdown
  const subjectStats: Record<
    string,
    { count: number; completed: number; improved: number }
  > = {};

  for (const plan of interventionPlans) {
    if (!subjectStats[plan.subject]) {
      subjectStats[plan.subject] = { count: 0, completed: 0, improved: 0 };
    }
    subjectStats[plan.subject].count++;
    if (plan.status === "completed") {
      subjectStats[plan.subject].completed++;
      const improvedGrades = grades.filter(
        (g) =>
          g.student_id === plan.student_id &&
          g.subject === plan.subject &&
          g.raw_score >= 60
      );
      if (improvedGrades.length > 0) {
        subjectStats[plan.subject].improved++;
      }
    }
  }

  const sortedSubjects = Object.entries(subjectStats)
    .map(([subject, stats]) => ({
      subject,
      count: stats.count,
      completionRate: stats.completed > 0 ? Math.round((stats.completed / stats.count) * 100) : 0,
      successRate: stats.completed > 0 ? Math.round((stats.improved / stats.completed) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Teacher comparison
  const teacherStats = teachers.map((teacher) => {
    const teacherPlans = interventionPlans.filter(
      (p) => p.assigned_by_teacher_id === teacher.id
    );
    const teacherCompleted = teacherPlans.filter(
      (p) => p.status === "completed"
    ).length;
    const teacherImproved = teacherPlans.filter((p) => {
      if (p.status !== "completed") return false;
      const improvedGrades = grades.filter(
        (g) =>
          g.student_id === p.student_id &&
          g.subject === p.subject &&
          g.raw_score >= 60
      );
      return improvedGrades.length > 0;
    }).length;

    return {
      name: teacher.full_name,
      plansCreated: teacherPlans.length,
      completionRate:
        teacherPlans.length > 0
          ? Math.round((teacherCompleted / teacherPlans.length) * 100)
          : 0,
      successRate:
        teacherCompleted > 0 ? Math.round((teacherImproved / teacherCompleted) * 100) : 0,
    };
  });

  const exportAsCSV = () => {
    const csv = [
      ["Subject", "Total Plans", "Completion Rate", "Success Rate"],
      ...sortedSubjects.map((s) => [
        s.subject,
        s.count,
        `${s.completionRate}%`,
        `${s.successRate}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school-interventions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <DashboardShell role="admin" navItems={ADMIN_NAV}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-white">School-wide Intervention Analytics</h2>
        <p className="text-sm text-gray-500">Comprehensive metrics across all teachers and students</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active Interventions",
            value: activeInterventions,
            subtitle: `${percentageWithIntervention}% of students`,
            icon: "📚",
            color: "#3B82F6",
          },
          {
            label: "Completed Plans",
            value: completedInterventions,
            subtitle: `of ${totalInterventions} total`,
            icon: "✅",
            color: "#10B981",
          },
          {
            label: "Success Rate",
            value: `${schoolSuccessRate}%`,
            subtitle: `${successfulInterventions} improved`,
            icon: "📈",
            color: "#F59E0B",
          },
          {
            label: "Avg Steps/Plan",
            value: totalInterventions > 0 ? Math.round(
              interventionPlans.reduce((sum, p) => sum + p.steps.length, 0) /
                totalInterventions
            ) : 0,
            subtitle: "per intervention",
            icon: "📋",
            color: "#8B5CF6",
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
        <h3 className="font-black text-gray-900 mb-4">📊 Subject Performance</h3>
        {sortedSubjects.length === 0 ? (
          <p className="text-sm text-gray-600">No interventions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-3 font-black text-gray-700">
                    Subject
                  </th>
                  <th className="text-center py-3 px-3 font-black text-gray-700">
                    Plans
                  </th>
                  <th className="text-center py-3 px-3 font-black text-gray-700">
                    Completion
                  </th>
                  <th className="text-center py-3 px-3 font-black text-gray-700">
                    Success
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSubjects.map((subject) => (
                  <tr
                    key={subject.subject}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-3 font-bold text-gray-900">
                      {subject.subject}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-700">
                      {subject.count}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${subject.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right">
                          {subject.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-xs font-black px-2 py-1 rounded-full ${
                          subject.successRate >= 75
                            ? "bg-green-100 text-green-700"
                            : subject.successRate >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {subject.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teacher Comparison */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="font-black text-gray-900 mb-4">👨‍🏫 Teacher Performance</h3>
        <div className="space-y-2">
          {teacherStats
            .filter((t) => t.plansCreated > 0)
            .sort((a, b) => b.plansCreated - a.plansCreated)
            .map((teacher) => (
              <div key={teacher.name} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                    <p className="text-xs text-gray-600">
                      {teacher.plansCreated} plans created
                    </p>
                  </div>
                  <span className="text-sm font-black text-gray-700">
                    {teacher.completionRate}% completed
                  </span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Completion Rate:</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${teacher.completionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${teacher.successRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Export */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-black text-gray-900 mb-3">📥 Export Report</h3>
        <button
          onClick={exportAsCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          📊 Download CSV Report
        </button>
      </div>
    </DashboardShell>
  );
}
