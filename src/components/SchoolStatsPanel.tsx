"use client";
import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";

const fmt = (n: number) => Math.round(n).toLocaleString("en-GH");

// Cost per SMS (Hubtel standard pricing) for credit-balance → SMS-count conversion
const SMS_UNIT_COST_GHS = 0.03;

export default function SchoolStatsPanel() {
  const students = useAppStore((s) => s.students);
  const families = useAppStore((s) => s.families);
  const fees = useAppStore((s) => s.fees);
  const payments = useAppStore((s) => s.payments);
  const teachers = useAppStore((s) => s.teachers);
  const accounts = useAppStore((s) => s.accounts);
  const classes = useAppStore((s) => s.classes);
  const settings = useAppStore((s) => s.schoolSettings);
  const policy = useAppStore((s) => s.discountPolicy);
  const computeFamilyDiscount = useAppStore((s) => s.computeFamilyDiscount);

  const currentTerm = settings.current_term;
  const currentYear = settings.current_academic_year;

  const stats = useMemo(() => {
    // ── Fees Info ──────────────────────────────────────────────
    const feesThisTerm = fees.filter(
      (f) => f.term === currentTerm && f.academic_year === currentYear,
    );
    const feesPrior = fees.filter(
      (f) =>
        f.status !== "cleared" &&
        (f.academic_year !== currentYear ||
          (f.academic_year === currentYear && f.term < currentTerm)),
    );

    const feeTypes = Array.from(new Set(feesThisTerm.map((f) => f.fee_type)));
    const billedClasses = new Set(feesThisTerm.map((f) => f.class_name).filter(Boolean));
    const billedStudents = new Set(feesThisTerm.map((f) => f.student_id));

    const sessionBill = feesThisTerm.reduce((sum, f) => sum + f.amount, 0);
    const previousArrears = feesPrior.reduce((sum, f) => sum + (f.amount - f.paid_amount), 0);
    const totalBill = sessionBill + previousArrears;

    // Discounts applied — derive from each billed student's family discount if policy active
    let discountsApplied = 0;
    if (policy.active) {
      for (const f of feesThisTerm) {
        if (!policy.applies_to_fee_types.includes(f.fee_type)) continue;
        const student = students.find((s) => s.id === f.student_id);
        if (!student?.family_id) continue;
        const pct = computeFamilyDiscount(student.family_id);
        if (pct > 0) {
          // f.amount is the post-discount amount; reconstruct the discount
          const original = f.amount / (1 - pct / 100);
          discountsApplied += original - f.amount;
        }
      }
    }

    const creditsApplied = 0; // no credits store yet
    const archivedStudentsDebt = 0; // active student set only — no archived flag in store yet
    const actualIncome = totalBill - discountsApplied - creditsApplied - archivedStudentsDebt;

    const amountPaid = payments
      .filter((p) => {
        const f = fees.find((fee) => fee.id === p.fee_id);
        return !f || f.academic_year === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const actualBalance = actualIncome - amountPaid;

    const advancePayments = feesThisTerm.reduce((sum, f) => {
      const over = f.paid_amount - f.amount;
      return sum + (over > 0 ? over : 0);
    }, 0);

    // ── School Info ────────────────────────────────────────────
    const totalStudents = students.length;

    // Guardians: count of distinct family records + students without a family (legacy parent_name)
    const orphanGuardians = students.filter((s) => !s.family_id && (s.parent_name || s.parent_phone));
    const totalGuardians = families.length * 2 - families.filter((f) => !f.secondary_email && !f.secondary_phone).length + orphanGuardians.length;

    // Employees: teachers + non-parent/non-student accounts (admin, principal, etc.)
    const staffAccounts = accounts.filter((a) => a.role !== "parent" && a.role !== "student");
    const totalEmployees = Math.max(teachers.length, staffAccounts.length);

    // SMS available — credit balance / unit cost
    const smsAvailable = Math.floor(settings.sms_credit_balance / SMS_UNIT_COST_GHS);

    return {
      // Fees Info
      feeName: `TERM ${currentTerm} ${currentYear}`,
      feesCount: feeTypes.length,
      classesBilled: billedClasses.size,
      studentsBilled: billedStudents.size,
      sessionBill,
      previousArrears,
      totalBill,
      discountsApplied,
      creditsApplied,
      archivedStudentsDebt,
      actualIncome,
      amountPaid,
      actualBalance,
      advancePayments,
      // School Info
      totalStudents,
      totalGuardians: Math.max(totalGuardians, 0),
      totalEmployees,
      smsAvailable,
    };
  }, [students, families, fees, payments, teachers, accounts, classes.length, policy, currentTerm, currentYear, settings.sms_credit_balance, computeFamilyDiscount]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <section className="glass rounded-2xl p-5">
        <header className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "rgba(99,102,241,0.12)" }}>🧮</span>
          <h3 className="font-black text-gray-900">Fees Info</h3>
        </header>
        <dl className="divide-y divide-gray-100 text-sm">
          <Row label="Fee Name" value={stats.feeName} mono />
          <Row label="Fees Count" value={fmt(stats.feesCount)} />
          <Row label="Classes Billed" value={fmt(stats.classesBilled)} />
          <Row label="Students Billed" value={fmt(stats.studentsBilled)} />
          <Row label="Session Bill" value={fmt(stats.sessionBill)} />
          <Row label="Previous Arrears" value={fmt(stats.previousArrears)} />
          <Row label="Total Bill" value={fmt(stats.totalBill)} strong />
          <Row label="Discounts Applied" value={fmt(stats.discountsApplied)} tone={stats.discountsApplied > 0 ? "good" : undefined} />
          <Row label="Credits Applied" value={fmt(stats.creditsApplied)} />
          <Row label="Archived Students Debt" value={fmt(stats.archivedStudentsDebt)} />
          <Row label="Actual Income" value={fmt(stats.actualIncome)} strong />
          <Row label="Amount Paid" value={fmt(stats.amountPaid)} tone="good" />
          <Row label="Actual Balance" value={fmt(stats.actualBalance)} tone={stats.actualBalance > 0 ? "warn" : "good"} strong />
          <Row label="Advance Payments" value={fmt(stats.advancePayments)} />
        </dl>
      </section>

      <section className="glass rounded-2xl p-5">
        <header className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "rgba(34,197,94,0.12)" }}>🏫</span>
          <h3 className="font-black text-gray-900">School Info</h3>
        </header>
        <dl className="divide-y divide-gray-100 text-sm">
          <Row label="Total Students" value={fmt(stats.totalStudents)} strong />
          <Row label="Total Guardians" value={fmt(stats.totalGuardians)} />
          <Row label="Total Employees" value={fmt(stats.totalEmployees)} />
          <Row label="SMS Available" value={stats.smsAvailable > 0 ? fmt(stats.smsAvailable) : `${fmt(stats.smsAvailable)} (top up)`} tone={stats.smsAvailable <= 0 ? "warn" : undefined} strong />
        </dl>
        {settings.sms_provider === "none" && (
          <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
            SMS is paused — Hubtel KYC pending. Once active, balance refreshes from the provider.
          </p>
        )}
      </section>
    </div>
  );
}

function Row({ label, value, mono, strong, tone }: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  tone?: "good" | "warn";
}) {
  const valueColor = tone === "good" ? "#15803d" : tone === "warn" ? "#b91c1c" : strong ? "#0f172a" : "#374151";
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-gray-500 font-medium">{label}</dt>
      <dd
        className={mono ? "font-mono text-xs" : ""}
        style={{
          color: valueColor,
          fontWeight: strong || tone ? 700 : 600,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
