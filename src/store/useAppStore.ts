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
  AssessmentTemplate, AssessmentMarker, AssessmentResult, AssessmentScoreEntry,
  SmsLog, FeePaymentRequest, FeePaymentRequestStatus,
  CourseGroup, Guardian, GuardianLink, WalletTransaction,
  FeeParticular, InstantFeeBucket, StandaloneFeeDiscount, FeeBilling, FeeBillingItem,
  StudentCategory,
  GradingGroup, GradeLevel, RemarkBank, RemarkEntry, AcademicAssessment,
  ReportSignatory, StudentInterest,
  EmployeeCategory, EmployeeDepartment, EmployeePosition, Employee, PermissionKey,
  AccountGroup, ChartAccount, BankAccount, BankBranch, FinanceTransaction, TransactionStatus,
} from '@/lib/types'
import {
  MOCK_STUDENTS, MOCK_TEACHERS, MOCK_FEES, MOCK_PAYMENTS,
  MOCK_ATTENDANCE, MOCK_GRADES, MOCK_HOMEWORK, MOCK_LESSON_PLANS,
  MOCK_ANNOUNCEMENTS, MOCK_CRECHE_LOG, MOCK_CANTEEN_WALLETS,
  MOCK_FEED_POSTS, MOCK_PAYROLL, MOCK_QUIZ_QUESTIONS,
  PHOENIX_SCHOOL_SETTINGS, PHOENIX_CLASSES, PHOENIX_SUBJECTS,
  PHOENIX_ACADEMIC_YEAR, PHOENIX_DISCOUNT_POLICY, MOCK_FAMILIES,
  PHOENIX_ASSESSMENT_TEMPLATES,
  PHOENIX_COURSE_GROUPS, MOCK_GUARDIANS, MOCK_GUARDIAN_LINKS,
  PHOENIX_FEE_PARTICULARS, PHOENIX_INSTANT_BUCKETS,
  PHOENIX_STANDALONE_DISCOUNTS, PHOENIX_FEE_BILLINGS,
  PHOENIX_GRADING_GROUPS, PHOENIX_REMARK_BANKS, PHOENIX_ACADEMIC_ASSESSMENTS,
  PHOENIX_SIGNATORIES, MOCK_STUDENT_INTERESTS,
  PHOENIX_EMPLOYEE_CATEGORIES, PHOENIX_EMPLOYEE_DEPARTMENTS,
  PHOENIX_EMPLOYEE_POSITIONS, MOCK_EMPLOYEES,
  PHOENIX_ACCOUNT_GROUPS, PHOENIX_CHART_ACCOUNTS, PHOENIX_BANK_ACCOUNTS,
  MOCK_FINANCE_TRANSACTIONS,
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
  assessmentTemplates: AssessmentTemplate[]
  assessmentResults: AssessmentResult[]
  smsLogs: SmsLog[]
  feePaymentRequests: FeePaymentRequest[]
  courseGroups: CourseGroup[]
  guardians: Guardian[]
  guardianLinks: GuardianLink[]
  walletTransactions: WalletTransaction[]
  feeParticulars: FeeParticular[]
  instantBuckets: InstantFeeBucket[]
  standaloneDiscounts: StandaloneFeeDiscount[]
  feeBillings: FeeBilling[]
  gradingGroups: GradingGroup[]
  remarkBanks: RemarkBank[]
  academicAssessments: AcademicAssessment[]
  signatories: ReportSignatory[]
  studentInterests: StudentInterest[]
  employeeCategories: EmployeeCategory[]
  employeeDepartments: EmployeeDepartment[]
  employeePositions: EmployeePosition[]
  employees: Employee[]
  accountGroups: AccountGroup[]
  chartAccounts: ChartAccount[]
  bankAccounts: BankAccount[]
  financeTransactions: FinanceTransaction[]

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
  generateFamilyInvite: (familyId: string, role: 'primary' | 'secondary') => string
  consumeFamilyInvite: (token: string, data: { full_name: string; email: string; phone?: string; password: string }) => { ok: true; familyId: string } | { ok: false; reason: string }

  // Assessments
  upsertAssessmentTemplate: (t: Omit<AssessmentTemplate, 'id' | 'created_at'> & { id?: string }) => AssessmentTemplate
  deleteAssessmentTemplate: (id: string) => void
  addMarker: (templateId: string, marker: Omit<AssessmentMarker, 'id'>) => void
  updateMarker: (templateId: string, markerId: string, data: Partial<AssessmentMarker>) => void
  removeMarker: (templateId: string, markerId: string) => void
  upsertAssessmentResult: (r: Omit<AssessmentResult, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => AssessmentResult
  setAssessmentEntry: (resultId: string, entry: AssessmentScoreEntry) => void
  setTeacherRemark: (resultId: string, remark: string, byName?: string) => void
  setHeadmasterRemark: (resultId: string, remark: string, byName?: string) => void
  finalizeResult: (resultId: string, finalized: boolean) => void

  // Messaging + payments
  logSms: (s: Omit<SmsLog, 'id' | 'created_at'>) => SmsLog
  updateSmsStatus: (id: string, patch: Partial<SmsLog>) => void
  setSmsBalance: (balance: number) => void
  createPaymentRequest: (r: Omit<FeePaymentRequest, 'id' | 'created_at'>) => FeePaymentRequest
  markPaymentRequestStatus: (id: string, status: FeePaymentRequestStatus, patch?: Partial<FeePaymentRequest>) => void

  // Course Groups
  addCourseGroup: (c: Omit<CourseGroup, 'id' | 'created_at'>) => CourseGroup
  updateCourseGroup: (id: string, data: Partial<CourseGroup>) => void
  deleteCourseGroup: (id: string) => void

  // Guardians
  addGuardian: (g: Omit<Guardian, 'id' | 'created_at'>) => Guardian
  updateGuardian: (id: string, data: Partial<Guardian>) => void
  deleteGuardian: (id: string) => void
  linkGuardianToStudent: (guardianId: string, studentId: string, isPrimary?: boolean) => void
  unlinkGuardianFromStudent: (guardianId: string, studentId: string) => void

  // Family wallet
  topUpFamilyWallet: (familyId: string, amount: number, description?: string, recordedBy?: string) => void
  debitFamilyWallet: (familyId: string, amount: number, description: string, recordedBy?: string) => boolean

  // Admission number generator
  nextAdmissionNumber: () => string

  // Fees Particulars
  addFeeParticular: (f: Omit<FeeParticular, 'id' | 'created_at'>) => FeeParticular
  updateFeeParticular: (id: string, data: Partial<FeeParticular>) => void
  deleteFeeParticular: (id: string) => void
  reorderFeeParticulars: (orderedIds: string[]) => void

  // Instant Fee Buckets
  addInstantBucket: (b: Omit<InstantFeeBucket, 'id' | 'created_at'>) => InstantFeeBucket
  updateInstantBucket: (id: string, data: Partial<InstantFeeBucket>) => void
  deleteInstantBucket: (id: string) => void

  // Standalone discounts
  addStandaloneDiscount: (d: Omit<StandaloneFeeDiscount, 'id' | 'created_at'>) => StandaloneFeeDiscount
  updateStandaloneDiscount: (id: string, data: Partial<StandaloneFeeDiscount>) => void
  deleteStandaloneDiscount: (id: string) => void

  // Fee Billing setups
  upsertFeeBilling: (b: Omit<FeeBilling, 'id' | 'created_at'> & { id?: string }) => FeeBilling
  deleteFeeBilling: (id: string) => void
  addBillingItem: (billingId: string, item: Omit<FeeBillingItem, 'id'>) => void
  updateBillingItem: (billingId: string, itemId: string, data: Partial<FeeBillingItem>) => void
  removeBillingItem: (billingId: string, itemId: string) => void
  publishBilling: (billingId: string) => { ok: true; created: number } | { ok: false; reason: string }

  // Grading groups
  addGradingGroup: (g: Omit<GradingGroup, 'id' | 'created_at'>) => GradingGroup
  updateGradingGroup: (id: string, data: Partial<GradingGroup>) => void
  deleteGradingGroup: (id: string) => void
  addGradeLevel: (groupId: string, lvl: Omit<GradeLevel, 'id'>) => void
  updateGradeLevel: (groupId: string, levelId: string, data: Partial<GradeLevel>) => void
  deleteGradeLevel: (groupId: string, levelId: string) => void

  // Remark banks
  addRemarkBank: (b: Omit<RemarkBank, 'id' | 'created_at' | 'remarks'>) => RemarkBank
  updateRemarkBank: (id: string, data: Partial<RemarkBank>) => void
  deleteRemarkBank: (id: string) => void
  addRemarkEntry: (bankId: string, entry: Omit<RemarkEntry, 'id'>) => void
  updateRemarkEntry: (bankId: string, entryId: string, data: Partial<RemarkEntry>) => void
  deleteRemarkEntry: (bankId: string, entryId: string) => void

  // Academic Assessments
  addAcademicAssessment: (a: Omit<AcademicAssessment, 'id' | 'created_at'>) => AcademicAssessment
  updateAcademicAssessment: (id: string, data: Partial<AcademicAssessment>) => void
  deleteAcademicAssessment: (id: string) => void

  // Signatories
  upsertSignatory: (s: Omit<ReportSignatory, 'id'> & { id?: string }) => ReportSignatory
  deleteSignatory: (id: string) => void

  // Student interests
  addStudentInterest: (i: Omit<StudentInterest, 'id' | 'created_at'>) => StudentInterest
  removeStudentInterest: (id: string) => void

  // HR — Categories
  addEmployeeCategory: (c: Omit<EmployeeCategory, 'id' | 'created_at'>) => EmployeeCategory
  updateEmployeeCategory: (id: string, data: Partial<EmployeeCategory>) => void
  deleteEmployeeCategory: (id: string) => void

  // HR — Departments
  addEmployeeDepartment: (d: Omit<EmployeeDepartment, 'id' | 'created_at'>) => EmployeeDepartment
  updateEmployeeDepartment: (id: string, data: Partial<EmployeeDepartment>) => void
  deleteEmployeeDepartment: (id: string) => void

  // HR — Positions
  addEmployeePosition: (p: Omit<EmployeePosition, 'id' | 'created_at'>) => EmployeePosition
  updateEmployeePosition: (id: string, data: Partial<EmployeePosition>) => void
  deleteEmployeePosition: (id: string) => void

  // HR — Employees + RBAC
  upsertEmployee: (e: Omit<Employee, 'id' | 'created_at'> & { id?: string }) => Employee
  deleteEmployee: (id: string) => void
  setEmployeePermissions: (employeeId: string, permissions: PermissionKey[]) => void
  nextEmployeeId: () => string

  // Finance bookkeeping
  addAccountGroup: (g: Omit<AccountGroup, 'id' | 'created_at'>) => AccountGroup
  updateAccountGroup: (id: string, data: Partial<AccountGroup>) => void
  deleteAccountGroup: (id: string) => void
  addChartAccount: (a: Omit<ChartAccount, 'id' | 'created_at'>) => ChartAccount
  updateChartAccount: (id: string, data: Partial<ChartAccount>) => void
  deleteChartAccount: (id: string) => void
  addBank: (b: Omit<BankAccount, 'id' | 'created_at' | 'branches'>) => BankAccount
  updateBank: (id: string, data: Partial<BankAccount>) => void
  deleteBank: (id: string) => void
  addBankBranch: (bankId: string, branch: Omit<BankBranch, 'id' | 'bank_id'>) => void
  removeBankBranch: (bankId: string, branchId: string) => void
  createFinanceTransaction: (t: Omit<FinanceTransaction, 'id' | 'created_at' | 'status'> & { status?: TransactionStatus }) => FinanceTransaction
  approveFinanceTransaction: (id: string, employeeId?: string) => void
  rejectFinanceTransaction: (id: string) => void
  payFinanceTransaction: (id: string, employeeId?: string) => void

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
      assessmentTemplates: PHOENIX_ASSESSMENT_TEMPLATES,
      assessmentResults: [],
      smsLogs: [],
      feePaymentRequests: [],
      courseGroups: PHOENIX_COURSE_GROUPS,
      guardians: MOCK_GUARDIANS,
      guardianLinks: MOCK_GUARDIAN_LINKS,
      walletTransactions: [],
      feeParticulars: PHOENIX_FEE_PARTICULARS,
      instantBuckets: PHOENIX_INSTANT_BUCKETS,
      standaloneDiscounts: PHOENIX_STANDALONE_DISCOUNTS,
      feeBillings: PHOENIX_FEE_BILLINGS,
      gradingGroups: PHOENIX_GRADING_GROUPS,
      remarkBanks: PHOENIX_REMARK_BANKS,
      academicAssessments: PHOENIX_ACADEMIC_ASSESSMENTS,
      signatories: PHOENIX_SIGNATORIES,
      studentInterests: MOCK_STUDENT_INTERESTS,
      employeeCategories: PHOENIX_EMPLOYEE_CATEGORIES,
      employeeDepartments: PHOENIX_EMPLOYEE_DEPARTMENTS,
      employeePositions: PHOENIX_EMPLOYEE_POSITIONS,
      employees: MOCK_EMPLOYEES,
      accountGroups: PHOENIX_ACCOUNT_GROUPS,
      chartAccounts: PHOENIX_CHART_ACCOUNTS,
      bankAccounts: PHOENIX_BANK_ACCOUNTS,
      financeTransactions: MOCK_FINANCE_TRANSACTIONS,

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
          family_code: f.family_code ?? existing?.family_code,
          discount_override_percent: f.discount_override_percent,
          discount_override_note: f.discount_override_note,
          wallet_balance: existing?.wallet_balance ?? f.wallet_balance ?? 0,
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

      generateFamilyInvite: (familyId, role) => {
        const token = `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        set((st) => ({
          families: st.families.map((f) => f.id === familyId
            ? { ...f, invite_token: token, invite_role: role, invite_expires_at: expires }
            : f),
        }))
        return token
      },

      consumeFamilyInvite: (token, data) => {
        const family = get().families.find((f) => f.invite_token === token)
        if (!family) return { ok: false, reason: 'Invite link is invalid or has been used.' }
        if (family.invite_expires_at && new Date(family.invite_expires_at) < new Date()) {
          return { ok: false, reason: 'Invite link has expired. Ask the school to send a new one.' }
        }
        if (!data.email.trim() || !data.password || data.password.length < 6) {
          return { ok: false, reason: 'Email and a password of at least 6 characters are required.' }
        }
        // Create UserAccount
        const accountId = `acc-${Date.now()}`
        const newAccount: UserAccount = {
          id: accountId,
          full_name: data.full_name.trim(),
          email: data.email.trim().toLowerCase(),
          role: 'parent',
          password: data.password,
          is_active: true,
          force_password_change: false,
          created_at: new Date().toISOString(),
          linked_id: family.id,
        }
        // Update family with the new parent contact info and clear invite token
        const isPrimary = family.invite_role === 'primary'
        const updatedFamily: Family = isPrimary
          ? {
              ...family,
              primary_parent_id: accountId,
              primary_email: data.email.trim().toLowerCase(),
              primary_phone: data.phone?.trim() || family.primary_phone,
              invite_token: undefined,
              invite_role: undefined,
              invite_expires_at: undefined,
            }
          : {
              ...family,
              secondary_parent_id: accountId,
              secondary_email: data.email.trim().toLowerCase(),
              secondary_phone: data.phone?.trim() || family.secondary_phone,
              invite_token: undefined,
              invite_role: undefined,
              invite_expires_at: undefined,
            }
        set((st) => ({
          accounts: [...st.accounts, newAccount],
          families: st.families.map((f) => f.id === family.id ? updatedFamily : f),
        }))
        return { ok: true, familyId: family.id }
      },

      upsertAssessmentTemplate: (t) => {
        const id = t.id ?? `tmpl-${Date.now()}`
        const existing = get().assessmentTemplates.find((x) => x.id === id)
        const tmpl: AssessmentTemplate = {
          id,
          class_id: t.class_id,
          name: t.name,
          scope: t.scope,
          scale: t.scale,
          markers: t.markers,
          description: t.description,
          active: t.active,
          created_at: existing?.created_at ?? new Date().toISOString(),
        }
        set((st) => ({
          assessmentTemplates: existing
            ? st.assessmentTemplates.map((x) => x.id === id ? tmpl : x)
            : [...st.assessmentTemplates, tmpl],
        }))
        return tmpl
      },

      deleteAssessmentTemplate: (id) => set((st) => ({
        assessmentTemplates: st.assessmentTemplates.filter((t) => t.id !== id),
        assessmentResults: st.assessmentResults.filter((r) => r.template_id !== id),
      })),

      addMarker: (templateId, marker) => set((st) => ({
        assessmentTemplates: st.assessmentTemplates.map((t) => t.id !== templateId ? t : {
          ...t,
          markers: [...t.markers, { ...marker, id: `mk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        }),
      })),

      updateMarker: (templateId, markerId, data) => set((st) => ({
        assessmentTemplates: st.assessmentTemplates.map((t) => t.id !== templateId ? t : {
          ...t,
          markers: t.markers.map((m) => m.id === markerId ? { ...m, ...data } : m),
        }),
      })),

      removeMarker: (templateId, markerId) => set((st) => ({
        assessmentTemplates: st.assessmentTemplates.map((t) => t.id !== templateId ? t : {
          ...t,
          markers: t.markers.filter((m) => m.id !== markerId),
        }),
      })),

      upsertAssessmentResult: (r) => {
        const id = r.id ?? `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const existing = get().assessmentResults.find((x) => x.id === id)
        const now = new Date().toISOString()
        const result: AssessmentResult = {
          id,
          template_id: r.template_id,
          student_id: r.student_id,
          term: r.term,
          academic_year: r.academic_year,
          entries: r.entries,
          teacher_remark: r.teacher_remark,
          teacher_remark_by: r.teacher_remark_by,
          headmaster_remark: r.headmaster_remark,
          headmaster_remark_by: r.headmaster_remark_by,
          finalized: r.finalized,
          created_at: existing?.created_at ?? now,
          updated_at: now,
        }
        set((st) => ({
          assessmentResults: existing
            ? st.assessmentResults.map((x) => x.id === id ? result : x)
            : [...st.assessmentResults, result],
        }))
        return result
      },

      setAssessmentEntry: (resultId, entry) => set((st) => ({
        assessmentResults: st.assessmentResults.map((r) => {
          if (r.id !== resultId) return r
          const others = r.entries.filter((e) => e.marker_id !== entry.marker_id)
          return { ...r, entries: [...others, entry], updated_at: new Date().toISOString() }
        }),
      })),

      setTeacherRemark: (resultId, remark, byName) => set((st) => ({
        assessmentResults: st.assessmentResults.map((r) => r.id === resultId
          ? { ...r, teacher_remark: remark, teacher_remark_by: byName, updated_at: new Date().toISOString() }
          : r),
      })),

      setHeadmasterRemark: (resultId, remark, byName) => set((st) => ({
        assessmentResults: st.assessmentResults.map((r) => r.id === resultId
          ? { ...r, headmaster_remark: remark, headmaster_remark_by: byName, updated_at: new Date().toISOString() }
          : r),
      })),

      finalizeResult: (resultId, finalized) => set((st) => ({
        assessmentResults: st.assessmentResults.map((r) => r.id === resultId
          ? { ...r, finalized, updated_at: new Date().toISOString() }
          : r),
      })),

      logSms: (s) => {
        const id = `sms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const entry: SmsLog = { ...s, id, created_at: new Date().toISOString() }
        set((st) => ({ smsLogs: [entry, ...st.smsLogs] }))
        return entry
      },

      updateSmsStatus: (id, patch) => set((st) => ({
        smsLogs: st.smsLogs.map((s) => s.id === id ? { ...s, ...patch } : s),
      })),

      setSmsBalance: (balance) => set((st) => ({
        schoolSettings: {
          ...st.schoolSettings,
          sms_credit_balance: balance,
          hubtel_last_balance_check: new Date().toISOString(),
        },
      })),

      createPaymentRequest: (r) => {
        const id = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const req: FeePaymentRequest = { ...r, id, created_at: new Date().toISOString() }
        set((st) => ({ feePaymentRequests: [req, ...st.feePaymentRequests] }))
        return req
      },

      markPaymentRequestStatus: (id, status, patch) => set((st) => ({
        feePaymentRequests: st.feePaymentRequests.map((r) => r.id === id
          ? { ...r, status, ...(patch ?? {}), paid_at: status === 'paid' ? new Date().toISOString() : r.paid_at }
          : r),
      })),

      addCourseGroup: (c) => {
        const id = `cg-${Date.now()}`
        const group: CourseGroup = { ...c, id, created_at: new Date().toISOString() }
        set((st) => ({ courseGroups: [...st.courseGroups, group] }))
        return group
      },
      updateCourseGroup: (id, data) => set((st) => ({
        courseGroups: st.courseGroups.map((c) => c.id === id ? { ...c, ...data } : c),
      })),
      deleteCourseGroup: (id) => set((st) => ({
        courseGroups: st.courseGroups.filter((c) => c.id !== id),
      })),

      addGuardian: (g) => {
        const id = `gd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const guardian: Guardian = { ...g, id, created_at: new Date().toISOString() }
        set((st) => ({ guardians: [...st.guardians, guardian] }))
        return guardian
      },
      updateGuardian: (id, data) => set((st) => ({
        guardians: st.guardians.map((g) => g.id === id ? { ...g, ...data } : g),
      })),
      deleteGuardian: (id) => set((st) => ({
        guardians: st.guardians.filter((g) => g.id !== id),
        guardianLinks: st.guardianLinks.filter((l) => l.guardian_id !== id),
      })),
      linkGuardianToStudent: (guardianId, studentId, isPrimary = false) => set((st) => {
        const exists = st.guardianLinks.some((l) => l.guardian_id === guardianId && l.student_id === studentId)
        if (exists) return st
        const newLink: GuardianLink = {
          id: `gl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          guardian_id: guardianId,
          student_id: studentId,
          is_primary: isPrimary,
          created_at: new Date().toISOString(),
        }
        return { guardianLinks: [...st.guardianLinks, newLink] }
      }),
      unlinkGuardianFromStudent: (guardianId, studentId) => set((st) => ({
        guardianLinks: st.guardianLinks.filter((l) => !(l.guardian_id === guardianId && l.student_id === studentId)),
      })),

      topUpFamilyWallet: (familyId, amount, description = 'Top-up', recordedBy) => {
        if (amount <= 0) return
        const txId = `wt-${Date.now()}`
        const tx: WalletTransaction = {
          id: txId,
          family_id: familyId,
          amount,
          type: 'topup',
          description,
          recorded_by: recordedBy,
          created_at: new Date().toISOString(),
        }
        set((st) => ({
          families: st.families.map((f) => f.id === familyId
            ? { ...f, wallet_balance: (f.wallet_balance ?? 0) + amount }
            : f),
          walletTransactions: [tx, ...st.walletTransactions],
        }))
      },
      debitFamilyWallet: (familyId, amount, description, recordedBy) => {
        if (amount <= 0) return false
        const family = get().families.find((f) => f.id === familyId)
        if (!family) return false
        if ((family.wallet_balance ?? 0) < amount) return false
        const tx: WalletTransaction = {
          id: `wt-${Date.now()}`,
          family_id: familyId,
          amount,
          type: 'fee_payment',
          description,
          recorded_by: recordedBy,
          created_at: new Date().toISOString(),
        }
        set((st) => ({
          families: st.families.map((f) => f.id === familyId
            ? { ...f, wallet_balance: (f.wallet_balance ?? 0) - amount }
            : f),
          walletTransactions: [tx, ...st.walletTransactions],
        }))
        return true
      },

      addFeeParticular: (f) => {
        const id = `fp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: FeeParticular = { ...f, id, created_at: new Date().toISOString() }
        set((st) => ({ feeParticulars: [...st.feeParticulars, item].sort((a, b) => a.priority - b.priority) }))
        return item
      },
      updateFeeParticular: (id, data) => set((st) => ({
        feeParticulars: st.feeParticulars.map((f) => f.id === id ? { ...f, ...data } : f)
          .sort((a, b) => a.priority - b.priority),
      })),
      deleteFeeParticular: (id) => set((st) => ({
        feeParticulars: st.feeParticulars.filter((f) => f.id !== id),
        instantBuckets: st.instantBuckets.filter((b) => b.particular_id !== id),
        feeBillings: st.feeBillings.map((b) => ({
          ...b,
          items: b.items.filter((i) => i.particular_id !== id),
        })),
      })),
      reorderFeeParticulars: (orderedIds) => set((st) => ({
        feeParticulars: st.feeParticulars
          .map((f) => {
            const idx = orderedIds.indexOf(f.id)
            return idx >= 0 ? { ...f, priority: idx + 1 } : f
          })
          .sort((a, b) => a.priority - b.priority),
      })),

      addInstantBucket: (b) => {
        const id = `ib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: InstantFeeBucket = { ...b, id, created_at: new Date().toISOString() }
        set((st) => ({ instantBuckets: [...st.instantBuckets, item] }))
        return item
      },
      updateInstantBucket: (id, data) => set((st) => ({
        instantBuckets: st.instantBuckets.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      deleteInstantBucket: (id) => set((st) => ({
        instantBuckets: st.instantBuckets.filter((b) => b.id !== id),
      })),

      addStandaloneDiscount: (d) => {
        const id = `sd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: StandaloneFeeDiscount = { ...d, id, created_at: new Date().toISOString() }
        set((st) => ({ standaloneDiscounts: [...st.standaloneDiscounts, item] }))
        return item
      },
      updateStandaloneDiscount: (id, data) => set((st) => ({
        standaloneDiscounts: st.standaloneDiscounts.map((d) => d.id === id ? { ...d, ...data } : d),
      })),
      deleteStandaloneDiscount: (id) => set((st) => ({
        standaloneDiscounts: st.standaloneDiscounts.filter((d) => d.id !== id),
      })),

      upsertFeeBilling: (b) => {
        const id = b.id ?? `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const existing = get().feeBillings.find((x) => x.id === id)
        const item: FeeBilling = {
          id,
          name: b.name,
          academic_year: b.academic_year,
          term: b.term,
          items: b.items,
          is_published: b.is_published,
          published_at: b.published_at ?? existing?.published_at,
          created_at: existing?.created_at ?? new Date().toISOString(),
        }
        set((st) => ({
          feeBillings: existing
            ? st.feeBillings.map((x) => x.id === id ? item : x)
            : [...st.feeBillings, item],
        }))
        return item
      },
      deleteFeeBilling: (id) => set((st) => ({
        feeBillings: st.feeBillings.filter((b) => b.id !== id),
      })),
      addBillingItem: (billingId, item) => set((st) => ({
        feeBillings: st.feeBillings.map((b) => b.id !== billingId ? b : {
          ...b,
          items: [...b.items, { ...item, id: `fbi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        }),
      })),
      updateBillingItem: (billingId, itemId, data) => set((st) => ({
        feeBillings: st.feeBillings.map((b) => b.id !== billingId ? b : {
          ...b,
          items: b.items.map((i) => i.id === itemId ? { ...i, ...data } : i),
        }),
      })),
      removeBillingItem: (billingId, itemId) => set((st) => ({
        feeBillings: st.feeBillings.map((b) => b.id !== billingId ? b : {
          ...b,
          items: b.items.filter((i) => i.id !== itemId),
        }),
      })),
      publishBilling: (billingId) => {
        const st = get()
        const billing = st.feeBillings.find((b) => b.id === billingId)
        if (!billing) return { ok: false, reason: 'Billing not found.' }
        if (billing.items.length === 0) return { ok: false, reason: 'No fee items to publish.' }
        const particularById = new Map(st.feeParticulars.map((f) => [f.id, f]))
        const classNameById = new Map(st.classes.map((c) => [c.id, c.name]))
        const studentsByClass = new Map<string, typeof st.students>()
        for (const s of st.students) {
          if (!studentsByClass.has(s.class_name)) studentsByClass.set(s.class_name, [])
          studentsByClass.get(s.class_name)!.push(s)
        }
        const discountPolicy = st.discountPolicy
        const computeDiscount = (familyId?: string): number => {
          if (!familyId) return 0
          const family = st.families.find((f) => f.id === familyId)
          if (!family) return 0
          if (typeof family.discount_override_percent === 'number') return family.discount_override_percent
          if (!discountPolicy.active) return 0
          const sibCount = st.students.filter((x) => x.family_id === familyId).length
          if (sibCount < 1) return 0
          const tiers = [...discountPolicy.tiers].sort((a, b) => b.sibling_count - a.sibling_count)
          return tiers.find((t) => sibCount >= t.sibling_count)?.percent ?? 0
        }
        let created = 0
        const newFees = [...st.fees]
        for (const it of billing.items) {
          const targetClassNames = it.class_ids.length > 0
            ? it.class_ids.map((cid) => classNameById.get(cid) ?? '').filter(Boolean)
            : Array.from(classNameById.values())
          const targetStudents = targetClassNames.flatMap((cn) => studentsByClass.get(cn) ?? [])
          const targetCategories = it.categories ?? []
          const targetCourseGroups = it.course_group_ids ?? []
          const targetSpecific = it.student_ids ?? []
          for (const s of targetStudents) {
            if (targetCategories.length > 0 && !targetCategories.includes(s.category ?? 'continuing')) continue
            if (targetCourseGroups.length > 0 && !(s.course_group_id && targetCourseGroups.includes(s.course_group_id))) continue
            if (targetSpecific.length > 0 && !targetSpecific.includes(s.id)) continue
            const exists = newFees.some(
              (f) => f.student_id === s.id
                && f.fee_type === (particularById.get(it.particular_id)?.name ?? '')
                && f.term === billing.term
                && f.academic_year === billing.academic_year,
            )
            if (exists) continue
            const particular = particularById.get(it.particular_id)
            if (!particular) continue
            // Apply sibling discount if applicable
            let amount = it.amount
            if (discountPolicy.applies_to_fee_types.includes(particular.name)) {
              const pct = computeDiscount(s.family_id)
              if (pct > 0) amount = Math.round(amount * (1 - pct / 100) * 100) / 100
            }
            newFees.push({
              id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              student_id: s.id,
              student_name: s.full_name,
              class_name: s.class_name,
              term: billing.term,
              academic_year: billing.academic_year,
              fee_type: particular.name,
              amount,
              paid_amount: 0,
              status: 'outstanding',
              due_date: it.due_date,
              created_at: new Date().toISOString(),
            })
            created++
          }
        }
        set((s2) => ({
          fees: newFees,
          feeBillings: s2.feeBillings.map((b) => b.id === billingId
            ? { ...b, is_published: true, published_at: new Date().toISOString() }
            : b),
        }))
        return { ok: true, created }
      },

      addGradingGroup: (g) => {
        const id = `gg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: GradingGroup = { ...g, id, created_at: new Date().toISOString() }
        set((st) => ({ gradingGroups: [...st.gradingGroups, item] }))
        return item
      },
      updateGradingGroup: (id, data) => set((st) => ({
        gradingGroups: st.gradingGroups.map((g) => g.id === id ? { ...g, ...data } : g),
      })),
      deleteGradingGroup: (id) => set((st) => ({
        gradingGroups: st.gradingGroups.filter((g) => g.id !== id),
      })),
      addGradeLevel: (groupId, lvl) => set((st) => ({
        gradingGroups: st.gradingGroups.map((g) => g.id !== groupId ? g : {
          ...g,
          levels: [...g.levels, { ...lvl, id: `gl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        }),
      })),
      updateGradeLevel: (groupId, levelId, data) => set((st) => ({
        gradingGroups: st.gradingGroups.map((g) => g.id !== groupId ? g : {
          ...g,
          levels: g.levels.map((l) => l.id === levelId ? { ...l, ...data } : l),
        }),
      })),
      deleteGradeLevel: (groupId, levelId) => set((st) => ({
        gradingGroups: st.gradingGroups.map((g) => g.id !== groupId ? g : {
          ...g,
          levels: g.levels.filter((l) => l.id !== levelId),
        }),
      })),

      addRemarkBank: (b) => {
        const id = `rb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: RemarkBank = { ...b, id, remarks: [], created_at: new Date().toISOString() }
        set((st) => ({ remarkBanks: [...st.remarkBanks, item] }))
        return item
      },
      updateRemarkBank: (id, data) => set((st) => ({
        remarkBanks: st.remarkBanks.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      deleteRemarkBank: (id) => set((st) => ({
        remarkBanks: st.remarkBanks.filter((b) => b.id !== id),
      })),
      addRemarkEntry: (bankId, entry) => set((st) => ({
        remarkBanks: st.remarkBanks.map((b) => b.id !== bankId ? b : {
          ...b,
          remarks: [...b.remarks, { ...entry, id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        }),
      })),
      updateRemarkEntry: (bankId, entryId, data) => set((st) => ({
        remarkBanks: st.remarkBanks.map((b) => b.id !== bankId ? b : {
          ...b,
          remarks: b.remarks.map((r) => r.id === entryId ? { ...r, ...data } : r),
        }),
      })),
      deleteRemarkEntry: (bankId, entryId) => set((st) => ({
        remarkBanks: st.remarkBanks.map((b) => b.id !== bankId ? b : {
          ...b,
          remarks: b.remarks.filter((r) => r.id !== entryId),
        }),
      })),

      addAcademicAssessment: (a) => {
        const id = `aa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: AcademicAssessment = { ...a, id, created_at: new Date().toISOString() }
        set((st) => ({ academicAssessments: [...st.academicAssessments, item] }))
        return item
      },
      updateAcademicAssessment: (id, data) => set((st) => ({
        academicAssessments: st.academicAssessments.map((a) => a.id === id ? { ...a, ...data } : a),
      })),
      deleteAcademicAssessment: (id) => set((st) => ({
        academicAssessments: st.academicAssessments.filter((a) => a.id !== id),
      })),

      upsertSignatory: (s) => {
        const id = s.id ?? `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const existing = get().signatories.find((x) => x.id === id)
        const item: ReportSignatory = {
          id,
          role_label: s.role_label,
          full_name: s.full_name,
          signature_url: s.signature_url,
          active: s.active,
          order: s.order,
        }
        set((st) => ({
          signatories: existing
            ? st.signatories.map((x) => x.id === id ? item : x)
            : [...st.signatories, item],
        }))
        return item
      },
      deleteSignatory: (id) => set((st) => ({
        signatories: st.signatories.filter((s) => s.id !== id),
      })),

      addStudentInterest: (i) => {
        const id = `si-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: StudentInterest = { ...i, id, created_at: new Date().toISOString() }
        set((st) => ({ studentInterests: [...st.studentInterests, item] }))
        return item
      },
      removeStudentInterest: (id) => set((st) => ({
        studentInterests: st.studentInterests.filter((i) => i.id !== id),
      })),

      addEmployeeCategory: (c) => {
        const id = `ec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: EmployeeCategory = { ...c, id, created_at: new Date().toISOString() }
        set((st) => ({ employeeCategories: [...st.employeeCategories, item] }))
        return item
      },
      updateEmployeeCategory: (id, data) => set((st) => ({
        employeeCategories: st.employeeCategories.map((c) => c.id === id ? { ...c, ...data } : c),
      })),
      deleteEmployeeCategory: (id) => set((st) => ({
        employeeCategories: st.employeeCategories.filter((c) => c.id !== id),
      })),

      addEmployeeDepartment: (d) => {
        const id = `ed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: EmployeeDepartment = { ...d, id, created_at: new Date().toISOString() }
        set((st) => ({ employeeDepartments: [...st.employeeDepartments, item] }))
        return item
      },
      updateEmployeeDepartment: (id, data) => set((st) => ({
        employeeDepartments: st.employeeDepartments.map((d) => d.id === id ? { ...d, ...data } : d),
      })),
      deleteEmployeeDepartment: (id) => set((st) => ({
        employeeDepartments: st.employeeDepartments.filter((d) => d.id !== id),
      })),

      addEmployeePosition: (p) => {
        const id = `ep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: EmployeePosition = { ...p, id, created_at: new Date().toISOString() }
        set((st) => ({ employeePositions: [...st.employeePositions, item] }))
        return item
      },
      updateEmployeePosition: (id, data) => set((st) => ({
        employeePositions: st.employeePositions.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      deleteEmployeePosition: (id) => set((st) => ({
        employeePositions: st.employeePositions.filter((p) => p.id !== id),
      })),

      upsertEmployee: (e) => {
        const id = e.id ?? `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const existing = get().employees.find((x) => x.id === id)
        const item: Employee = {
          id,
          employee_id: e.employee_id,
          full_name: e.full_name,
          other_names: e.other_names,
          email: e.email,
          phone: e.phone,
          alt_phone: e.alt_phone,
          emergency_contact: e.emergency_contact,
          gender: e.gender,
          dob: e.dob,
          ssn: e.ssn,
          nationality: e.nationality,
          residential_city: e.residential_city,
          address: e.address,
          photo_url: e.photo_url,
          category_id: e.category_id,
          department_id: e.department_id,
          position_id: e.position_id,
          supervisor_id: e.supervisor_id,
          qualification: e.qualification,
          date_of_employment: e.date_of_employment,
          status: e.status,
          class_ids: e.class_ids,
          subject_ids: e.subject_ids,
          permissions: e.permissions,
          is_principal: e.is_principal,
          account_id: e.account_id,
          created_at: existing?.created_at ?? new Date().toISOString(),
        }
        set((st) => ({
          employees: existing
            ? st.employees.map((x) => x.id === id ? item : x)
            : [...st.employees, item],
        }))
        return item
      },
      deleteEmployee: (id) => set((st) => ({
        employees: st.employees.filter((e) => e.id !== id),
      })),
      setEmployeePermissions: (employeeId, permissions) => set((st) => ({
        employees: st.employees.map((e) => e.id === employeeId ? { ...e, permissions } : e),
      })),
      nextEmployeeId: () => {
        const employees = get().employees
        let maxNum = 60
        for (const e of employees) {
          const m = (e.employee_id ?? '').match(/(\d+)\s*$/)
          if (m) {
            const n = parseInt(m[1], 10)
            if (!isNaN(n) && n > maxNum) maxNum = n
          }
        }
        return `PSS${String(maxNum + 1).padStart(3, '0')}`
      },

      addAccountGroup: (g) => {
        const id = `ag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: AccountGroup = { ...g, id, created_at: new Date().toISOString() }
        set((st) => ({ accountGroups: [...st.accountGroups, item] }))
        return item
      },
      updateAccountGroup: (id, data) => set((st) => ({
        accountGroups: st.accountGroups.map((g) => g.id === id ? { ...g, ...data } : g),
      })),
      deleteAccountGroup: (id) => set((st) => ({
        accountGroups: st.accountGroups.filter((g) => g.id !== id),
      })),

      addChartAccount: (a) => {
        const id = `ca-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: ChartAccount = { ...a, id, created_at: new Date().toISOString() }
        set((st) => ({ chartAccounts: [...st.chartAccounts, item] }))
        return item
      },
      updateChartAccount: (id, data) => set((st) => ({
        chartAccounts: st.chartAccounts.map((a) => a.id === id ? { ...a, ...data } : a),
      })),
      deleteChartAccount: (id) => set((st) => ({
        chartAccounts: st.chartAccounts.filter((a) => a.id !== id),
      })),

      addBank: (b) => {
        const id = `ba-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: BankAccount = { ...b, id, branches: [], created_at: new Date().toISOString() }
        set((st) => ({ bankAccounts: [...st.bankAccounts, item] }))
        return item
      },
      updateBank: (id, data) => set((st) => ({
        bankAccounts: st.bankAccounts.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      deleteBank: (id) => set((st) => ({
        bankAccounts: st.bankAccounts.filter((b) => b.id !== id),
      })),
      addBankBranch: (bankId, branch) => set((st) => ({
        bankAccounts: st.bankAccounts.map((b) => b.id !== bankId ? b : {
          ...b,
          branches: [...b.branches, { ...branch, id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, bank_id: bankId }],
        }),
      })),
      removeBankBranch: (bankId, branchId) => set((st) => ({
        bankAccounts: st.bankAccounts.map((b) => b.id !== bankId ? b : {
          ...b,
          branches: b.branches.filter((br) => br.id !== branchId),
        }),
      })),

      createFinanceTransaction: (t) => {
        const id = `ft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: FinanceTransaction = {
          ...t,
          id,
          status: t.status ?? (t.pre_approved ? 'pre_approved' : 'pending'),
          created_at: new Date().toISOString(),
        }
        set((st) => ({ financeTransactions: [item, ...st.financeTransactions] }))
        return item
      },
      approveFinanceTransaction: (id, employeeId) => set((st) => ({
        financeTransactions: st.financeTransactions.map((t) => t.id === id
          ? { ...t, status: 'approved', approved_by_employee_id: employeeId, approved_at: new Date().toISOString() }
          : t),
      })),
      rejectFinanceTransaction: (id) => set((st) => ({
        financeTransactions: st.financeTransactions.map((t) => t.id === id
          ? { ...t, status: 'rejected' }
          : t),
      })),
      payFinanceTransaction: (id, employeeId) => set((st) => ({
        financeTransactions: st.financeTransactions.map((t) => t.id === id
          ? { ...t, status: 'paid', paid_by_employee_id: employeeId, paid_at: new Date().toISOString() }
          : t),
      })),

      nextAdmissionNumber: () => {
        const students = get().students
        // Find highest numeric portion across existing student_ids (e.g. PIS934 -> 934)
        let maxNum = 0
        for (const s of students) {
          const m = (s.student_id ?? '').match(/(\d+)\s*$/)
          if (m) {
            const n = parseInt(m[1], 10)
            if (!isNaN(n) && n > maxNum) maxNum = n
          }
        }
        return `PIS${maxNum + 1}`
      },

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
