"use client";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";

export default function AssessmentsPage() {
  const classes = useAppStore((s) => s.classes);

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-sm text-gray-500">
            Class-specific assessment templates. Preschool admission, term tests, teacher / headmaster remarks, report generation.
          </p>
        </header>

        <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">Phase 3 — Coming next</p>
          <p>This is the biggest feature in the queue. When ready, each class below will have:</p>
          <ul className="list-disc list-inside mt-2 space-y-0.5">
            <li>An editable assessment template (markers + A/B/C/D scoring)</li>
            <li>Preschool admission: &quot;Can child read&quot;, &quot;Can child recognize numbers&quot;, etc.</li>
            <li>Class Assessment Test — teacher fills marks per student</li>
            <li>Teacher&apos;s Remarks and Headmaster&apos;s Remarks fields</li>
            <li>Auto-generated, printable report cards per student per term</li>
          </ul>
        </div>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Classes awaiting templates ({classes.length})</h2>
          <ul className="divide-y mt-2">
            {classes.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between">
                <span>{c.name}</span>
                <span className="text-xs text-gray-400">No template yet</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
