"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const PARENT_NAV = [
  { icon: "🏠", label: "Dashboard", href: "/parent" },
  { icon: "✨", label: "Child Progress", href: "/parent/interventions" },
  { icon: "💳", label: "Fees", href: "/parent#fees" },
  { icon: "📡", label: "Attendance", href: "/parent#attendance" },
  { icon: "📄", label: "Report Card", href: "/parent#report" },
  { icon: "📚", label: "Homework", href: "/parent#homework" },
  { icon: "🍼", label: "Daily Log", href: "/parent#dailylog" },
  { icon: "🔐", label: "Pick-up Code", href: "/parent#pickup" },
  { icon: "📸", label: "School Feed", href: "/parent#feed" },
  { icon: "💬", label: "Chat Teacher", href: "/parent#chat" },
  { icon: "🚌", label: "Bus Tracking", href: "/parent#bus" },
  { icon: "💻", label: "Lessons", href: "/parent#lessons" },
  { icon: "📋", label: "Submit Excuse", href: "/parent#excuse" },
];

export default function ParentInterventionsPage() {
  const { user } = useAuth();
  const families = useAppStore((s) => s.families);
  const students = useAppStore((s) => s.students);
  const interventionPlans = useAppStore((s) => s.interventionPlans);
  const getInterventionProgress = useAppStore((s) => s.getInterventionProgress);
  const grades = useAppStore((s) => s.grades);

  const family = families.find((f) => f.primary_email === user?.email);
  const childrenIds = students
    .filter((s) => s.family_id === family?.id)
    .map((s) => s.id);
  const childrenInterventions = interventionPlans.filter((p) =>
    childrenIds.includes(p.student_id)
  );

  const childrenWithInterventions = students.filter((s) =>
    interventionPlans.some((p) => p.student_id === s.id)
  );

  return (
    <DashboardShell role="parent" navItems={PARENT_NAV}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Children's Learning Plans</h1>
        <p className="text-sm text-gray-400">Monitor your children's intervention progress</p>
      </div>

      {childrenInterventions.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="font-black text-gray-900 mb-2">No Active Plans</h3>
          <p className="text-sm text-gray-600">
            Your children don't currently have any intervention plans. They're on track!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {childrenWithInterventions.map((child) => {
            const childPlans = interventionPlans.filter((p) => p.student_id === child.id);
            const activePlans = childPlans.filter((p) => p.status === "assigned");
            const completedPlans = childPlans.filter((p) => p.status === "completed");

            return (
              <div key={child.id} className="space-y-3">
                <h2 className="font-black text-white">{child.full_name}</h2>

                {/* Active Plans */}
                {activePlans.length > 0 && (
                  <div className="space-y-3">
                    {activePlans.map((plan) => {
                      const progress = getInterventionProgress(plan.id);
                      const gradeImprovement = grades
                        .filter(
                          (g) =>
                            g.student_id === child.id &&
                            g.subject === plan.subject &&
                            g.created_at &&
                            g.created_at >= plan.created_at
                        )
                        .sort(
                          (a, b) =>
                            (b.created_at || "").localeCompare(a.created_at || "")
                        )[0]?.raw_score || 0;

                      return (
                        <div
                          key={plan.id}
                          className="glass rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer card-hover"
                        >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-black text-gray-900">{plan.subject}</h3>
                                <p className="text-xs text-gray-600 mt-1">{plan.gap}</p>
                              </div>
                              <span
                                className={`text-xs font-black px-3 py-1 rounded-full ${
                                  progress === 100
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {progress}% Complete
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="w-full bg-gray-300 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-gray-50/50 rounded-lg p-2 text-center">
                                <div className="font-black text-gray-900">
                                  {plan.steps.filter((s) => s.completed).length}
                                </div>
                                <div className="text-gray-600">Steps Done</div>
                              </div>
                              <div className="bg-gray-50/50 rounded-lg p-2 text-center">
                                <div className="font-black text-gray-900">
                                  {plan.estimated_catchup || "—"}
                                </div>
                                <div className="text-gray-600">Est. Time</div>
                              </div>
                              <div className="bg-gray-50/50 rounded-lg p-2 text-center">
                                <div className={`font-black ${gradeImprovement >= 60 ? "text-green-700" : "text-yellow-700"}`}>
                                  {gradeImprovement}%
                                </div>
                                <div className="text-gray-600">Current</div>
                              </div>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Completed Plans Badge */}
                {completedPlans.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="text-xs font-black text-green-700">
                      ✅ {completedPlans.length} plan(s) completed
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tips Section */}
      <div className="glass rounded-2xl p-5 mt-8 bg-amber-50/20 border-l-4 border-amber-500">
        <h3 className="font-black text-gray-900 mb-3">💡 How to Support Your Child</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Ask about their daily progress on the plan</li>
          <li>✓ Encourage consistent practice and engagement</li>
          <li>✓ Create a quiet study space at home</li>
          <li>✓ Celebrate completed steps and milestones</li>
          <li>✓ Follow the study tips recommended by their teacher</li>
        </ul>
      </div>
    </DashboardShell>
  );
}
