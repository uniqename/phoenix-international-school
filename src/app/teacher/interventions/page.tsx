"use client";
import DashboardShell from "@/components/DashboardShell";
import { TEACHER_NAV as NAV } from "@/lib/teacherNav";
import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";

export default function InterventionsPage() {
  const { user } = useAuth();
  const getStudentsNeedingIntervention = useAppStore((s) => s.getStudentsNeedingIntervention);
  const createInterventionPlan = useAppStore((s) => s.createInterventionPlan);
  const assignInterventionPlan = useAppStore((s) => s.assignInterventionPlan);
  const interventionPlans = useAppStore((s) => s.interventionPlans);
  const students = useAppStore((s) => s.students);
  const subjects = useAppStore((s) => s.subjects);

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [gap, setGap] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const needingIntervention = getStudentsNeedingIntervention();

  const handleGeneratePlan = async () => {
    if (!selectedStudent || !selectedSubject || !gap) {
      alert("Please select a student, subject, and describe the knowledge gap");
      return;
    }

    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return;

    setLoading(true);
    try {
      const response = await fetch("/api/generate-intervention-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: student.full_name,
          grade: student.level,
          subject: selectedSubject,
          gap: gap,
          current_score: 45,
        }),
      });

      const data = await response.json();
      setGeneratedPlan(data);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = () => {
    if (!generatedPlan || !selectedStudent) return;

    const plan = createInterventionPlan({
      student_id: selectedStudent,
      student_name: students.find((s) => s.id === selectedStudent)?.full_name,
      class_name: students.find((s) => s.id === selectedStudent)?.class_name,
      subject: selectedSubject,
      gap: generatedPlan.gap,
      urgency: generatedPlan.urgency || "medium",
      estimated_catchup: generatedPlan.estimatedCatchUp,
      steps: generatedPlan.steps || [],
      parent_note: generatedPlan.parentNote,
    });

    assignInterventionPlan(plan.id, selectedStudent, user?.id || "", user?.full_name || "");

    setGeneratedPlan(null);
    setSelectedStudent(null);
    setSelectedSubject("");
    setGap("");
    alert("Plan assigned to student!");
  };

  const unassignedPlans = interventionPlans.filter((p) => p.status === "assigned");
  const completedPlans = interventionPlans.filter((p) => p.status === "completed");

  return (
    <DashboardShell role="teacher" navItems={NAV}>
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">AI-Powered Interventions</h2>
        <p className="text-sm text-gray-500">Generate personalized catch-up plans for struggling students</p>
      </div>

      {/* Struggling Students List */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="font-black text-gray-900 mb-4">📍 Students Needing Help</h3>
        {needingIntervention.length === 0 ? (
          <p className="text-sm text-gray-600">All students are doing well!</p>
        ) : (
          <div className="space-y-2">
            {needingIntervention.slice(0, 10).map((item) => (
              <div
                key={item.student.id}
                onClick={() => setSelectedStudent(item.student.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedStudent === item.student.id
                    ? "bg-blue-500/20 border-l-4 border-blue-500"
                    : "bg-gray-100/50 hover:bg-gray-100"
                }`}
              >
                <div className="font-bold text-gray-900">{item.student.full_name}</div>
                <div className="text-xs text-gray-600">{item.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Generator */}
      {selectedStudent && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-black text-gray-900 mb-4">✨ Generate Intervention Plan</h3>

          <div className="space-y-4">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Knowledge Gap Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Knowledge Gap</label>
              <textarea
                value={gap}
                onChange={(e) => setGap(e.target.value)}
                placeholder="e.g., Struggles with fractions, can't solve word problems, needs help with essay structure"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Generating plan..." : "Generate AI Plan"}
            </button>
          </div>
        </div>
      )}

      {/* Generated Plan Preview */}
      {generatedPlan && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-black text-gray-900 mb-4">📋 Generated Plan</h3>

          <div className="space-y-3 mb-6">
            <div>
              <div className="text-xs font-bold text-gray-600">Gap</div>
              <div className="text-sm text-gray-900">{generatedPlan.gap}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-600">Urgency</div>
              <div className="text-sm capitalize">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  generatedPlan.urgency === "high" ? "bg-red-100 text-red-700" :
                  generatedPlan.urgency === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {generatedPlan.urgency}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-600">Estimated Catch-up Time</div>
              <div className="text-sm text-gray-900">{generatedPlan.estimatedCatchUp}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-600 mb-2">Steps</div>
              <div className="space-y-2">
                {generatedPlan.steps?.map((step: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-bold text-sm capitalize">{step.type}: {step.title}</div>
                    {step.duration && <div className="text-xs text-gray-600">⏱️ {step.duration}</div>}
                    {step.description && <div className="text-xs text-gray-600 mt-1">{step.description}</div>}
                  </div>
                ))}
              </div>
            </div>

            {generatedPlan.parentNote && (
              <div>
                <div className="text-xs font-bold text-gray-600 mb-1">Parent Note</div>
                <div className="text-sm text-gray-900 bg-purple-50 p-3 rounded-lg">{generatedPlan.parentNote}</div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAssignPlan}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              Assign to Student
            </button>
            <button
              onClick={() => setGeneratedPlan(null)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Assigned Plans */}
      {unassignedPlans.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-black text-gray-900 mb-4">📚 Active Plans</h3>
          <div className="space-y-3">
            {unassignedPlans.map((plan) => (
              <div key={plan.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-gray-900">{plan.student_name}</div>
                    <div className="text-xs text-gray-600">{plan.subject} — {plan.gap}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    plan.urgency === "high" ? "bg-red-100 text-red-700" :
                    plan.urgency === "medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {plan.urgency}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {plan.steps.filter((s) => s.completed).length} of {plan.steps.length} steps completed
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${plan.steps.length ? (plan.steps.filter((s) => s.completed).length / plan.steps.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Plans */}
      {completedPlans.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-gray-900 mb-4">✅ Completed Plans</h3>
          <div className="space-y-2">
            {completedPlans.map((plan) => (
              <div key={plan.id} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                <div className="font-bold text-gray-900">{plan.student_name}</div>
                <div className="text-xs text-gray-600">{plan.subject} — Completed</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
