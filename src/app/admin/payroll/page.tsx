"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { formatGHS } from "@/lib/utils";
import toast from "react-hot-toast";


const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function PayrollPage() {
  const payroll         = useAppStore((s) => s.payroll);
  const teachers        = useAppStore((s) => s.teachers);
  const settings        = useAppStore((s) => s.schoolSettings);
  const generatePayroll = useAppStore((s) => s.generatePayroll);
  const proratePayroll  = useAppStore((s) => s.proratePayrollByCheckIns);
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

  // Paystack Transfers bulk CSV — drop directly into
  // dashboard.paystack.com → Transfers → Bulk Transfers → Upload CSV.
  // Columns Paystack expects: amount (pesewas), recipient (recipient_code OR
  // account_number / bank_code), reference, reason. This export uses the
  // account_number variant so admin doesn't need to pre-create recipients.
  // Cheaper than NIBSS (~GH₵1.50/transfer, no monthly fee) and uses the
  // Paystack account the school is already collecting fees on.
  const downloadPaystackTransferCSV = () => {
    if (filtered.length === 0) return;
    const period = `${MONTH_NAMES[month]}-${year}`;
    const rows = [
      ["amount", "account_number", "bank_code", "name", "reference", "reason"].join(","),
      ...filtered.map((p) => {
        const t = teachers.find((tc) => tc.id === p.teacher_id);
        const cells = [
          Math.round(p.net_pay * 100),                                                    // pesewas
          (t?.bank_account ?? "").replace(/[^0-9]/g, ""),
          (t?.bank_name ?? "").replace(/,/g, " "),                                        // school types Paystack bank code here
          (p.teacher_name ?? "").replace(/,/g, " "),
          `PHOENIX-${period}-${(t?.employee_id ?? p.teacher_id).replace(/,/g, "")}`,
          `Salary ${period}`.replace(/,/g, " "),
        ];
        return cells.join(",");
      }),
    ];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paystack-transfers-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("✅ Paystack Transfers CSV downloaded — upload at dashboard.paystack.com → Transfers → Bulk → Upload CSV. Replace bank_code column with Paystack's bank code for each teacher (one-time setup).", { duration: 9000 });
  };

  // Ghana bank-credit batch file (compatible with what Ghanaian banks accept
  // as a payroll upload: CSV with beneficiary name, bank, branch, account,
  // amount, narrative). Hand this file to your bank — they'll credit every
  // teacher in one batch instead of paying one by one.
  const downloadBankCSV = () => {
    if (filtered.length === 0) return;
    const period = `${MONTH_NAMES[month]}-${year}`;
    const rows = [
      ["Beneficiary Name", "Bank", "Branch", "Account Number", "Amount (GHS)", "Narrative", "SSNIT", "Employee ID"].join(","),
      ...filtered.map((p) => {
        const t = teachers.find((tc) => tc.id === p.teacher_id);
        const cells = [
          (p.teacher_name ?? "").replace(/,/g, " "),
          (t?.bank_name ?? "").replace(/,/g, " "),
          (t?.bank_branch ?? "").replace(/,/g, " "),
          (t?.bank_account ?? "").replace(/,/g, " "),
          p.net_pay.toFixed(2),
          `Salary ${period} ${settings.name}`.replace(/,/g, " "),
          (t?.ssnit_number ?? "").replace(/,/g, " "),
          (t?.employee_id ?? p.teacher_id).replace(/,/g, " "),
        ];
        return cells.join(",");
      }),
    ];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    const missingBank = filtered.filter((p) => {
      const t = teachers.find((tc) => tc.id === p.teacher_id);
      return !t?.bank_account;
    }).length;
    if (missingBank > 0) {
      toast(`⚠ ${missingBank} staff missing bank details — fill them on /admin/staff before sending to the bank.`, { duration: 7000 });
    } else {
      toast.success(`✅ payroll-${period}.csv downloaded. Hand to your bank.`);
    }
  };

  // Printable payslips for the period — opens print dialog with one per page.
  const printPayslips = () => {
    if (filtered.length === 0) return;
    const w = window.open("", "_blank", "noopener,width=900,height=900");
    if (!w) { toast.error("Pop-up blocked. Allow pop-ups for this page."); return; }
    const period = `${MONTH_NAMES[month]} ${year}`;
    const css = `body{font-family:Inter,system-ui,Arial,sans-serif;margin:0;padding:0;color:#111}h1{margin:0 0 4px}.slip{padding:32px;page-break-after:always;border-bottom:1px dashed #ccc}.row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0;font-size:14px}.row b{font-weight:700}.net{font-size:20px;color:#15803d;font-weight:900;border-top:2px solid #15803d;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between}@media print{.slip{page-break-after:always}}`;
    const html = filtered.map((p) => {
      const t = teachers.find((tc) => tc.id === p.teacher_id);
      return `<div class="slip"><h1>${settings.name} — Payslip</h1><p>${period} · ${p.teacher_name ?? ""}${t?.employee_id ? ` · ${t.employee_id}` : ""}</p><div class="row"><span>Basic salary</span><b>GHS ${p.basic_salary.toFixed(2)}</b></div><div class="row"><span>Allowances</span><b>GHS ${p.allowances.toFixed(2)}</b></div><div class="row"><span>PAYE</span><b>− GHS ${p.paye.toFixed(2)}</b></div><div class="row"><span>SSNIT (5.5%)</span><b>− GHS ${p.ssnit_employee.toFixed(2)}</b></div><div class="net"><span>NET PAY</span><b>GHS ${p.net_pay.toFixed(2)}</b></div><p style="font-size:11px;color:#666;margin-top:14px">Employer SSNIT (13%): GHS ${p.ssnit_employer.toFixed(2)} (paid separately to SSNIT)${t?.bank_account ? ` · Credited to ${t.bank_name ?? "bank"} ${t.bank_account}` : ""}</p></div>`;
    }).join("");
    w.document.write(`<html><head><title>Payslips ${period}</title><style>${css}</style></head><body>${html}<script>window.print()</script></body></html>`);
    w.document.close();
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
          {filtered.length > 0 && (
            <>
              <button type="button"
                onClick={() => {
                  if (!window.confirm("Prorate every staff member's basic salary by their check-in days this month? (≥22 days = full salary.)")) return;
                  const res = proratePayroll(month, year);
                  toast.success(res.adjusted > 0
                    ? `📅 ${res.adjusted} staff member${res.adjusted === 1 ? "" : "s"} prorated.`
                    : "✅ Everyone hit 22+ days — no proration needed.");
                }}
                className="text-xs font-bold px-3 py-2 rounded-lg"
                style={{ background: "rgba(99,102,241,0.18)", color: "white", border: "1px solid rgba(99,102,241,0.5)" }}>
                📅 Prorate by attendance
              </button>
              <button type="button" onClick={downloadBankCSV}
                className="text-xs font-bold px-3 py-2 rounded-lg"
                style={{ background: "#22c55e", color: "white" }}>
                ⬇ Bank credit CSV
              </button>
              <button type="button" onClick={downloadPaystackTransferCSV}
                className="text-xs font-bold px-3 py-2 rounded-lg"
                style={{ background: "#0EA5E9", color: "white" }}
                title="Use the Paystack account you already collect fees on to pay staff. Cheaper than NIBSS bank credits.">
                ⬇ Paystack transfers CSV
              </button>
              <button type="button" onClick={printPayslips}
                className="text-xs font-bold px-3 py-2 rounded-lg"
                style={{ background: "rgba(26,14,77,0.08)", color: "#1A0E4D", border: "1px solid rgba(26,14,77,0.18)" }}>
                🖨 Print payslips
              </button>
            </>
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

      <div className="mt-3 rounded-xl p-4" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.25)" }}>
        <p className="text-xs text-gray-700">
          <strong>💡 How to actually pay staff (free / cheap options):</strong>
        </p>
        <ol className="text-xs text-gray-700 list-decimal pl-5 mt-2 space-y-1">
          <li>
            <strong>Paystack Transfers (recommended)</strong> — the same Paystack account that collects fees can also pay staff. ~GH₵1.50 per transfer, no setup. Tap <span className="font-mono">⬇ Paystack transfers CSV</span> above, then at <span className="font-mono">dashboard.paystack.com → Transfers → Bulk → Upload CSV</span>. Fill in each teacher&apos;s Paystack bank code once (one-time per teacher).
          </li>
          <li>
            <strong>Corporate Internet Banking (free)</strong> — most Ghana banks (GCB, Stanbic, Ecobank, Fidelity) accept the <span className="font-mono">⬇ Bank credit CSV</span> format as a batch upload through their corporate portal at no extra cost on business accounts.
          </li>
          <li>
            <strong>MTN MoMo Disbursement</strong> — for staff without bank accounts. Same CSV idea, uploaded at <span className="font-mono">momo.mtn.com.gh</span>.
          </li>
          <li>
            <strong>Manual</strong> — print payslips (button above), pay by transfer one by one. Last resort.
          </li>
        </ol>
      </div>
    </DashboardShell>
  );
}
