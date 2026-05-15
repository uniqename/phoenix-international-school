"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function CalendarPage() {
  const academicYears = useAppStore((s) => s.academicYears);
  const updateAcademicYear = useAppStore((s) => s.updateAcademicYear);
  const setCurrentAcademicYear = useAppStore((s) => s.setCurrentAcademicYear);
  const addAcademicYear = useAppStore((s) => s.addAcademicYear);
  const addHoliday = useAppStore((s) => s.addHoliday);
  const removeHoliday = useAppStore((s) => s.removeHoliday);

  const current = academicYears.find((y) => y.is_current) ?? academicYears[0];
  const [selectedYearId, setSelectedYearId] = useState(current?.id ?? "");
  const year = academicYears.find((y) => y.id === selectedYearId) ?? current;

  const [holidayForm, setHolidayForm] = useState({
    termNumber: 1 as 1 | 2 | 3,
    name: "",
    start_date: "",
    end_date: "",
  });

  const [newYearName, setNewYearName] = useState("");

  const onAddHoliday = () => {
    if (!holidayForm.name.trim() || !holidayForm.start_date || !holidayForm.end_date) {
      toast.error("Holiday name and dates are required");
      return;
    }
    if (!year) return;
    addHoliday(year.id, holidayForm.termNumber, {
      name: holidayForm.name.trim(),
      start_date: holidayForm.start_date,
      end_date: holidayForm.end_date,
    });
    setHolidayForm({ ...holidayForm, name: "", start_date: "", end_date: "" });
    toast.success("Holiday added");
  };

  const onAddYear = () => {
    if (!/^\d{4}\/\d{4}$/.test(newYearName.trim())) {
      toast.error("Year name should be like 2026/2027");
      return;
    }
    const [start, end] = newYearName.split("/");
    addAcademicYear({
      name: newYearName.trim(),
      start_date: `${start}-09-01`,
      end_date: `${end}-07-31`,
      is_current: false,
      terms: [
        { number: 1, start_date: `${start}-09-01`, end_date: `${start}-12-19` },
        { number: 2, start_date: `${end}-01-13`, end_date: `${end}-04-03` },
        { number: 3, start_date: `${end}-04-28`, end_date: `${end}-07-31` },
      ],
    });
    setNewYearName("");
    toast.success("Academic year added");
  };

  if (!year) {
    return (
      <DashboardShell role="admin" navItems={NAV as never}>
        <div className="p-6">No academic year configured.</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-bold">Academic Calendar</h1>
          <p className="text-sm text-gray-500">
            Set term dates and holidays. Reports auto-stamp with the current term and year. Parents see this calendar in the parent app.
          </p>
        </header>

        <section className="rounded-xl border bg-white p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold">Academic year</h2>
            <select className="input max-w-[200px]" value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.is_current ? "(current)" : ""}
                </option>
              ))}
            </select>
          </div>
          {!year.is_current && (
            <button
              className="text-sm text-indigo-600 hover:underline"
              onClick={() => { setCurrentAcademicYear(year.id); toast.success(`${year.name} is now the current year`); }}
            >
              Mark as current year
            </button>
          )}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Field label="Start date">
              <input className="input" type="date" value={year.start_date} onChange={(e) => updateAcademicYear(year.id, { start_date: e.target.value })} />
            </Field>
            <Field label="End date">
              <input className="input" type="date" value={year.end_date} onChange={(e) => updateAcademicYear(year.id, { end_date: e.target.value })} />
            </Field>
          </div>
        </section>

        {([1, 2, 3] as const).map((termNum) => {
          const term = year.terms.find((t) => t.number === termNum);
          if (!term) return null;
          return (
            <section key={termNum} className="rounded-xl border bg-white p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-semibold">Term {termNum} {term.is_current && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded ml-1">current</span>}</h2>
                {!term.is_current && (
                  <button
                    className="text-xs text-indigo-600 hover:underline"
                    onClick={() => updateAcademicYear(year.id, {
                      terms: year.terms.map((t) => ({ ...t, is_current: t.number === termNum })),
                    })}
                  >
                    Mark as current term
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start">
                  <input className="input" type="date" value={term.start_date} onChange={(e) => updateAcademicYear(year.id, {
                    terms: year.terms.map((t) => t.number === termNum ? { ...t, start_date: e.target.value } : t),
                  })} />
                </Field>
                <Field label="End">
                  <input className="input" type="date" value={term.end_date} onChange={(e) => updateAcademicYear(year.id, {
                    terms: year.terms.map((t) => t.number === termNum ? { ...t, end_date: e.target.value } : t),
                  })} />
                </Field>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium text-gray-700">Holidays in this term</p>
                <ul className="mt-2 divide-y border-t border-b">
                  {(term.holidays ?? []).length === 0 && <li className="py-2 text-sm text-gray-400">No holidays in this term.</li>}
                  {(term.holidays ?? []).map((h) => (
                    <li key={h.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{h.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{h.start_date} → {h.end_date}</span>
                      </div>
                      <button className="text-xs text-red-500 hover:text-red-700" onClick={() => removeHoliday(year.id, termNum, h.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

        <section className="rounded-xl border bg-white p-5 space-y-3">
          <h2 className="font-semibold">Add holiday to selected year</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
            <div>
              <label className="text-xs text-gray-500">Term</label>
              <select className="input" value={holidayForm.termNumber} onChange={(e) => setHolidayForm({ ...holidayForm, termNumber: Number(e.target.value) as 1 | 2 | 3 })}>
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Holiday name</label>
              <input className="input" placeholder="e.g. Mid-term Break" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Start</label>
              <input className="input" type="date" value={holidayForm.start_date} onChange={(e) => setHolidayForm({ ...holidayForm, start_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500">End</label>
              <input className="input" type="date" value={holidayForm.end_date} onChange={(e) => setHolidayForm({ ...holidayForm, end_date: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary" onClick={onAddHoliday}>Add holiday</button>
        </section>

        <section className="rounded-xl border bg-white p-5 space-y-3">
          <h2 className="font-semibold">Add a new academic year</h2>
          <p className="text-xs text-gray-500">Default term dates can be edited above after creation.</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Year name</label>
              <input className="input" placeholder="2026/2027" value={newYearName} onChange={(e) => setNewYearName(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={onAddYear}>Add year</button>
          </div>
        </section>

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.95rem; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
          .btn-primary { background: #1A0E4D; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; }
          .btn-primary:hover { background: #2c1a73; }
        `}</style>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
