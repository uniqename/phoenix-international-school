"use client";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";

export default function FamiliesPage() {
  const families = useAppStore((s) => s.families);
  const students = useAppStore((s) => s.students);
  const computeFamilyDiscount = useAppStore((s) => s.computeFamilyDiscount);

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Families</h1>
          <p className="text-sm text-gray-500">
            Group siblings into a family to enable dual-parent login and automatic sibling discount.
          </p>
        </header>

        <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">Phase 2 — Coming next</p>
          <p>
            Dual-parent login flow, invite links for second parents, and the full family-roster UI are queued.
            For now, you can preview the data model and discount auto-calc below. Once enabled, this page will let admin:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-0.5">
            <li>Create / edit families and link children</li>
            <li>Invite a second parent by email or phone</li>
            <li>Override the auto-discount with a custom %</li>
            <li>See all fees, attendance, and reports for the whole family in one view</li>
          </ul>
        </div>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Current families ({families.length})</h2>
          {families.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">No families set up yet.</p>
          ) : (
            <ul className="divide-y mt-3">
              {families.map((f) => {
                const kids = students.filter((s) => s.family_id === f.id);
                const discount = computeFamilyDiscount(f.id);
                return (
                  <li key={f.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{f.family_name}</p>
                      <p className="text-xs text-gray-500">{kids.length} child{kids.length === 1 ? "" : "ren"} · primary: {f.primary_email ?? f.primary_phone ?? "—"}</p>
                    </div>
                    <span className="text-sm font-medium text-emerald-700">{discount}% off</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
