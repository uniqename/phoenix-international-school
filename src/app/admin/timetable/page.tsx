"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type { WeekDay } from "@/lib/types";
import toast from "react-hot-toast";

const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};
const DAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function TimetablePage() {
  const classes = useAppStore((s) => s.classes);
  const subjects = useAppStore((s) => s.subjects);
  const employees = useAppStore((s) => s.employees);
  const timetables = useAppStore((s) => s.classTimetables);
  const addPeriod = useAppStore((s) => s.addTimetablePeriod);
  const removePeriod = useAppStore((s) => s.removeTimetablePeriod);

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");

  // Add period form
  const [day, setDay] = useState<WeekDay>("mon");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [room, setRoom] = useState("");

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const tt = useMemo(() => timetables.find((t) => t.id === selectedClassId), [timetables, selectedClassId]);
  const sectionSubjects = useMemo(() => subjects.filter((s) => s.section === selectedClass?.section), [subjects, selectedClass]);
  const teachers = useMemo(() => employees.filter((e) => e.permissions.includes("teacher")), [employees]);

  const onAdd = () => {
    if (!startTime || !endTime) { toast.error("Start and end time required"); return; }
    if (startTime >= endTime) { toast.error("End time must be after start"); return; }
    addPeriod(selectedClassId, day, {
      start_time: startTime,
      end_time: endTime,
      subject_id: subjectId || undefined,
      teacher_id: teacherId || undefined,
      room: room.trim() || undefined,
    });
    setStartTime(""); setEndTime(""); setSubjectId(""); setTeacherId(""); setRoom("");
    toast.success(`${DAY_LABELS[day]} period added`);
  };

  const subjectName = (id?: string) => subjects.find((s) => s.id === id)?.name ?? "—";
  const teacherName = (id?: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">🕘 Timetable</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Weekly schedule per class — start time, end time, subject, teacher, room. Parents and students see their class&apos;s timetable in the app.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Class</label>
            <select className="input min-w-[200px]" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
              {classes.sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {selectedClass && (
          <>
            {DAYS.map((d) => {
              const periods = (tt?.days.find((x) => x.day === d)?.periods ?? [])
                .sort((a, b) => a.start_time.localeCompare(b.start_time));
              return (
                <section key={d} className="glass rounded-2xl p-5">
                  <h3 className="font-black text-gray-900 mb-3">{DAY_LABELS[d]}</h3>
                  {periods.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No periods scheduled.</p>
                  ) : (
                    <ul className="space-y-2">
                      {periods.map((p) => (
                        <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <span className="text-sm font-bold font-mono text-indigo-700 w-28">
                            {p.start_time} – {p.end_time}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800">{subjectName(p.subject_id)}</p>
                            <p className="text-xs text-gray-500">
                              {teacherName(p.teacher_id)}
                              {p.room && ` · 🏛️ ${p.room}`}
                            </p>
                          </div>
                          <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => removePeriod(selectedClassId, d, p.id)}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

            <section className="glass rounded-2xl p-5">
              <h3 className="font-black text-gray-900 mb-3">➕ Add period</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-500 font-bold">Day</label>
                  <select className="input" value={day} onChange={(e) => setDay(e.target.value as WeekDay)}>
                    {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Start</label>
                  <input className="input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">End</label>
                  <input className="input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Subject</label>
                  <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    <option value="">—</option>
                    {sectionSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">Teacher</label>
                  <select className="input" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                    <option value="">—</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <button type="button" className="btn-gold" onClick={onAdd}>+ Add</button>
              </div>
              <div className="mt-2">
                <label className="text-xs text-gray-500 font-bold">Room (optional)</label>
                <input className="input max-w-xs" placeholder="e.g. Room 12, Lab A" value={room} onChange={(e) => setRoom(e.target.value)} />
              </div>
            </section>
          </>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}
