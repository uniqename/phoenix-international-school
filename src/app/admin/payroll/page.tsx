"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { useAppStore } from "@/store/useAppStore";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV = [
  { icon: "📊", label: "Overview",       href: "/admin" },
  { icon: "🎒", label: "Students",       href: "/admin/students" },
  { icon: "💳", label: "Fee Management", href: "/admin/fees" },
  { icon: "👩‍🏫", label: "Staff",         href: "/admin/staff" },
  { icon: "💼", label: "Payroll",         href: "/admin/payroll" },
  { icon: "📡", label: "Attendance",      href: "/admin/attendance" },
  { icon: "🏦", label: "Canteen Wallet",  href: "/admin/canteen" },
  { icon: "📢", label: "Announcements",   href: "/admin/announcements" },
  { icon: "📸", label: "School Feed",     href: "/admin/feed" },
  { icon: "🔑", label: "Accounts",        href: "/admin/accounts" },
  { icon: "❓", label: "Question Bank", href: "/admin/questions" },
  { icon: "📥", label: "Data Import",    href: "/admin/import" },
];

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function PayrollPage() {
  const payroll         = useAppStore((s) => s.payroll);
  const generatePayroll = useAppStore((s) => s.generatePayroll);
  const markPaid        = useAppStore((s) => s.markPayrollPaid);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const filtered = payroll.filter((p) => p.month === month && p.year === year);
  const totalNet  = filtered.reduce((s, p) => s + p.net_pay, 0);
  const totalPAYE = filtered.reduce((s, p) => s + p.paye, 0);
  const totalSSNIT = filtered.reduce((s, p) => s + p.ssnit_employee + p.ssnit_employer, 0);
  const unpaidCount = filtered.filter((p) => !p.paid).length;

  const handleGenerate = () => {
    generatePayroll(month, year);
    toast.success(`Payroll generated for ${MONTH_NAMES[month]} ${year}`);
  };

  const handleMarkPaid = (id: string, name: string) => {
    markPaid(id);
    toast.success(`${name} marked as paid`);
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-black text-white">Staff Payroll</h2>
        <div className="flex items-center gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
            {MONTH_NAMES.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-blue-100 text-sm bg-white focus:outline-none">
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {filtered.length === 0 && (
            <button type="button" onClick={handleGenerate} className="btn-gold text-xs py-2 px-4">
              Generate Payroll
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Net Pay",   value: formatGHS(totalNet),   color: "#22c55e", icon: "💰" },
          { label: "Total PAYE Tax",  value: formatGHS(totalPAYE),  color: "#ef4444", icon: "🏛️" },
          { label: "Total SSNIT",     value: formatGHS(totalSSNIT), color: "#f59e0b", icon: "🛡️" },
          { label: "Unpaid",          value: unpaidCount,            color: "#003087", icon: "⏳" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-white" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">💼</div>
          <p className="text-gray-500 text-sm mb-4">No payroll for {MONTH_NAMES[month]} {year}.</p>
          <button type="button" onClick={handleGenerate} className="btn-gold text-sm px-6 py-2.5">
            Generate Payroll for {MONTH_NAMES[month]} {year}
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "#0A1628" }}>
                <tr className="text-xs text-blue-300 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Staff Member</th>
                  <th className="text-right px-4 py-3 font-semibold">Basic</th>
                  <th className="text-right px-4 py-3 font-semibold">Allowances</th>
                  <th className="text-right px-4 py-3 font-semibold">PAYE</th>
                  <th className="text-right px-4 py-3 font-semibold">SSNIT (5.5%)</th>
                  <th className="text-right px-4 py-3 font-semibold">Net Pay</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="table-row border-t border-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.teacher_name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatGHS(p.basic_salary)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatGHS(p.allowances)}</td>
                    <td className="px-4 py-3 text-right text-red-500">−{formatGHS(p.paye)}</td>
                    <td className="px-4 py-3 text-right text-orange-500">−{formatGHS(p.ssnit_employee)}</td>
                    <td className="px-4 py-3 text-right font-black text-green-600">{formatGHS(p.net_pay)}</td>
                    <td className="px-4 py-3">
                      {p.paid ? (
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>✅ Paid</span>
                      ) : (
                        <button type="button" onClick={() => handleMarkPaid(p.id, p.teacher_name ?? "")}
                          className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "rgba(0,48,135,0.04)" }}>
                  <td className="px-4 py-3 font-black text-gray-900">TOTALS</td>
                  <td className="px-4 py-3 text-right font-black">{formatGHS(filtered.reduce((s,p)=>s+p.basic_salary,0))}</td>
                  <td className="px-4 py-3 text-right font-black">{formatGHS(filtered.reduce((s,p)=>s+p.allowances,0))}</td>
                  <td className="px-4 py-3 text-right font-black text-red-500">{formatGHS(totalPAYE)}</td>
                  <td className="px-4 py-3 text-right font-black text-orange-500">{formatGHS(filtered.reduce((s,p)=>s+p.ssnit_employee,0))}</td>
                  <td className="px-4 py-3 text-right font-black text-green-600">{formatGHS(totalNet)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(0,48,135,0.04)", border: "1px solid rgba(0,48,135,0.1)" }}>
        <p className="text-xs text-gray-500">
          <strong>Ghana Tax Note:</strong> PAYE calculated per GRA income tax bands. SSNIT: employee 5.5% + employer 13% of basic salary.
          Exempt threshold: GH₵4,380 per year. Employer SSNIT ({formatGHS(filtered.reduce((s,p)=>s+p.ssnit_employer,0))}) is an additional school liability.
        </p>
      </div>
    </DashboardShell>
  );
}
