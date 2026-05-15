"use client";
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Student, Teacher, Fee, Payment, AttendanceRecord, Grade,
  HomeworkAssignment, LessonPlan, Announcement, CrecheLog,
  CanteenWallet, CanteenTransaction, FeedPost, Payroll, BECEAttempt, PickupCode,
  HomeworkSubmission, UserAccount, UserRole, QuizQuestion,
  SchoolSettings, ClassDef, Subject, AcademicYear, AcademicHoliday,
  Family, DiscountPolicy, DiscountTier,
} from '@/lib/types'
import {
  MOCK_STUDENTS, MOCK_TEACHERS, MOCK_FEES, MOCK_PAYMENTS,
  MOCK_ATTENDANCE, MOCK_GRADES, MOCK_HOMEWORK, MOCK_LESSON_PLANS,
  MOCK_ANNOUNCEMENTS, MOCK_CRECHE_LOG, MOCK_CANTEEN_WALLETS,
  MOCK_FEED_POSTS, MOCK_PAYROLL, MOCK_QUIZ_QUESTIONS,
  PHOENIX_SCHOOL_SETTINGS, PHOENIX_CLASSES, PHOENIX_SUBJECTS,
  PHOENIX_ACADEMIC_YEAR, PHOENIX_DISCOUNT_POLICY, MOCK_FAMILIES,
} from '@/lib/mockData'
import {
  generateReceiptNumber, generatePickupCode, getGESGrade,
  calculatePAYE, calculateSSNIT, todayISO,
} from '@/lib/utils'

interface AppState {
  students: Student[]
  teachers: Teacher[]
  fees: Fee[]
  payments: Payment[]
  attendance: AttendanceRecord[]
  grades: Grade[]
  homework: HomeworkAssignment[]
  lessonPlans: LessonPlan[]
  announcements: Announcement[]
  crecheLogs: CrecheLog[]
  canteenWallets: CanteenWallet[]
  canteenTransactions: CanteenTransaction[]
  feedPosts: FeedPost[]
  payroll: Payroll[]
  beceAttempts: BECEAttempt[]
  pickupCodes: PickupCode[]
  homeworkSubmissions: HomeworkSubmission[]
  accounts: UserAccount[]
  quizQuestions: QuizQuestion[]
  schoolSettings: SchoolSettings
  classes: ClassDef[]
  subjects: Subject[]
  academicYears: AcademicYear[]
  families: Family[]
  discountPolicy: DiscountPolicy

  // School configuration
  updateSchoolSettings: (data: Partial<SchoolSettings>) => void
  addClass: (c: Omit<ClassDef, 'id'>) => void
  updateClass: (id: string, data: Partial<ClassDef>) => void
  deleteClass: (id: string) => void
  addSubject: (s: Omit<Subject, 'id'>) => void
  updateSubject: (id: string, data: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void
  addAcademicYear: (y: Omit<AcademicYear, 'id'>) => void
  setCurrentAcademicYear: (id: string) => void
  addHoliday: (yearId: string, termNumber: 1 | 2 | 3, holiday: Omit<AcademicHoliday, 'id'>) => void
  removeHoliday: (yearId: string, termNumber: 1 | 2 | 3, holidayId: string) => void
  updateDiscountPolicy: (data: Partial<DiscountPolicy>) => void
  setDiscountTiers: (tiers: DiscountTier[]) => void
  upsertFamily: (f: Omit<Family, 'id' | 'created_at'> & { id?: string }) => Family
  setFamilyDiscountOverride: (familyId: string, percent: number | undefined, note?: string) => void
  computeFamilyDiscount: (familyId: string) => number

  // Students
  addStudent: (s: Omit<Student, 'id' | 'created_at'>) => void
  updateStudent: (id: string, data: Partial<Student>) => void
  deleteStudent: (id: string) => void

  // Fees & Payments
  recordPayment: (studentId: string, amount: number, method: Payment['method'], ref?: string) => void
  addFee: (fee: Omit<Fee, 'id' | 'created_at' | 'paid_amount' | 'status'>) => void
  topupCanteen: (studentId: string, amount: number) => void
  debitCanteen: (studentId: string, amount: number, desc: string) => void

  // Attendance
  saveAttendance: (records: AttendanceRecord[]) => void
  markParentNotified: (id: string) => void

  // Grades
  saveGrade: (grade: Omit<Grade, 'id' | 'ges_grade' | 'created_at'>) => void
  saveGrades: (grades: Array<Omit<Grade, 'id' | 'ges_grade' | 'created_at'>>) => void

  // Academic
  addHomework: (hw: Omit<HomeworkAssignment, 'id' | 'created_at'>) => void
  addLessonPlan: (lp: Omit<LessonPlan, 'id' | 'created_at'>) => void

  // Admin
  addAnnouncement: (a: Omit<Announcement, 'id' | 'created_at'>) => void
  addCrecheLog: (log: Omit<CrecheLog, 'id'>) => void

  // Feed
  addFeedPost: (p: Omit<FeedPost, 'id' | 'likes' | 'created_at'>) => void
  likePost: (id: string) => void

  // Homework submissions
  submitHomework: (homeworkId: string, studentId: string, studentName: string, fileName: string, fileType: string, fileSize: number) => void

  // BECE
  recordBECEAttempt: (studentId: string, subject: string, score: number, total: number) => void

  // Staff
  addTeacher: (t: Omit<Teacher, 'id'>) => void
  updateTeacher: (id: string, data: Partial<Teacher>) => void

  // Payroll
  generatePayroll: (month: number, year: number) => void
  markPayrollPaid: (id: string) => void

  // Account management
  createAccount: (data: { full_name: string; email: string; role: UserRole; linked_id?: string }) => UserAccount
  resetAccountPassword: (accountId: string) => string
  toggleAccount: (accountId: string) => void
  changeAccountPassword: (accountId: string, newPassword: string) => void
  markLoginUsed: (accountId: string) => void

  // Question bank
  addQuestion: (q: Omit<QuizQuestion, 'id' | 'created_at'>) => void
  addQuestions: (qs: Omit<QuizQuestion, 'id' | 'created_at'>[]) => void
  deleteQuestion: (id: string) => void
  updateQuestion: (id: string, data: Partial<Omit<QuizQuestion, 'id' | 'created_at'>>) => void

  // Pickup codes
  getOrCreatePickupCode: (studentId: string) => string
  verifyPickupCode: (code: string) => { student: Student | undefined; entry: PickupCode | undefined }
  markPickupUsed: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: MOCK_STUDENTS,
      teachers: MOCK_TEACHERS,
      fees: MOCK_FEES,
      payments: MOCK_PAYMENTS,
      attendance: MOCK_ATTENDANCE,
      grades: MOCK_GRADES,
      homework: MOCK_HOMEWORK,
      lessonPlans: MOCK_LESSON_PLANS,
      announcements: MOCK_ANNOUNCEMENTS,
      crecheLogs: MOCK_CRECHE_LOG,
      canteenWallets: MOCK_CANTEEN_WALLETS,
      canteenTransactions: [],
      feedPosts: MOCK_FEED_POSTS,
      payroll: MOCK_PAYROLL,
      beceAttempts: [],
      pickupCodes: [],
      homeworkSubmissions: [],
      accounts: [],
      quizQuestions: MOCK_QUIZ_QUESTIONS,
      schoolSettings: PHOENIX_SCHOOL_SETTINGS,
      classes: PHOENIX_CLASSES,
      subjects: PHOENIX_SUBJECTS,
      academicYears: [PHOENIX_ACADEMIC_YEAR],
      families: MOCK_FAMILIES,
      discountPolicy: PHOENIX_DISCOUNT_POLICY,

      updateSchoolSettings: (data) => set((st) => ({
        schoolSettings: { ...st.schoolSettings, ...data },
      })),

      addClass: (c) => set((st) => ({
        classes: [...st.classes, { ...c, id: `cls-${Date.now()}` }],
      })),

      updateClass: (id, data) => set((st) => ({
        classes: st.classes.map((c) => c.id === id ? { ...c, ...data } : c),
      })),

      deleteClass: (id) => set((st) => ({
        classes: st.classes.filter((c) => c.id !== id),
      })),

      addSubject: (s) => set((st) => ({
        subjects: [...st.subjects, { ...s, id: `sub-${Date.now()}` }],
      })),

      updateSubject: (id, data) => set((st) => ({
        subjects: st.subjects.map((s) => s.id === id ? { ...s, ...data } : s),
      })),

      deleteSubject: (id) => set((st) => ({
        subjects: st.subjects.filter((s) => s.id !== id),
      })),

      updateAcademicYear: (id, data) => set((st) => ({
        academicYears: st.academicYears.map((y) => y.id === id ? { ...y, ...data } : y),
      })),

      addAcademicYear: (y) => set((st) => ({
        academicYears: [...st.academicYears, { ...y, id: `ay-${Date.now()}` }],
      })),

      setCurrentAcademicYear: (id) => set((st) => ({
        academicYears: st.academicYears.map((y) => ({ ...y, is_current: y.id === id })),
        schoolSettings: {
          ...st.schoolSettings,
          current_academic_year: st.academicYears.find((y) => y.id === id)?.name ?? st.schoolSettings.current_academic_year,
        },
      })),

      addHoliday: (yearId, termNumber, holiday) => set((st) => ({
        academicYears: st.academicYears.map((y) => y.id !== yearId ? y : {
          ...y,
          terms: y.terms.map((t) => t.number !== termNumber ? t : {
            ...t,
            holidays: [...(t.holidays ?? []), { ...holiday, id: `hol-${Date.now()}` }],
          }),
        }),
      })),

      removeHoliday: (yearId, termNumber, holidayId) => set((st) => ({
        academicYears: st.academicYears.map((y) => y.id !== yearId ? y : {
          ...y,
          terms: y.terms.map((t) => t.number !== termNumber ? t : {
            ...t,
            holidays: (t.holidays ?? []).filter((h) => h.id !== holidayId),
          }),
        }),
      })),

      updateDiscountPolicy: (data) => set((st) => ({
        discountPolicy: { ...st.discountPolicy, ...data },
      })),

      setDiscountTiers: (tiers) => set((st) => ({
        discountPolicy: {
          ...st.discountPolicy,
          tiers: [...tiers].sort((a, b) => a.sibling_count - b.sibling_count),
        },
      })),

      upsertFamily: (f) => {
        const id = f.id ?? `fam-${Date.now()}`
        const existing = get().families.find((x) => x.id === id)
        const family: Family = {
          id,
          family_name: f.family_name,
          primary_parent_id: f.primary_parent_id,
          secondary_parent_id: f.secondary_parent_id,
          primary_email: f.primary_email,
          primary_phone: f.primary_phone,
          secondary_email: f.secondary_email,
          secondary_phone: f.secondary_phone,
          discount_override_percent: f.discount_override_percent,
          discount_override_note: f.discount_override_note,
          created_at: existing?.created_at ?? new Date().toISOString(),
        }
        set((st) => ({
          families: existing
            ? st.families.map((x) => x.id === id ? family : x)
            : [...st.families, family],
        }))
        return family
      },

      setFamilyDiscountOverride: (familyId, percent, note) => set((st) => ({
        families: st.families.map((f) => f.id === familyId
          ? { ...f, discount_override_percent: percent, discount_override_note: note }
          : f),
      })),

      computeFamilyDiscount: (familyId) => {
        const st = get()
        const family = st.families.find((f) => f.id === familyId)
        if (!family) return 0
        if (typeof family.discount_override_percent === 'number') return family.discount_override_percent
        if (!st.discountPolicy.active) return 0
        const siblingCount = st.students.filter((s) => s.family_id === familyId).length
        if (siblingCount < 1) return 0
        const tiers = [...st.discountPolicy.tiers].sort((a, b) => b.sibling_count - a.sibling_count)
        const tier = tiers.find((t) => siblingCount >= t.sibling_count)
        return tier?.percent ?? 0
      },

      addStudent: (s) => set((st) => ({
        students: [...st.students, { ...s, id: `s${Date.now()}`, created_at: new Date().toISOString() }],
      })),

      updateStudent: (id, data) => set((st) => ({
        students: st.students.map((s) => s.id === id ? { ...s, ...data } : s),
      })),

      deleteStudent: (id) => set((st) => ({
        students: st.students.filter((s) => s.id !== id),
      })),

      recordPayment: (studentId, amount, method, ref) => {
        const student = get().students.find((s) => s.id === studentId)
        const fee = get().fees.find((f) => f.student_id === studentId && f.status !== 'cleared')
        const receipt = generateReceiptNumber()
        const newPayment: Payment = {
          id: `p${Date.now()}`,
          student_id: studentId,
          student_name: student?.full_name,
          class_name: student?.class_name,
          fee_id: fee?.id,
          amount,
          method,
          reference: ref,
          receipt_number: receipt,
          paid_at: new Date().toISOString(),
        }
        set((st) => {
          const updatedFees = st.fees.map((f) => {
            if (f.student_id !== studentId) return f
            const newPaid = f.paid_amount + amount
            const status: Fee['status'] = newPaid >= f.amount ? 'cleared' : newPaid > 0 ? 'partial' : 'outstanding'
            return { ...f, paid_amount: newPaid, status }
          })
          const feeStatus = updatedFees.find((f) => f.student_id === studentId)?.status ?? 'outstanding'
          return {
            payments: [newPayment, ...st.payments],
            fees: updatedFees,
            students: st.students.map((s) => s.id === studentId ? { ...s, fee_status: feeStatus } : s),
          }
        })
      },

      addFee: (fee) => set((st) => ({
        fees: [...st.fees, { ...fee, id: `f${Date.now()}`, paid_amount: 0, status: 'outstanding', created_at: new Date().toISOString() }],
      })),

      topupCanteen: (studentId, amount) => {
        set((st) => {
          const wallets = st.canteenWallets.map((w) =>
            w.student_id === studentId ? { ...w, balance: w.balance + amount, updated_at: todayISO() } : w
          )
          const exists = wallets.some((w) => w.student_id === studentId)
          const student = get().students.find((s) => s.id === studentId)
          return {
            canteenWallets: exists ? wallets : [...wallets, { id: `cw${Date.now()}`, student_id: studentId, student_name: student?.full_name, class_name: student?.class_name, balance: amount, updated_at: todayISO() }],
            canteenTransactions: [...st.canteenTransactions, { id: `ct${Date.now()}`, student_id: studentId, student_name: student?.full_name, amount, type: 'credit' as const, description: 'Top-up via MoMo', created_at: new Date().toISOString() }],
          }
        })
      },

      debitCanteen: (studentId, amount, desc) => {
        const student = get().students.find((s) => s.id === studentId)
        set((st) => ({
          canteenWallets: st.canteenWallets.map((w) =>
            w.student_id === studentId ? { ...w, balance: Math.max(0, w.balance - amount), updated_at: todayISO() } : w
          ),
          canteenTransactions: [...st.canteenTransactions, { id: `ct${Date.now()}`, student_id: studentId, student_name: student?.full_name, amount, type: 'debit' as const, description: desc, created_at: new Date().toISOString() }],
        }))
      },

      saveAttendance: (records) => {
        const today = todayISO()
        set((st) => {
          const existing = st.attendance.filter((a) => a.date !== today || !records.find((r) => r.student_id === a.student_id))
          return { attendance: [...existing, ...records] }
        })
      },

      markParentNotified: (id) => set((st) => ({
        attendance: st.attendance.map((a) => a.id === id ? { ...a, parent_notified: true } : a),
      })),

      saveGrade: (grade) => {
        const ges_grade = getGESGrade(grade.raw_score)
        set((st) => {
          const exists = st.grades.findIndex((g) => g.student_id === grade.student_id && g.subject === grade.subject && g.term === grade.term && g.academic_year === grade.academic_year)
          if (exists >= 0) {
            const updated = [...st.grades]
            updated[exists] = { ...updated[exists], ...grade, ges_grade }
            return { grades: updated }
          }
          return { grades: [...st.grades, { ...grade, id: `g${Date.now()}`, ges_grade, created_at: new Date().toISOString() }] }
        })
      },

      saveGrades: (gradesList) => {
        gradesList.forEach((g) => get().saveGrade(g))
      },

      addHomework: (hw) => set((st) => ({
        homework: [...st.homework, { ...hw, id: `hw${Date.now()}`, submission_count: 0, created_at: new Date().toISOString() }],
      })),

      submitHomework: (homeworkId, studentId, studentName, fileName, fileType, fileSize) => {
        set((st) => {
          const alreadySubmitted = st.homeworkSubmissions.some(
            (s) => s.homework_id === homeworkId && s.student_id === studentId
          )
          if (alreadySubmitted) {
            // Replace existing submission
            return {
              homeworkSubmissions: st.homeworkSubmissions.map((s) =>
                s.homework_id === homeworkId && s.student_id === studentId
                  ? { ...s, file_name: fileName, file_type: fileType, file_size: fileSize, submitted_at: new Date().toISOString() }
                  : s
              ),
            }
          }
          return {
            homeworkSubmissions: [...st.homeworkSubmissions, {
              id: `sub${Date.now()}`,
              homework_id: homeworkId,
              student_id: studentId,
              student_name: studentName,
              file_name: fileName,
              file_type: fileType,
              file_size: fileSize,
              submitted_at: new Date().toISOString(),
            }],
            homework: st.homework.map((h) =>
              h.id === homeworkId ? { ...h, submission_count: (h.submission_count ?? 0) + 1 } : h
            ),
          }
        })
      },

      addLessonPlan: (lp) => set((st) => ({
        lessonPlans: [...st.lessonPlans, { ...lp, id: `lp${Date.now()}`, created_at: new Date().toISOString() }],
      })),

      addAnnouncement: (a) => set((st) => ({
        announcements: [{ ...a, id: `an${Date.now()}`, created_at: new Date().toISOString() }, ...st.announcements],
      })),

      addCrecheLog: (log) => set((st) => ({
        crecheLogs: [...st.crecheLogs.filter((c) => !(c.student_id === log.student_id && c.log_date === log.log_date)), { ...log, id: `cl${Date.now()}` }],
      })),

      addFeedPost: (p) => set((st) => ({
        feedPosts: [{ ...p, id: `fp${Date.now()}`, likes: 0, created_at: new Date().toISOString() }, ...st.feedPosts],
      })),

      likePost: (id) => set((st) => ({
        feedPosts: st.feedPosts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p),
      })),

      recordBECEAttempt: (studentId, subject, score, total) => set((st) => ({
        beceAttempts: [...st.beceAttempts, { id: `ba${Date.now()}`, student_id: studentId, subject, score, total, percentage: Math.round((score / total) * 100), completed_at: new Date().toISOString() }],
      })),

      addTeacher: (t) => set((st) => ({
        teachers: [...st.teachers, { ...t, id: `t${Date.now()}` }],
      })),

      updateTeacher: (id, data) => set((st) => ({
        teachers: st.teachers.map((t) => t.id === id ? { ...t, ...data } : t),
      })),

      generatePayroll: (month, year) => {
        const teachers = get().teachers
        const existing = get().payroll.filter((p) => p.month === month && p.year === year)
        if (existing.length > 0) return
        const newPayroll: Payroll[] = teachers.map((t) => {
          const paye = calculatePAYE(t.basic_salary)
          const ssnit = calculateSSNIT(t.basic_salary)
          return {
            id: `pay${Date.now()}-${t.id}`,
            teacher_id: t.id,
            teacher_name: t.full_name,
            month,
            year,
            basic_salary: t.basic_salary,
            allowances: 200,
            paye,
            ssnit_employee: ssnit.employee,
            ssnit_employer: ssnit.employer,
            net_pay: t.basic_salary + 200 - paye - ssnit.employee,
            paid: false,
          }
        })
        set((st) => ({ payroll: [...st.payroll, ...newPayroll] }))
      },

      markPayrollPaid: (id) => set((st) => ({
        payroll: st.payroll.map((p) => p.id === id ? { ...p, paid: true, paid_at: new Date().toISOString() } : p),
      })),

      createAccount: (data) => {
        const password = `Phoenix${Math.floor(1000 + Math.random() * 9000)}`
        const account: UserAccount = {
          id: `acc${Date.now()}`,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          password,
          is_active: true,
          force_password_change: true,
          created_at: new Date().toISOString(),
          linked_id: data.linked_id,
        }
        set((st) => ({ accounts: [...st.accounts, account] }))
        return account
      },

      resetAccountPassword: (accountId) => {
        const password = `Phoenix${Math.floor(1000 + Math.random() * 9000)}`
        set((st) => ({
          accounts: st.accounts.map((a) =>
            a.id === accountId ? { ...a, password, force_password_change: true } : a
          ),
        }))
        return password
      },

      toggleAccount: (accountId) => set((st) => ({
        accounts: st.accounts.map((a) => a.id === accountId ? { ...a, is_active: !a.is_active } : a),
      })),

      changeAccountPassword: (accountId, newPassword) => set((st) => ({
        accounts: st.accounts.map((a) =>
          a.id === accountId ? { ...a, password: newPassword, force_password_change: false } : a
        ),
      })),

      markLoginUsed: (accountId) => set((st) => ({
        accounts: st.accounts.map((a) =>
          a.id === accountId ? { ...a, last_login: new Date().toISOString() } : a
        ),
      })),

      addQuestion: (q) => set((st) => ({
        quizQuestions: [...st.quizQuestions, { ...q, id: `qq${Date.now()}`, created_at: new Date().toISOString() }],
      })),

      addQuestions: (qs) => set((st) => {
        const now = new Date().toISOString()
        const newQs = qs.map((q, i) => ({ ...q, id: `qq${Date.now()}-${i}`, created_at: now }))
        return { quizQuestions: [...st.quizQuestions, ...newQs] }
      }),

      deleteQuestion: (id) => set((st) => ({
        quizQuestions: st.quizQuestions.filter((q) => q.id !== id),
      })),

      updateQuestion: (id, data) => set((st) => ({
        quizQuestions: st.quizQuestions.map((q) => q.id === id ? { ...q, ...data } : q),
      })),

      getOrCreatePickupCode: (studentId) => {
        const today = todayISO()
        const existing = get().pickupCodes.find(
          (pc) => pc.student_id === studentId && pc.valid_date === today && !pc.used
        )
        if (existing) return existing.code
        const code = generatePickupCode()
        const student = get().students.find((s) => s.id === studentId)
        const entry: PickupCode = {
          id: `pc${Date.now()}`,
          student_id: studentId,
          student_name: student?.full_name,
          code,
          valid_date: today,
          used: false,
        }
        set((st) => ({ pickupCodes: [...st.pickupCodes, entry] }))
        return code
      },

      verifyPickupCode: (code) => {
        const today = todayISO()
        const entry = get().pickupCodes.find(
          (pc) => pc.code.toUpperCase() === code.toUpperCase().trim() && pc.valid_date === today
        )
        const student = entry ? get().students.find((s) => s.id === entry.student_id) : undefined
        return { student, entry }
      },

      markPickupUsed: (id) => set((st) => ({
        pickupCodes: st.pickupCodes.map((pc) =>
          pc.id === id ? { ...pc, used: true, used_at: new Date().toISOString() } : pc
        ),
      })),
    }),
    { name: 'phoenix-school-data' }
  )
)
