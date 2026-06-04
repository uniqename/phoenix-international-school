"use client";
import DashboardShell from "@/components/DashboardShell";
import VideoPlayer from "@/components/VideoPlayer";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const STUDENT_NAV = [
  { icon: "🏠", label: "Dashboard", href: "/student" },
  { icon: "✨", label: "My Interventions", href: "/student/interventions" },
  { icon: "📊", label: "My Grades", href: "/student#grades" },
  { icon: "📚", label: "Homework", href: "/student#homework" },
  { icon: "📝", label: "Assignments", href: "/student/assignments" },
  { icon: "💻", label: "Lessons", href: "/student#lessons" },
  { icon: "🎓", label: "Practice", href: "/bece" },
  { icon: "💬", label: "Messages", href: "/student/chat" },
  { icon: "📸", label: "School Feed", href: "/student#feed" },
  { icon: "📖", label: "Library", href: "/library" },
];

export default function StudentInterventionsPage() {
  const { user } = useAuth();
  const getStudentInterventionPlans = useAppStore((s) => s.getStudentInterventionPlans);
  const getInterventionProgress = useAppStore((s) => s.getInterventionProgress);
  const completeInterventionStep = useAppStore((s) => s.completeInterventionStep);
  const completeInterventionPlan = useAppStore((s) => s.completeInterventionPlan);
  const interventionPlans = useAppStore((s) => s.interventionPlans);
  const students = useAppStore((s) => s.students);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const student = students.find((s) => s.full_name === user?.full_name);
  const plans = student ? getStudentInterventionPlans(student.id) : [];
  const activePlans = plans.filter((p) => p.status === "assigned");
  const completedPlans = plans.filter((p) => p.status === "completed");
  const selectedPlan = selectedPlanId ? interventionPlans.find((p) => p.id === selectedPlanId) : null;

  return (
    <DashboardShell role="student" navItems={STUDENT_NAV}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">My Intervention Plans</h1>
        <p className="text-sm text-gray-400">Personalized learning plans to help you catch up</p>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 text-center max-w-md">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Plan Completed!</h2>
            <p className="text-gray-600 mb-6">Great work! You've successfully completed your intervention plan.</p>
            <button
              onClick={() => {
                setShowCelebration(false);
                setSelectedPlanId(null);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Detail View */}
      {selectedPlan ? (
        <div className="mb-6">
          <button
            onClick={() => setSelectedPlanId(null)}
            className="mb-4 text-blue-400 hover:text-blue-500 font-bold text-sm"
          >
            ← Back to Plans
          </button>

          <div className="glass rounded-2xl p-6 sticky top-0 z-40 mb-6">
            <h1 className="text-2xl font-black text-gray-900 mb-1">{selectedPlan.subject}</h1>
            <p className="text-sm text-gray-600">{selectedPlan.gap}</p>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-700">Progress</span>
                <span className="text-lg font-black text-gray-900">{getInterventionProgress(selectedPlan.id)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full transition-all"
                  style={{ width: `${getInterventionProgress(selectedPlan.id)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {selectedPlan.steps.map((step, idx) => (
              <div
                key={step.id}
                className={`rounded-2xl p-5 transition-all ${
                  step.completed
                    ? "glass bg-green-50/20 border-l-4 border-green-500"
                    : "glass hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {step.completed ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-black">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-gray-900">
                      <span className="capitalize">{step.type}</span>: {step.title}
                    </h3>
                    {step.duration && (
                      <p className="text-xs text-gray-600 mt-1">⏱️ {step.duration}</p>
                    )}
                    {step.description && (
                      <p className="text-sm text-gray-700 mt-2">{step.description}</p>
                    )}

                    {/* Video Player */}
                    {step.video_url && !step.completed && (
                      <div className="mt-4">
                        <VideoPlayer
                          videoUrl={step.video_url}
                          title={step.title}
                          duration={step.duration}
                          completionPolicy={step.video_completion_policy || "manual"}
                          onComplete={() => {
                            completeInterventionStep(selectedPlan.id, idx);
                            const updatedPlan = interventionPlans.find((p) => p.id === selectedPlan.id);
                            if (updatedPlan && updatedPlan.steps.every((s) => s.completed)) {
                              setShowCelebration(true);
                              completeInterventionPlan(selectedPlan.id);
                            }
                          }}
                          onProgress={(percent) => {
                            // Track video progress (optional: save to store)
                          }}
                        />
                      </div>
                    )}

                    {/* Video completed badge */}
                    {step.video_url && step.completed && (
                      <div className="mt-3 flex items-center gap-2 text-green-600 font-bold text-sm">
                        <span>✓ Video watched</span>
                      </div>
                    )}

                    {/* Manual complete button (for non-video steps) */}
                    {!step.video_url && !step.completed && (
                      <button
                        onClick={() => {
                          completeInterventionStep(selectedPlan.id, idx);
                          const updatedPlan = interventionPlans.find((p) => p.id === selectedPlan.id);
                          if (updatedPlan && updatedPlan.steps.every((s) => s.completed)) {
                            setShowCelebration(true);
                            completeInterventionPlan(selectedPlan.id);
                          }
                        }}
                        className="mt-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Active Plans */}
          {activePlans.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center mb-6">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-black text-gray-900 mb-2">All caught up!</h3>
              <p className="text-sm text-gray-600">You don't have any active intervention plans. Keep up the great work!</p>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="font-black text-white mb-4">📚 Active Plans</h2>
              <div className="space-y-4">
                {activePlans.map((plan) => {
                  const progress = getInterventionProgress(plan.id);
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className="w-full glass rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer card-hover text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-black text-gray-900">{plan.subject}</h3>
                          <p className="text-xs text-gray-600 mt-1">{plan.gap}</p>
                        </div>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${
                          plan.urgency === "high"
                            ? "bg-red-100 text-red-700"
                            : plan.urgency === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {plan.urgency.toUpperCase()}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-700">Progress</span>
                          <span className="text-xs font-black text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-purple-400 h-2.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-gray-50/50 rounded-lg p-2 text-center">
                          <div className="font-black text-gray-900">{plan.steps.length}</div>
                          <div className="text-gray-600">Total Steps</div>
                        </div>
                        <div className="bg-gray-50/50 rounded-lg p-2 text-center">
                          <div className="font-black text-gray-900">{plan.steps.filter((s) => s.completed).length}</div>
                          <div className="text-gray-600">Completed</div>
                        </div>
                        <div className="bg-gray-50/50 rounded-lg p-2 text-center">
                          <div className="font-black text-gray-900">{plan.estimated_catchup || "—"}</div>
                          <div className="text-gray-600">Est. Time</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Plans */}
          {completedPlans.length > 0 && (
            <div>
              <h2 className="font-black text-white mb-4">✅ Completed Plans</h2>
              <div className="space-y-3">
                {completedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="glass rounded-2xl p-4 border-l-4 border-green-500 bg-green-50/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-gray-900">{plan.subject}</h3>
                        <p className="text-xs text-gray-600">Completed on {plan.completed_at ? new Date(plan.completed_at).toLocaleDateString() : "—"}</p>
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Completed Plans */}
      {completedPlans.length > 0 && (
        <div>
          <h2 className="font-black text-white mb-4">✅ Completed Plans</h2>
          <div className="space-y-3">
            {completedPlans.map((plan) => (
              <div
                key={plan.id}
                className="glass rounded-2xl p-4 border-l-4 border-green-500 bg-green-50/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-gray-900">{plan.subject}</h3>
                    <p className="text-xs text-gray-600">Completed on {plan.completed_at ? new Date(plan.completed_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="text-2xl">🏆</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
