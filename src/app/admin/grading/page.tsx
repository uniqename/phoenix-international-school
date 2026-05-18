"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import type {
  GradingGroup, GradingScale, AcademicAssessmentType,
  AcademicAssessmentReport, RemarkGroupKind,
} from "@/lib/types";
import toast from "react-hot-toast";

type Tab = "grade-levels" | "remarks" | "assessments" | "signatures";

const SCALE_LABEL: Record<GradingScale, string> = {
  abcd: "A / B / C / D",
  percent: "Percent (0–100)",
  letter5: "5-letter scale",
  letter6_basic_school: "Basic School A–F",
  narrative_preschool: "Pre-School narrative",
  kg_frequency: "KG frequency (MO/O/S/N/NA)",
};

const KIND_LABEL: Record<RemarkGroupKind, string> = {
  headmaster: "Headmaster",
  class_teacher: "Class Teacher",
  interest: "Interest",
  conduct: "Conduct",
  health: "Health",
  other: "Other",
};

export default function GradingPage() {
  const groups = useAppStore((s) => s.gradingGroups);
  const banks = useAppStore((s) => s.remarkBanks);
  const assessments = useAppStore((s) => s.academicAssessments);
  const signatories = useAppStore((s) => s.signatories);
  const addGroup = useAppStore((s) => s.addGradingGroup);
  const updateGroup = useAppStore((s) => s.updateGradingGroup);
  const deleteGroup = useAppStore((s) => s.deleteGradingGroup);
  const addLevel = useAppStore((s) => s.addGradeLevel);
  const updateLevel = useAppStore((s) => s.updateGradeLevel);
  const deleteLevel = useAppStore((s) => s.deleteGradeLevel);
  const addBank = useAppStore((s) => s.addRemarkBank);
  const deleteBank = useAppStore((s) => s.deleteRemarkBank);
  const addRemark = useAppStore((s) => s.addRemarkEntry);
  const deleteRemark = useAppStore((s) => s.deleteRemarkEntry);
  const addAssessment = useAppStore((s) => s.addAcademicAssessment);
  const updateAssessment = useAppStore((s) => s.updateAcademicAssessment);
  const deleteAssessment = useAppStore((s) => s.deleteAcademicAssessment);
  const upsertSig = useAppStore((s) => s.upsertSignatory);
  const deleteSig = useAppStore((s) => s.deleteSignatory);

  const [tab, setTab] = useState<Tab>("grade-levels");
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? "");
  const [activeBankId, setActiveBankId] = useState(banks[0]?.id ?? "");

  // New group form
  const [gName, setGName] = useState("");
  const [gScale, setGScale] = useState<GradingScale>("letter6_basic_school");
  const onAddGroup = () => {
    if (!gName.trim()) { toast.error("Name required"); return; }
    const created = addGroup({ name: gName.trim(), scale: gScale, levels: [], active: true });
    setActiveGroupId(created.id);
    setGName("");
    toast.success("Grading group added");
  };

  // New level form
  const [lName, setLName] = useState("");
  const [lMin, setLMin] = useState("");
  const [lAgg, setLAgg] = useState("");
  const [lRemark, setLRemark] = useState("");
  const onAddLevel = () => {
    if (!activeGroupId) { toast.error("Pick a group first"); return; }
    if (!lName.trim()) { toast.error("Grade name required"); return; }
    addLevel(activeGroupId, {
      grade_name: lName.trim(),
      min_score: lMin ? Number(lMin) : undefined,
      aggregate_value: lAgg ? Number(lAgg) : undefined,
      short_remark: lRemark.trim() || undefined,
    });
    setLName(""); setLMin(""); setLAgg(""); setLRemark("");
  };

  // New bank form
  const [bGroup, setBGroup] = useState("");
  const [bKind, setBKind] = useState<RemarkGroupKind>("other");
  const onAddBank = () => {
    if (!bGroup.trim()) { toast.error("Group name required"); return; }
    const created = addBank({ kind: bKind, group_name: bGroup.trim() });
    setActiveBankId(created.id);
    setBGroup("");
    toast.success("Remarks group added");
  };

  // New remark
  const [rText, setRText] = useState("");
  const [rMin, setRMin] = useState("");
  const [rMax, setRMax] = useState("");
  const onAddRemark = () => {
    if (!activeBankId) { toast.error("Pick a group first"); return; }
    if (!rText.trim()) { toast.error("Remark text required"); return; }
    const bank = banks.find((b) => b.id === activeBankId);
    const order = (bank?.remarks.length ?? 0) + 1;
    addRemark(activeBankId, {
      text: rText.trim(),
      min_score: rMin ? Number(rMin) : undefined,
      max_score: rMax ? Number(rMax) : undefined,
      order,
    });
    setRText(""); setRMin(""); setRMax("");
  };

  // New assessment
  const [aName, setAName] = useState("");
  const [aCode, setACode] = useState("");
  const [aMax, setAMax] = useState("100");
  const [aType, setAType] = useState<AcademicAssessmentType>("marks_with_grades");
  const [aReport, setAReport] = useState<AcademicAssessmentReport>("single");
  const [aWeight, setAWeight] = useState("");
  const onAddAssessment = () => {
    if (!aName.trim()) { toast.error("Name required"); return; }
    if (!aCode.trim()) { toast.error("Code required"); return; }
    const max = Number(aMax);
    if (Number.isNaN(max) || max <= 0) { toast.error("Max marks must be > 0"); return; }
    addAssessment({
      name: aName.trim().toUpperCase(),
      code: aCode.trim().toUpperCase(),
      max_marks: max,
      type: aType,
      report_type: aReport,
      weight: aWeight ? Number(aWeight) : undefined,
      active: true,
    });
    setAName(""); setACode(""); setAMax("100"); setAWeight("");
    toast.success("Academic assessment added");
  };

  // Signatory edits use prompt-based quick edit
  const onAddSig = () => {
    const role = prompt("Role label (e.g. Headmaster, Class Teacher):");
    if (!role || !role.trim()) return;
    const name = prompt("Person's name (leave blank to fill in later):") ?? "";
    upsertSig({
      role_label: role.trim(),
      full_name: name.trim(),
      active: true,
      order: signatories.length + 1,
    });
    toast.success("Signatory added");
  };

  const tabs: Array<{ key: Tab; label: string; emoji: string; count: number }> = [
    { key: "grade-levels", label: "Grade Levels",         emoji: "📐", count: groups.length },
    { key: "remarks",      label: "Remarks Manager",      emoji: "💬", count: banks.length },
    { key: "assessments",  label: "Academic Assessments", emoji: "🧮", count: assessments.length },
    { key: "signatures",   label: "Signatures",           emoji: "✍️", count: signatories.length },
  ];

  const activeGroup: GradingGroup | undefined = groups.find((g) => g.id === activeGroupId);
  const activeBank = banks.find((b) => b.id === activeBankId);

  return (
    <DashboardShell role="admin" navItems={NAV as never}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <header>
          <h1 className="text-2xl font-black text-white">📐 Grading & Remarks</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(196,181,253,0.8)" }}>
            Configure how the school grades — different rubrics for Basic School, JHS, Pre-School, Kindergarten. Manage banks of pre-written remarks. Define academic assessment types (CATs, term exams) and report signatories.
          </p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                background: tab === t.key ? "linear-gradient(135deg,#1A3FA0,#6B21A8)" : "rgba(255,255,255,0.08)",
                color: tab === t.key ? "white" : "rgba(196,181,253,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {t.emoji} {t.label} <span className="opacity-70">· {t.count}</span>
            </button>
          ))}
        </div>

        {tab === "grade-levels" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 glass rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Grading groups</p>
              <ul className="divide-y">
                {groups.length === 0 && <li className="text-sm text-gray-400 py-3 text-center">No groups yet.</li>}
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setActiveGroupId(g.id)}
                      className="w-full text-left py-2 px-2 hover:bg-indigo-50 rounded text-sm flex justify-between items-center"
                      style={{ background: activeGroupId === g.id ? "rgba(107,33,168,0.1)" : undefined }}
                    >
                      <div>
                        <p className="font-bold text-gray-800">{g.name}</p>
                        <p className="text-xs text-gray-500">{SCALE_LABEL[g.scale]}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">{g.levels.length}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-3 pt-3 border-t space-y-2">
                <p className="text-xs font-bold text-gray-700">➕ New grading group</p>
                <input className="input" placeholder="e.g. Senior High School" value={gName} onChange={(e) => setGName(e.target.value)} />
                <select className="input" value={gScale} onChange={(e) => setGScale(e.target.value as GradingScale)}>
                  {Object.entries(SCALE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button type="button" className="btn-gold w-full" onClick={onAddGroup}>+ Add group</button>
              </div>
            </div>

            <div className="md:col-span-2 glass rounded-2xl p-5">
              {!activeGroup ? (
                <p className="text-center py-8 text-sm text-gray-400">Pick a group on the left to edit its grade levels.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div>
                      <h3 className="font-black text-gray-900">{activeGroup.name}</h3>
                      <p className="text-xs text-gray-500">{SCALE_LABEL[activeGroup.scale]} · {activeGroup.levels.length} level{activeGroup.levels.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => updateGroup(activeGroup.id, { active: !activeGroup.active })}>{activeGroup.active ? "Deactivate" : "Activate"}</button>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                        if (confirm(`Delete grading group "${activeGroup.name}"?`)) {
                          deleteGroup(activeGroup.id);
                          setActiveGroupId(groups.filter((g) => g.id !== activeGroup.id)[0]?.id ?? "");
                        }
                      }}>Delete group</button>
                    </div>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                      <tr>
                        <th className="text-left py-2">Grade</th>
                        <th className="text-right py-2">Min Score</th>
                        <th className="text-right py-2">Aggregate</th>
                        <th className="text-left py-2">Short Remark</th>
                        <th className="text-right py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGroup.levels.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-400">No levels yet.</td></tr>}
                      {activeGroup.levels.map((l) => (
                        <tr key={l.id} className="border-b border-gray-50">
                          <td className="py-2 font-bold text-gray-800">{l.grade_name}</td>
                          <td className="py-2 text-right font-mono">{l.min_score ?? "—"}</td>
                          <td className="py-2 text-right font-mono">{l.aggregate_value ?? "—"}</td>
                          <td className="py-2 text-gray-600">{l.short_remark ?? "—"}</td>
                          <td className="py-2 text-right">
                            <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 mr-1" onClick={() => {
                              const next = prompt("Rename grade:", l.grade_name);
                              if (next?.trim()) updateLevel(activeGroup.id, l.id, { grade_name: next.trim() });
                            }}>Rename</button>
                            <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                              if (confirm(`Delete ${l.grade_name}?`)) deleteLevel(activeGroup.id, l.id);
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3">
                    <p className="text-sm font-bold text-indigo-900 mb-2">➕ Add a grade level</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                      <input className="input" placeholder="Grade (A, MO, 1)" value={lName} onChange={(e) => setLName(e.target.value)} />
                      <input className="input" type="number" placeholder="Min score" value={lMin} onChange={(e) => setLMin(e.target.value)} />
                      <input className="input" type="number" placeholder="Aggregate" value={lAgg} onChange={(e) => setLAgg(e.target.value)} />
                      <input className="input" placeholder="Short remark" value={lRemark} onChange={(e) => setLRemark(e.target.value)} />
                      <button type="button" className="btn-gold" onClick={onAddLevel}>+ Add</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "remarks" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 glass rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Remark groups</p>
              <ul className="divide-y">
                {banks.length === 0 && <li className="text-sm text-gray-400 py-3 text-center">No groups yet.</li>}
                {banks.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setActiveBankId(b.id)}
                      className="w-full text-left py-2 px-2 hover:bg-indigo-50 rounded text-sm flex justify-between items-center"
                      style={{ background: activeBankId === b.id ? "rgba(107,33,168,0.1)" : undefined }}
                    >
                      <div>
                        <p className="font-bold text-gray-800">{b.group_name}</p>
                        <p className="text-xs text-gray-500">{KIND_LABEL[b.kind]}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">{b.remarks.length}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-3 pt-3 border-t space-y-2">
                <p className="text-xs font-bold text-gray-700">➕ New remark group</p>
                <input className="input" placeholder="Group name" value={bGroup} onChange={(e) => setBGroup(e.target.value)} />
                <select className="input" value={bKind} onChange={(e) => setBKind(e.target.value as RemarkGroupKind)}>
                  {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button type="button" className="btn-gold w-full" onClick={onAddBank}>+ Add</button>
              </div>
            </div>

            <div className="md:col-span-2 glass rounded-2xl p-5">
              {!activeBank ? (
                <p className="text-center py-8 text-sm text-gray-400">Pick a group on the left to edit its remarks.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-gray-900">{activeBank.group_name}</h3>
                    <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                      if (confirm(`Delete group "${activeBank.group_name}"?`)) {
                        deleteBank(activeBank.id);
                        setActiveBankId(banks.filter((b) => b.id !== activeBank.id)[0]?.id ?? "");
                      }
                    }}>Delete group</button>
                  </div>

                  <ul className="divide-y">
                    {activeBank.remarks.length === 0 && <li className="py-3 text-sm text-gray-400 text-center">No remarks yet.</li>}
                    {[...activeBank.remarks].sort((a, b) => a.order - b.order).map((r) => (
                      <li key={r.id} className="py-2.5 flex items-start gap-2">
                        <span className="text-xs text-gray-400 font-mono w-6 pt-0.5">{r.order}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{r.text}</p>
                          {(r.min_score !== undefined || r.max_score !== undefined) && (
                            <p className="text-xs text-gray-400">Score range: {r.min_score ?? 0}–{r.max_score ?? 100}</p>
                          )}
                        </div>
                        <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                          if (confirm("Delete remark?")) deleteRemark(activeBank.id, r.id);
                        }}>×</button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 space-y-2">
                    <p className="text-sm font-bold text-indigo-900">➕ Add a remark</p>
                    <textarea className="input" rows={2} placeholder="e.g. A great improvement. Well done!" value={rText} onChange={(e) => setRText(e.target.value)} />
                    <div className="grid grid-cols-3 gap-2">
                      <input className="input" type="number" placeholder="Min score (optional)" value={rMin} onChange={(e) => setRMin(e.target.value)} />
                      <input className="input" type="number" placeholder="Max score (optional)" value={rMax} onChange={(e) => setRMax(e.target.value)} />
                      <button type="button" className="btn-gold" onClick={onAddRemark}>+ Add</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "assessments" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs text-gray-500">Define academic assessment types — term exams (Marks With Grades, Combined), continuous assessments (Marks Only, Single).</p>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-400 tracking-wider border-b">
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Code</th>
                  <th className="text-right py-2">Max</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Report</th>
                  <th className="text-right py-2">Weight</th>
                  <th className="text-right py-2"></th>
                </tr>
              </thead>
              <tbody>
                {assessments.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-sm text-gray-400">No assessments defined yet.</td></tr>}
                {assessments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50">
                    <td className="py-2 font-bold text-gray-800">{a.name}</td>
                    <td className="py-2 font-mono text-xs text-gray-600">{a.code}</td>
                    <td className="py-2 text-right font-mono">{a.max_marks}</td>
                    <td className="py-2 text-xs text-gray-600">{a.type.replace(/_/g, " ")}</td>
                    <td className="py-2 text-xs text-gray-600">{a.report_type}</td>
                    <td className="py-2 text-right text-xs text-gray-600">{a.weight ? `${a.weight}%` : "—"}</td>
                    <td className="py-2 text-right">
                      <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 mr-1" onClick={() => updateAssessment(a.id, { active: !a.active })}>{a.active ? "Deactivate" : "Activate"}</button>
                      <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                        if (confirm(`Delete ${a.name}?`)) deleteAssessment(a.id);
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3 mt-4">
              <p className="text-sm font-bold text-indigo-900 mb-2">➕ New academic assessment</p>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <input className="input md:col-span-2" placeholder="e.g. MID-TERM TEST" value={aName} onChange={(e) => setAName(e.target.value)} />
                <input className="input" placeholder="Code" value={aCode} onChange={(e) => setACode(e.target.value)} />
                <input className="input" type="number" placeholder="Max" value={aMax} onChange={(e) => setAMax(e.target.value)} />
                <select className="input" value={aType} onChange={(e) => setAType(e.target.value as AcademicAssessmentType)}>
                  <option value="marks_only">Marks Only</option>
                  <option value="marks_with_grades">Marks With Grades</option>
                  <option value="grades_only">Grades Only</option>
                  <option value="narrative">Narrative</option>
                </select>
                <select className="input" value={aReport} onChange={(e) => setAReport(e.target.value as AcademicAssessmentReport)}>
                  <option value="single">Single</option>
                  <option value="combined">Combined</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <input className="input" type="number" placeholder="Weight % (optional, for combined)" value={aWeight} onChange={(e) => setAWeight(e.target.value)} />
                <button type="button" className="btn-gold" onClick={onAddAssessment}>+ Add assessment</button>
              </div>
            </div>
          </section>
        )}

        {tab === "signatures" && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-gray-500">People who sign off on report cards. Their role + name appear in the report footer.</p>
              <button type="button" className="btn-gold" onClick={onAddSig}>+ Add signatory</button>
            </div>
            <ul className="divide-y">
              {signatories.length === 0 && <li className="py-4 text-sm text-gray-400 text-center">No signatories yet.</li>}
              {[...signatories].sort((a, b) => a.order - b.order).map((s) => (
                <li key={s.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 w-8 text-center">{s.order}</span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-gray-800">{s.role_label}</p>
                    <p className="text-xs text-gray-500">{s.full_name || "— not yet filled —"}</p>
                  </div>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200" onClick={() => {
                    const role = prompt("Role label:", s.role_label);
                    if (role !== null) {
                      const name = prompt("Person's name:", s.full_name);
                      upsertSig({ ...s, role_label: role.trim() || s.role_label, full_name: (name ?? s.full_name).trim() });
                    }
                  }}>Edit</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200" onClick={() => upsertSig({ ...s, active: !s.active })}>{s.active ? "Hide" : "Show"}</button>
                  <button type="button" className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200" onClick={() => {
                    if (confirm(`Delete ${s.role_label}?`)) deleteSig(s.id);
                  }}>Delete</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <style jsx>{`
          .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-size: 0.9rem; background: white; }
          .input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        `}</style>
      </div>
    </DashboardShell>
  );
}
