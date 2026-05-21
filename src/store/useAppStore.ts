"use client";
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Student, Teacher, Fee, Payment, AttendanceRecord, Grade,
  HomeworkAssignment, LessonPlan, Announcement, CrecheLog,
  CanteenWallet, CanteenTransaction, FeedPost, Payroll, BECEAttempt, PickupCode,
  ChatThread, ChatMessage,
  BusRoute, BusStop, BusRun, BusEvent, BusRunDirection,
  StaffCheckIn, ExcuseRequest,
  LibraryBook, LibraryLoan,
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
  ClassTimetable, OnlineExam, OnlineAssignment, OnlineClassroomSession,
  TimetablePeriod, AssignmentQuestion, AssignmentSubmission,
  CanteenMeal, CanteenFeeParticular, CanteenMenuDay, MenuItem,
  MessageTemplate, MessageLog, MessageChannel,
  Enquiry, EnquiryStatus, DataUpload, SmartReport,
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
  PHOENIX_CANTEEN_MEALS, PHOENIX_CANTEEN_FEE_PARTICULARS, MOCK_CANTEEN_MENU_DAYS,
  PHOENIX_MESSAGE_TEMPLATES, MOCK_MESSAGE_LOGS,
  MOCK_ENQUIRIES, MOCK_DATA_UPLOADS, MOCK_SMART_REPORTS,
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
  chatThreads: ChatThread[]
  chatMessages: ChatMessage[]
  busRoutes: BusRoute[]
  busStops: BusStop[]
  busRuns: BusRun[]
  busEvents: BusEvent[]
  staffCheckIns: StaffCheckIn[]
  excuseRequests: ExcuseRequest[]
  libraryBooks: LibraryBook[]
  libraryLoans: LibraryLoan[]
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
  classTimetables: ClassTimetable[]
  onlineExams: OnlineExam[]
  onlineAssignments: OnlineAssignment[]
  classroomSessions: OnlineClassroomSession[]
  canteenMeals: CanteenMeal[]
  canteenFeeParticulars: CanteenFeeParticular[]
  canteenMenuDays: CanteenMenuDay[]
  messageTemplates: MessageTemplate[]
  messageLogs: MessageLog[]
  enquiries: Enquiry[]
  dataUploads: DataUpload[]
  smartReports: SmartReport[]

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
  // Reconciliation: given a Paystack settlement CSV with `reference` + `amount`
  // + `settled_on` columns, mark every matching FeePaymentRequest as settled.
  // Returns counts so admin can verify before trusting the report.
  reconcilePaystackSettlements: (rows: Array<{ reference: string; amount: number; settled_on?: string }>) => {
    matched: number; unmatched: number; alreadySettled: number;
  }

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

  // LMS
  upsertClassTimetable: (classId: string, days: ClassTimetable['days']) => ClassTimetable
  addTimetablePeriod: (classId: string, day: ClassTimetable['days'][number]['day'], period: Omit<TimetablePeriod, 'id'>) => void
  removeTimetablePeriod: (classId: string, day: ClassTimetable['days'][number]['day'], periodId: string) => void
  addOnlineExam: (e: Omit<OnlineExam, 'id' | 'created_at'>) => OnlineExam
  updateOnlineExam: (id: string, data: Partial<OnlineExam>) => void
  deleteOnlineExam: (id: string) => void
  addOnlineAssignment: (a: Omit<OnlineAssignment, 'id' | 'created_at'>) => OnlineAssignment
  updateOnlineAssignment: (id: string, data: Partial<OnlineAssignment>) => void
  deleteOnlineAssignment: (id: string) => void
  addQuestionToAssignment: (assignmentId: string, q: Omit<AssignmentQuestion, 'id'>) => void
  updateQuestionInAssignment: (assignmentId: string, questionId: string, data: Partial<AssignmentQuestion>) => void
  removeQuestionFromAssignment: (assignmentId: string, questionId: string) => void
  addClassroomSession: (s: Omit<OnlineClassroomSession, 'id' | 'created_at'>) => OnlineClassroomSession
  updateClassroomSession: (id: string, data: Partial<OnlineClassroomSession>) => void
  deleteClassroomSession: (id: string) => void

  // Canteen
  addCanteenMeal: (m: Omit<CanteenMeal, 'id' | 'created_at'>) => CanteenMeal
  updateCanteenMeal: (id: string, data: Partial<CanteenMeal>) => void
  deleteCanteenMeal: (id: string) => void
  addCanteenFeeParticular: (p: Omit<CanteenFeeParticular, 'id' | 'created_at'>) => CanteenFeeParticular
  updateCanteenFeeParticular: (id: string, data: Partial<CanteenFeeParticular>) => void
  deleteCanteenFeeParticular: (id: string) => void
  upsertMenuDay: (m: Omit<CanteenMenuDay, 'id' | 'created_at'> & { id?: string }) => CanteenMenuDay
  deleteMenuDay: (id: string) => void
  addMenuDayItem: (dayId: string, item: Omit<MenuItem, 'id'>) => void
  removeMenuDayItem: (dayId: string, itemId: string) => void
  resetAllCanteenBalances: () => number

  // Messaging upgrade
  addMessageTemplate: (t: Omit<MessageTemplate, 'id' | 'created_at'>) => MessageTemplate
  updateMessageTemplate: (id: string, data: Partial<MessageTemplate>) => void
  deleteMessageTemplate: (id: string) => void
  sendMessage: (input: {
    channels: MessageChannel[]
    audience_kind: MessageLog['audience_kind']
    audience_description: string
    recipients: string[]
    subject?: string
    body: string
    template_id?: string
    sent_by_employee_id?: string
  }) => MessageLog

  // Enquiries (admissions pipeline)
  addEnquiry: (e: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>) => Enquiry
  updateEnquiry: (id: string, data: Partial<Enquiry>) => void
  setEnquiryStatus: (id: string, status: EnquiryStatus) => void
  deleteEnquiry: (id: string) => void

  // Data uploads (CSV)
  recordDataUpload: (u: Omit<DataUpload, 'id' | 'created_at'>) => DataUpload

  // Smart reports
  saveSmartReport: (r: Omit<SmartReport, 'id' | 'created_at'>) => SmartReport
  deleteSmartReport: (id: string) => void

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
  updateHomework: (id: string, data: Partial<HomeworkAssignment>) => void
  deleteHomework: (id: string) => void
  addLessonPlan: (lp: Omit<LessonPlan, 'id' | 'created_at'>) => void
  updateLessonPlan: (id: string, data: Partial<LessonPlan>) => void
  deleteLessonPlan: (id: string) => void

  // Admin
  addAnnouncement: (a: Omit<Announcement, 'id' | 'created_at'>) => void
  addCrecheLog: (log: Omit<CrecheLog, 'id'>) => void

  // Feed
  addFeedPost: (p: Omit<FeedPost, 'id' | 'likes' | 'created_at'>) => void
  likePost: (id: string) => void
  approveFeedPost: (id: string, moderator?: string) => void
  rejectFeedPost: (id: string, moderator: string | undefined, reason: string) => void
  deleteFeedPost: (id: string) => void

  // Phase 15f: bus tracking
  addBusRoute: (r: Omit<BusRoute, 'id' | 'created_at'>) => BusRoute
  updateBusRoute: (id: string, data: Partial<BusRoute>) => void
  deleteBusRoute: (id: string) => void
  addBusStop: (s: Omit<BusStop, 'id'>) => BusStop
  updateBusStop: (id: string, data: Partial<BusStop>) => void
  deleteBusStop: (id: string) => void
  startBusRun: (route_id: string, direction: BusRunDirection) => BusRun
  arriveAtStop: (run_id: string, stop_id: string, lat?: number, lng?: number) => void
  departStop: (run_id: string, stop_id: string, lat?: number, lng?: number) => void
  completeBusRun: (run_id: string, lat?: number, lng?: number) => void
  pingBusLocation: (run_id: string, lat: number, lng: number) => void
  // Driver ticks who actually boarded at the current stop. Creates an
  // AttendanceRecord (context: 'bus') and writes a BusEvent for the audit log.
  recordBusBoarding: (run_id: string, student_id: string, kind: 'on' | 'off') => void
  // Gate check-in: student arrives at school gate, kiosk records them present.
  // Returns null if no student matches the supplied code/id.
  gateCheckIn: (studentCodeOrId: string) => { ok: boolean; studentName?: string; alreadyToday?: boolean; reason?: string }

  // Online assignment submissions
  assignmentSubmissions: AssignmentSubmission[]
  submitAssignment: (input: Omit<AssignmentSubmission, 'id' | 'submitted_at' | 'auto_score' | 'total_possible'>) => AssignmentSubmission
  gradeAssignmentSubmission: (id: string, manual_score: number, gradedBy?: string) => void
  // Staff time-clock
  staffCheckInNow: (staff_id: string, staff_name: string, role_label?: string) => void
  staffCheckOutNow: (staff_id: string) => void
  // Excuse requests (doctor's note / police report etc.)
  submitExcuseRequest: (req: Omit<ExcuseRequest, 'id' | 'status' | 'created_at'>) => ExcuseRequest
  reviewExcuseRequest: (id: string, decision: 'approved' | 'declined', reviewer?: string, notes?: string) => void

  // Lifecycle helpers — switch between demo data and a clean school setup.
  wipeDemoData: () => void
  restoreDemoData: () => void

  // Library
  addLibraryBook: (b: Omit<LibraryBook, 'id' | 'created_at'>) => LibraryBook
  updateLibraryBook: (id: string, data: Partial<LibraryBook>) => void
  deleteLibraryBook: (id: string) => void
  issueLibraryBook: (input: Omit<LibraryLoan, 'id' | 'issued_at' | 'status' | 'returned_at'>) => void
  returnLibraryBook: (loanId: string) => void

  // Phase 15c: parent-teacher chat
  getOrCreateChatThread: (input: {
    family_id?: string
    parent_name?: string
    teacher_id?: string
    teacher_name?: string
    student_id?: string
    student_name?: string
    class_name?: string
  }) => ChatThread
  sendChatMessage: (threadId: string, sender_role: 'parent' | 'teacher', sender_id: string | undefined, sender_name: string | undefined, body: string, priority?: 'normal' | 'urgent') => ChatMessage | null
  markChatThreadRead: (threadId: string, role: 'parent' | 'teacher') => void
  acknowledgeUrgentMessage: (messageId: string) => void

  // Homework submissions
  submitHomework: (homeworkId: string, studentId: string, studentName: string, fileName: string, fileType: string, fileSize: number, fileDataUrl?: string) => void
  gradeHomeworkSubmission: (submissionId: string, score: number, comment?: string, gradedBy?: string) => void

  // BECE
  recordBECEAttempt: (studentId: string, subject: string, score: number, total: number) => void

  // Staff
  addTeacher: (t: Omit<Teacher, 'id'>) => void
  updateTeacher: (id: string, data: Partial<Teacher>) => void

  // Payroll
  generatePayroll: (month: number, year: number) => void
  // Recompute net pay for a month using staff check-in days as the basis.
  // Assumes 22 working days = a full month; staff with fewer check-ins get prorated.
  proratePayrollByCheckIns: (month: number, year: number) => { adjusted: number }
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
      chatThreads: [],
      chatMessages: [],
      busRoutes: [
        // Demo route so a fresh install / driver demo has something to test.
        // Admin can edit or delete it from /admin/transport.
        { id: 'br-demo-a', name: 'Route A — Tema → School', bus_label: 'Bus #1 · GR 1234-22', driver_name: 'Mr. Kwesi', driver_phone: '0244987654', created_at: '2026-01-01T00:00:00Z' },
      ],
      busStops: [
        { id: 'bs-demo-a-1', route_id: 'br-demo-a', name: 'Tema Community 1',  scheduled_pickup: '06:45', scheduled_dropoff: '15:30', order: 0 },
        { id: 'bs-demo-a-2', route_id: 'br-demo-a', name: 'Spintex Junction',  scheduled_pickup: '07:05', scheduled_dropoff: '15:50', order: 1 },
        { id: 'bs-demo-a-3', route_id: 'br-demo-a', name: 'East Legon Roundabout', scheduled_pickup: '07:20', scheduled_dropoff: '16:05', order: 2 },
        { id: 'bs-demo-a-4', route_id: 'br-demo-a', name: 'School Gate',       scheduled_pickup: '07:45', scheduled_dropoff: '16:25', order: 3 },
      ],
      busRuns: [],
      busEvents: [],
      staffCheckIns: [],
      excuseRequests: [],
      libraryBooks: [],
      libraryLoans: [],
      assignmentSubmissions: [],
      payroll: MOCK_PAYROLL,
      beceAttempts: [],
      pickupCodes: [],
      homeworkSubmissions: [],
      accounts: [
        // Seed real admin + principal accounts so the school can sign in on
        // day one without relying on the "Demo" buttons. The admin should
        // change these passwords immediately from /admin/accounts. The
        // force_password_change flag prompts them on first sign-in.
        { id: 'acct-admin-1',     full_name: 'School Administrator', email: 'admin@phoenixintl.school',     role: 'admin',     password: 'Phoenix2026!', is_active: true, force_password_change: true, created_at: new Date().toISOString() },
        { id: 'acct-principal-1', full_name: 'Principal',            email: 'principal@phoenixintl.school', role: 'principal', password: 'Phoenix2026!', is_active: true, force_password_change: true, created_at: new Date().toISOString() },
      ],
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
      classTimetables: [],
      onlineExams: [],
      onlineAssignments: [],
      classroomSessions: [],
      canteenMeals: PHOENIX_CANTEEN_MEALS,
      canteenFeeParticulars: PHOENIX_CANTEEN_FEE_PARTICULARS,
      canteenMenuDays: MOCK_CANTEEN_MENU_DAYS,
      messageTemplates: PHOENIX_MESSAGE_TEMPLATES,
      messageLogs: MOCK_MESSAGE_LOGS,
      enquiries: MOCK_ENQUIRIES,
      dataUploads: MOCK_DATA_UPLOADS,
      smartReports: MOCK_SMART_REPORTS,

      updateSchoolSettings: (data) => set((st) => ({
        schoolSettings: { ...st.schoolSettings, ...data },
      })),

      // ── Lifecycle: switch out of demo mode ──
      // Clears every operational record so the school starts with an empty
      // roster. Keeps: school settings, classes, subjects, signed-in admin /
      // principal accounts, message templates (they're scaffolding, not data).
      // Anything keyed by `is_demo` would be safer in production — for now
      // this is a single decisive button gated behind a confirmation prompt.
      wipeDemoData: () => set((st) => ({
        students: [],
        families: [],
        guardians: [],
        guardianLinks: [],
        fees: [],
        payments: [],
        attendance: [],
        grades: [],
        homework: [],
        homeworkSubmissions: [],
        crecheLogs: [],
        canteenWallets: [],
        canteenTransactions: [],
        feedPosts: [],
        feePaymentRequests: [],
        beceAttempts: [],
        pickupCodes: [],
        payroll: [],
        lessonPlans: [],
        announcements: [],
        assessmentResults: [],
        studentInterests: [],
        employees: [],
        financeTransactions: [],
        enquiries: [],
        dataUploads: [],
        smartReports: [],
        messageLogs: [],
        chatThreads: [],
        chatMessages: [],
        excuseRequests: [],
        staffCheckIns: [],
        libraryBooks: [],
        libraryLoans: [],
        assignmentSubmissions: [],
        busRoutes: [],
        busStops: [],
        busRuns: [],
        busEvents: [],
        // Keep the seeded admin + principal accounts so the school doesn't
        // lock themselves out — but drop any demo / extra accounts.
        accounts: st.accounts.filter((a) => a.id === 'acct-admin-1' || a.id === 'acct-principal-1'),
      })),

      // Repopulates the demo data — handy for staff training without
      // re-installing the app.
      restoreDemoData: () => set({
        students: MOCK_STUDENTS,
        families: MOCK_FAMILIES,
        guardians: MOCK_GUARDIANS,
        guardianLinks: MOCK_GUARDIAN_LINKS,
        fees: MOCK_FEES,
        payments: MOCK_PAYMENTS,
        attendance: MOCK_ATTENDANCE,
        grades: MOCK_GRADES,
        homework: MOCK_HOMEWORK,
        crecheLogs: MOCK_CRECHE_LOG,
        canteenWallets: MOCK_CANTEEN_WALLETS,
        feedPosts: MOCK_FEED_POSTS,
        payroll: MOCK_PAYROLL,
        lessonPlans: MOCK_LESSON_PLANS,
        announcements: MOCK_ANNOUNCEMENTS,
        studentInterests: MOCK_STUDENT_INTERESTS,
        employees: MOCK_EMPLOYEES,
        financeTransactions: MOCK_FINANCE_TRANSACTIONS,
        enquiries: MOCK_ENQUIRIES,
        dataUploads: MOCK_DATA_UPLOADS,
        smartReports: MOCK_SMART_REPORTS,
        messageLogs: MOCK_MESSAGE_LOGS,
      }),

      // ── Library ──
      addLibraryBook: (b) => {
        const book: LibraryBook = { ...b, id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, created_at: new Date().toISOString() }
        set((st) => ({ libraryBooks: [book, ...st.libraryBooks] }))
        return book
      },
      updateLibraryBook: (id, data) => set((st) => ({
        libraryBooks: st.libraryBooks.map((b) => b.id === id ? { ...b, ...data } : b),
      })),
      deleteLibraryBook: (id) => set((st) => ({
        libraryBooks: st.libraryBooks.filter((b) => b.id !== id),
        libraryLoans: st.libraryLoans.filter((l) => l.book_id !== id),
      })),
      issueLibraryBook: (input) => set((st) => {
        const loan: LibraryLoan = {
          ...input,
          id: `loan-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          issued_at: new Date().toISOString(),
          status: 'out',
        }
        return { libraryLoans: [loan, ...st.libraryLoans] }
      }),
      returnLibraryBook: (loanId) => set((st) => ({
        libraryLoans: st.libraryLoans.map((l) => l.id === loanId
          ? { ...l, status: 'returned' as const, returned_at: new Date().toISOString() }
          : l),
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

      reconcilePaystackSettlements: (rows) => {
        const st = get()
        let matched = 0, unmatched = 0, alreadySettled = 0
        const refMap = new Map<string, { settled_on?: string; amount: number }>()
        for (const r of rows) {
          if (!r.reference) continue
          refMap.set(r.reference.trim(), { settled_on: r.settled_on, amount: r.amount })
        }
        const updated = st.feePaymentRequests.map((req) => {
          // Try to match by paystack_reference first; fall back to request id
          // which is what we send as Paystack's `reference` when initiating.
          const key = req.paystack_reference?.trim() ?? req.id
          const hit = refMap.get(key)
          if (!hit) { unmatched += 1; return req }
          if (req.settled) { alreadySettled += 1; return req }
          matched += 1
          return {
            ...req,
            settled: true,
            settled_at: hit.settled_on ?? new Date().toISOString(),
            settlement_reference: key,
          }
        })
        // unmatched counts CSV rows that didn't match any FeePaymentRequest.
        unmatched = rows.length - matched - alreadySettled
        if (matched > 0 || alreadySettled > 0) {
          set({ feePaymentRequests: updated })
        }
        return { matched, unmatched, alreadySettled }
      },

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

      upsertClassTimetable: (classId, days) => {
        const existing = get().classTimetables.find((t) => t.id === classId)
        const item: ClassTimetable = {
          id: classId,
          class_id: classId,
          days,
          updated_at: new Date().toISOString(),
        }
        set((st) => ({
          classTimetables: existing
            ? st.classTimetables.map((t) => t.id === classId ? item : t)
            : [...st.classTimetables, item],
        }))
        return item
      },
      addTimetablePeriod: (classId, day, period) => set((st) => {
        const existing = st.classTimetables.find((t) => t.id === classId)
        const newPeriod: TimetablePeriod = { ...period, id: `tp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
        if (!existing) {
          const item: ClassTimetable = {
            id: classId,
            class_id: classId,
            days: [{ day, periods: [newPeriod] }],
            updated_at: new Date().toISOString(),
          }
          return { classTimetables: [...st.classTimetables, item] }
        }
        const dayExists = existing.days.some((d) => d.day === day)
        const updatedDays = dayExists
          ? existing.days.map((d) => d.day === day ? { ...d, periods: [...d.periods, newPeriod] } : d)
          : [...existing.days, { day, periods: [newPeriod] }]
        return {
          classTimetables: st.classTimetables.map((t) => t.id === classId
            ? { ...t, days: updatedDays, updated_at: new Date().toISOString() }
            : t),
        }
      }),
      removeTimetablePeriod: (classId, day, periodId) => set((st) => ({
        classTimetables: st.classTimetables.map((t) => t.id !== classId ? t : {
          ...t,
          days: t.days.map((d) => d.day !== day ? d : { ...d, periods: d.periods.filter((p) => p.id !== periodId) }),
          updated_at: new Date().toISOString(),
        }),
      })),

      addOnlineExam: (e) => {
        const id = `exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: OnlineExam = { ...e, id, created_at: new Date().toISOString() }
        set((st) => ({ onlineExams: [item, ...st.onlineExams] }))
        return item
      },
      updateOnlineExam: (id, data) => set((st) => ({
        onlineExams: st.onlineExams.map((e) => e.id === id ? { ...e, ...data } : e),
      })),
      deleteOnlineExam: (id) => set((st) => ({
        onlineExams: st.onlineExams.filter((e) => e.id !== id),
      })),

      addOnlineAssignment: (a) => {
        const id = `as-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: OnlineAssignment = { ...a, id, created_at: new Date().toISOString() }
        set((st) => ({ onlineAssignments: [item, ...st.onlineAssignments] }))
        return item
      },
      updateOnlineAssignment: (id, data) => set((st) => ({
        onlineAssignments: st.onlineAssignments.map((a) => a.id === id ? { ...a, ...data } : a),
      })),
      deleteOnlineAssignment: (id) => set((st) => ({
        onlineAssignments: st.onlineAssignments.filter((a) => a.id !== id),
      })),
      addQuestionToAssignment: (assignmentId, q) => set((st) => ({
        onlineAssignments: st.onlineAssignments.map((a) => a.id !== assignmentId ? a : {
          ...a,
          questions: [...a.questions, { ...q, id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        }),
      })),
      updateQuestionInAssignment: (assignmentId, questionId, data) => set((st) => ({
        onlineAssignments: st.onlineAssignments.map((a) => a.id !== assignmentId ? a : {
          ...a,
          questions: a.questions.map((q) => q.id === questionId ? { ...q, ...data } : q),
        }),
      })),
      removeQuestionFromAssignment: (assignmentId, questionId) => set((st) => ({
        onlineAssignments: st.onlineAssignments.map((a) => a.id !== assignmentId ? a : {
          ...a,
          questions: a.questions.filter((q) => q.id !== questionId),
        }),
      })),

      addClassroomSession: (s) => {
        const id = `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: OnlineClassroomSession = { ...s, id, created_at: new Date().toISOString() }
        set((st) => ({ classroomSessions: [item, ...st.classroomSessions] }))
        return item
      },
      updateClassroomSession: (id, data) => set((st) => ({
        classroomSessions: st.classroomSessions.map((s) => s.id === id ? { ...s, ...data } : s),
      })),
      deleteClassroomSession: (id) => set((st) => ({
        classroomSessions: st.classroomSessions.filter((s) => s.id !== id),
      })),

      addCanteenMeal: (m) => {
        const id = `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: CanteenMeal = { ...m, id, created_at: new Date().toISOString() }
        set((st) => ({ canteenMeals: [...st.canteenMeals, item] }))
        return item
      },
      updateCanteenMeal: (id, data) => set((st) => ({
        canteenMeals: st.canteenMeals.map((m) => m.id === id ? { ...m, ...data } : m),
      })),
      deleteCanteenMeal: (id) => set((st) => ({
        canteenMeals: st.canteenMeals.filter((m) => m.id !== id),
      })),
      addCanteenFeeParticular: (p) => {
        const id = `cfp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: CanteenFeeParticular = { ...p, id, created_at: new Date().toISOString() }
        set((st) => ({ canteenFeeParticulars: [...st.canteenFeeParticulars, item] }))
        return item
      },
      updateCanteenFeeParticular: (id, data) => set((st) => ({
        canteenFeeParticulars: st.canteenFeeParticulars.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      deleteCanteenFeeParticular: (id) => set((st) => ({
        canteenFeeParticulars: st.canteenFeeParticulars.filter((p) => p.id !== id),
      })),
      upsertMenuDay: (m) => {
        const id = m.id ?? `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const existing = get().canteenMenuDays.find((x) => x.id === id)
        const item: CanteenMenuDay = {
          id,
          date: m.date,
          items: m.items,
          notes: m.notes,
          created_at: existing?.created_at ?? new Date().toISOString(),
        }
        set((st) => ({
          canteenMenuDays: existing
            ? st.canteenMenuDays.map((x) => x.id === id ? item : x)
            : [...st.canteenMenuDays, item],
        }))
        return item
      },
      deleteMenuDay: (id) => set((st) => ({
        canteenMenuDays: st.canteenMenuDays.filter((m) => m.id !== id),
      })),
      addMenuDayItem: (dayId, item) => set((st) => ({
        canteenMenuDays: st.canteenMenuDays.map((d) => d.id !== dayId ? d : {
          ...d,
          items: [...d.items, { ...item, id: `mi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        }),
      })),
      removeMenuDayItem: (dayId, itemId) => set((st) => ({
        canteenMenuDays: st.canteenMenuDays.map((d) => d.id !== dayId ? d : {
          ...d,
          items: d.items.filter((i) => i.id !== itemId),
        }),
      })),
      resetAllCanteenBalances: () => {
        const wallets = get().canteenWallets
        const count = wallets.length
        set((st) => ({
          canteenWallets: st.canteenWallets.map((w) => ({ ...w, balance: 0, updated_at: new Date().toISOString().split('T')[0] })),
          canteenTransactions: [
            ...wallets.map((w) => ({
              id: `ct-reset-${Date.now()}-${w.student_id}`,
              student_id: w.student_id,
              student_name: w.student_name,
              amount: w.balance,
              type: 'debit' as const,
              description: 'Term reset (admin)',
              created_at: new Date().toISOString(),
            })),
            ...st.canteenTransactions,
          ],
        }))
        return count
      },

      addMessageTemplate: (t) => {
        const id = `mt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: MessageTemplate = { ...t, id, created_at: new Date().toISOString() }
        set((st) => ({ messageTemplates: [...st.messageTemplates, item] }))
        return item
      },
      updateMessageTemplate: (id, data) => set((st) => ({
        messageTemplates: st.messageTemplates.map((t) => t.id === id ? { ...t, ...data } : t),
      })),
      deleteMessageTemplate: (id) => set((st) => ({
        messageTemplates: st.messageTemplates.filter((t) => t.id !== id),
      })),
      sendMessage: (input) => {
        const id = `mlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        // Phoenix now uses in-app push instead of Hubtel SMS. We:
        //   1. Record the message in the messageLogs audit trail.
        //   2. Drop an Announcement so it shows up on every recipient's dashboard
        //      (and gets picked up by the notification bell).
        const item: MessageLog = {
          id,
          channel: input.channels[0] ?? 'sms',  // legacy field — kept for audit
          audience_kind: input.audience_kind,
          audience_description: input.audience_description,
          recipients: input.recipients.slice(0, 50),
          recipient_count: input.recipients.length,
          subject: input.subject,
          body: input.body,
          template_id: input.template_id,
          status: input.recipients.length > 0 ? 'delivered' : 'failed',
          gateway_response: input.recipients.length > 0
            ? `📲 In-app push to ${input.recipients.length} recipient${input.recipients.length === 1 ? '' : 's'}`
            : 'No recipients in audience',
          sent_at: new Date().toISOString(),
          sent_by_employee_id: input.sent_by_employee_id,
          created_at: new Date().toISOString(),
        }
        set((st) => ({
          messageLogs: [item, ...st.messageLogs],
          // Surface the message on every dashboard via the announcements feed.
          announcements: [{
            id: `ann-msg-${id}`,
            title: input.subject ?? input.audience_description ?? 'Message from the school',
            content: input.body,
            type: 'push' as const,
            audience: (input.audience_kind === 'staff' ? 'teachers'
              : input.audience_kind === 'students' ? 'students'
              : 'all') as 'all' | 'parents' | 'teachers' | 'students',
            created_at: new Date().toISOString(),
          }, ...st.announcements],
        }))
        return item
      },

      addEnquiry: (e) => {
        const id = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const now = new Date().toISOString()
        const item: Enquiry = { ...e, id, created_at: now, updated_at: now }
        set((st) => ({ enquiries: [item, ...st.enquiries] }))
        return item
      },
      updateEnquiry: (id, data) => set((st) => ({
        enquiries: st.enquiries.map((e) => e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e),
      })),
      setEnquiryStatus: (id, status) => set((st) => ({
        enquiries: st.enquiries.map((e) => e.id === id ? { ...e, status, updated_at: new Date().toISOString() } : e),
      })),
      deleteEnquiry: (id) => set((st) => ({
        enquiries: st.enquiries.filter((e) => e.id !== id),
      })),

      recordDataUpload: (u) => {
        const id = `du-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: DataUpload = { ...u, id, created_at: new Date().toISOString() }
        set((st) => ({ dataUploads: [item, ...st.dataUploads] }))
        return item
      },

      saveSmartReport: (r) => {
        const id = `sr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const item: SmartReport = { ...r, id, created_at: new Date().toISOString() }
        set((st) => ({ smartReports: [item, ...st.smartReports] }))
        return item
      },
      deleteSmartReport: (id) => set((st) => ({
        smartReports: st.smartReports.filter((r) => r.id !== id),
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
        const st = get()
        const template = st.messageTemplates.find((t) => t.trigger === 'absent_today' && t.is_active)
        const schoolName = st.schoolSettings.name
        const nowHM = new Date().toTimeString().slice(0, 5)

        // Auto-stamp arrival_time for late marks so admins can audit punctuality.
        records = records.map((r) =>
          r.status === 'late' && !r.arrival_time ? { ...r, arrival_time: nowHM } : r)

        const notified = records.map((r) => {
          if (r.status !== 'absent' || r.parent_notified) return r
          const student = st.students.find((s) => s.id === r.student_id)
          if (!student || !template) return r

          const recipients: string[] = []
          const channels: MessageChannel[] = []
          if (student.can_receive_sms !== false && template.channels.includes('sms')) {
            const phone = student.parent_phone || student.mobile_no
            if (phone) {
              recipients.push(phone)
              if (!channels.includes('sms')) channels.push('sms')
            }
          }
          if (template.channels.includes('whatsapp')) {
            const phone = student.parent_phone || student.mobile_no
            if (phone) {
              if (!recipients.includes(phone)) recipients.push(phone)
              if (!channels.includes('whatsapp')) channels.push('whatsapp')
            }
          }
          if (student.can_receive_email !== false && template.channels.includes('email') && student.email) {
            recipients.push(student.email)
            if (!channels.includes('email')) channels.push('email')
          }

          if (recipients.length === 0) return r

          const body = (template.body ?? '')
            .replace(/\{\{school_name\}\}/g, schoolName)
            .replace(/\{\{full_name\}\}/g, student.full_name)
            .replace(/\{\{first_name\}\}/g, student.full_name.split(' ')[0] ?? '')
            .replace(/\{\{date\}\}/g, r.date)
          const subject = template.subject
            ?.replace(/\{\{school_name\}\}/g, schoolName)
            .replace(/\{\{full_name\}\}/g, student.full_name)

          get().sendMessage({
            channels,
            audience_kind: 'individuals',
            audience_description: `Absence alert · ${student.full_name} (${student.class_name})`,
            recipients,
            subject,
            body,
            template_id: template.id,
          })
          return { ...r, parent_notified: true }
        })

        set((s) => {
          const existing = s.attendance.filter((a) => a.date !== today || !notified.find((r) => r.student_id === a.student_id))
          return { attendance: [...existing, ...notified] }
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

      updateHomework: (id, data) => set((st) => ({
        homework: st.homework.map((h) => h.id === id ? { ...h, ...data } : h),
      })),

      deleteHomework: (id) => set((st) => ({
        homework: st.homework.filter((h) => h.id !== id),
        // Also clear any pending submissions so the teacher doesn't see ghost rows.
        homeworkSubmissions: st.homeworkSubmissions.filter((s) => s.homework_id !== id),
      })),

      submitHomework: (homeworkId, studentId, studentName, fileName, fileType, fileSize, fileDataUrl) => {
        set((st) => {
          const alreadySubmitted = st.homeworkSubmissions.some(
            (s) => s.homework_id === homeworkId && s.student_id === studentId
          )
          if (alreadySubmitted) {
            // Replace existing submission
            return {
              homeworkSubmissions: st.homeworkSubmissions.map((s) =>
                s.homework_id === homeworkId && s.student_id === studentId
                  ? { ...s, file_name: fileName, file_type: fileType, file_size: fileSize, file_data_url: fileDataUrl, submitted_at: new Date().toISOString() }
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
              file_data_url: fileDataUrl,
              submitted_at: new Date().toISOString(),
            }],
            homework: st.homework.map((h) =>
              h.id === homeworkId ? { ...h, submission_count: (h.submission_count ?? 0) + 1 } : h
            ),
          }
        })
      },

      gradeHomeworkSubmission: (submissionId, score, comment, gradedBy) => set((st) => ({
        homeworkSubmissions: st.homeworkSubmissions.map((s) =>
          s.id === submissionId
            ? { ...s, score, teacher_comment: comment, graded_by: gradedBy, graded_at: new Date().toISOString() }
            : s),
      })),

      addLessonPlan: (lp) => set((st) => ({
        lessonPlans: [...st.lessonPlans, { ...lp, id: `lp${Date.now()}`, created_at: new Date().toISOString() }],
      })),

      updateLessonPlan: (id, data) => set((st) => ({
        lessonPlans: st.lessonPlans.map((l) => l.id === id
          ? { ...l, ...data, updated_at: new Date().toISOString() }
          : l),
      })),

      deleteLessonPlan: (id) => set((st) => ({
        lessonPlans: st.lessonPlans.filter((l) => l.id !== id),
      })),

      addAnnouncement: (a) => set((st) => ({
        announcements: [{ ...a, id: `an${Date.now()}`, created_at: new Date().toISOString() }, ...st.announcements],
      })),

      addCrecheLog: (log) => set((st) => ({
        crecheLogs: [...st.crecheLogs.filter((c) => !(c.student_id === log.student_id && c.log_date === log.log_date)), { ...log, id: `cl${Date.now()}` }],
      })),

      addFeedPost: (p) => set((st) => ({
        feedPosts: [{
          ...p,
          id: `fp${Date.now()}`,
          likes: 0,
          // Admins / principals self-publish; teachers and parents go to the
          // moderation queue. Caller can override by passing an explicit status.
          status: p.status ?? (p.author_role === 'admin' || p.author_role === 'principal' ? 'approved' : 'pending'),
          created_at: new Date().toISOString(),
        }, ...st.feedPosts],
      })),

      likePost: (id) => set((st) => ({
        feedPosts: st.feedPosts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p),
      })),

      approveFeedPost: (id, moderator) => set((st) => ({
        feedPosts: st.feedPosts.map((p) => p.id === id ? {
          ...p,
          status: 'approved',
          moderated_by: moderator,
          moderated_at: new Date().toISOString(),
          rejection_reason: undefined,
        } : p),
      })),

      rejectFeedPost: (id, moderator, reason) => set((st) => ({
        feedPosts: st.feedPosts.map((p) => p.id === id ? {
          ...p,
          status: 'rejected',
          moderated_by: moderator,
          moderated_at: new Date().toISOString(),
          rejection_reason: reason,
        } : p),
      })),

      deleteFeedPost: (id) => set((st) => ({
        feedPosts: st.feedPosts.filter((p) => p.id !== id),
      })),

      getOrCreateChatThread: (input) => {
        const existing = get().chatThreads.find((t) =>
          t.family_id === input.family_id &&
          t.teacher_id === input.teacher_id &&
          t.student_id === input.student_id
        )
        if (existing) {
          // Refresh cached display fields in case names changed (e.g. teacher
          // moved class). Keeps stale-name UI from confusing parents.
          if (existing.teacher_name !== input.teacher_name || existing.student_name !== input.student_name) {
            set((st) => ({
              chatThreads: st.chatThreads.map((t) => t.id === existing.id
                ? { ...t, teacher_name: input.teacher_name, student_name: input.student_name, class_name: input.class_name, parent_name: input.parent_name }
                : t),
            }))
            return { ...existing, teacher_name: input.teacher_name, student_name: input.student_name, class_name: input.class_name, parent_name: input.parent_name }
          }
          return existing
        }
        const thread: ChatThread = {
          id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          family_id: input.family_id,
          parent_name: input.parent_name,
          teacher_id: input.teacher_id,
          teacher_name: input.teacher_name,
          student_id: input.student_id,
          student_name: input.student_name,
          class_name: input.class_name,
          unread_for_parent: 0,
          unread_for_teacher: 0,
          created_at: new Date().toISOString(),
        }
        set((st) => ({ chatThreads: [thread, ...st.chatThreads] }))
        return thread
      },

      sendChatMessage: (threadId, sender_role, sender_id, sender_name, body, priority) => {
        const trimmed = body.trim()
        if (!trimmed) return null
        const msg: ChatMessage = {
          id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          thread_id: threadId,
          sender_role,
          sender_id,
          sender_name,
          body: trimmed,
          priority,
          created_at: new Date().toISOString(),
        }
        const preview = (priority === 'urgent' ? '🚨 ' : '') + trimmed.slice(0, 80)
        set((st) => ({
          chatMessages: [...st.chatMessages, msg],
          chatThreads: st.chatThreads.map((t) => t.id === threadId ? {
            ...t,
            last_message_at: msg.created_at,
            last_message_preview: preview,
            unread_for_parent: sender_role === 'teacher' ? t.unread_for_parent + 1 : t.unread_for_parent,
            unread_for_teacher: sender_role === 'parent' ? t.unread_for_teacher + 1 : t.unread_for_teacher,
          } : t),
        }))
        return msg
      },

      acknowledgeUrgentMessage: (messageId) => set((st) => ({
        chatMessages: st.chatMessages.map((m) => m.id === messageId
          ? { ...m, acknowledged_at: new Date().toISOString() }
          : m),
      })),

      markChatThreadRead: (threadId, role) => set((st) => ({
        chatThreads: st.chatThreads.map((t) => t.id === threadId ? {
          ...t,
          unread_for_parent: role === 'parent' ? 0 : t.unread_for_parent,
          unread_for_teacher: role === 'teacher' ? 0 : t.unread_for_teacher,
        } : t),
      })),

      // ── Phase 15f: bus tracking ──
      addBusRoute: (r) => {
        const route: BusRoute = { ...r, id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, created_at: new Date().toISOString() }
        set((st) => ({ busRoutes: [...st.busRoutes, route] }))
        return route
      },
      updateBusRoute: (id, data) => set((st) => ({
        busRoutes: st.busRoutes.map((r) => r.id === id ? { ...r, ...data } : r),
      })),
      deleteBusRoute: (id) => set((st) => ({
        busRoutes: st.busRoutes.filter((r) => r.id !== id),
        busStops: st.busStops.filter((s) => s.route_id !== id),
      })),
      addBusStop: (s) => {
        const stop: BusStop = { ...s, id: `bs-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }
        set((st) => ({ busStops: [...st.busStops, stop] }))
        return stop
      },
      updateBusStop: (id, data) => set((st) => ({
        busStops: st.busStops.map((s) => s.id === id ? { ...s, ...data } : s),
      })),
      deleteBusStop: (id) => set((st) => ({
        busStops: st.busStops.filter((s) => s.id !== id),
      })),

      startBusRun: (route_id, direction) => {
        const stops = get().busStops.filter((s) => s.route_id === route_id).sort((a, b) => a.order - b.order)
        const firstStop = direction === 'pickup' ? stops[0] : stops[stops.length - 1]
        const run: BusRun = {
          id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          route_id,
          direction,
          date: new Date().toISOString().slice(0, 10),
          status: 'in_progress',
          started_at: new Date().toISOString(),
          next_stop_id: firstStop?.id,
        }
        const event: BusEvent = {
          id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          run_id: run.id,
          kind: 'started',
          note: direction === 'pickup' ? 'Morning pickup started' : 'Afternoon drop-off started',
          created_at: new Date().toISOString(),
        }
        set((st) => ({ busRuns: [run, ...st.busRuns], busEvents: [event, ...st.busEvents] }))
        return run
      },

      arriveAtStop: (run_id, stop_id, lat, lng) => {
        const stop = get().busStops.find((s) => s.id === stop_id)
        const event: BusEvent = {
          id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          run_id, kind: 'arrived_stop', stop_id, stop_name: stop?.name, lat, lng,
          created_at: new Date().toISOString(),
        }
        set((st) => ({
          busEvents: [event, ...st.busEvents],
          busRuns: st.busRuns.map((r) => r.id === run_id ? {
            ...r,
            current_stop_id: stop_id,
            current_lat: lat ?? r.current_lat,
            current_lng: lng ?? r.current_lng,
            current_ping_at: new Date().toISOString(),
          } : r),
        }))
      },

      departStop: (run_id, stop_id, lat, lng) => {
        const run = get().busRuns.find((r) => r.id === run_id)
        if (!run) return
        const stops = get().busStops.filter((s) => s.route_id === run.route_id).sort((a, b) => a.order - b.order)
        const ordered = run.direction === 'pickup' ? stops : [...stops].reverse()
        const idx = ordered.findIndex((s) => s.id === stop_id)
        const next = idx >= 0 ? ordered[idx + 1] : undefined
        const stop = stops.find((s) => s.id === stop_id)
        const event: BusEvent = {
          id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          run_id, kind: 'departed_stop', stop_id, stop_name: stop?.name, lat, lng,
          created_at: new Date().toISOString(),
        }
        set((st) => ({
          busEvents: [event, ...st.busEvents],
          busRuns: st.busRuns.map((r) => r.id === run_id ? {
            ...r,
            next_stop_id: next?.id,
            current_lat: lat ?? r.current_lat,
            current_lng: lng ?? r.current_lng,
            current_ping_at: new Date().toISOString(),
          } : r),
        }))
      },

      completeBusRun: (run_id, lat, lng) => {
        const event: BusEvent = {
          id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          run_id, kind: 'completed', lat, lng,
          created_at: new Date().toISOString(),
        }
        set((st) => ({
          busEvents: [event, ...st.busEvents],
          busRuns: st.busRuns.map((r) => r.id === run_id ? {
            ...r,
            status: 'completed',
            completed_at: new Date().toISOString(),
            next_stop_id: undefined,
            current_lat: lat ?? r.current_lat,
            current_lng: lng ?? r.current_lng,
            current_ping_at: new Date().toISOString(),
          } : r),
        }))
      },

      pingBusLocation: (run_id, lat, lng) => set((st) => ({
        busRuns: st.busRuns.map((r) => r.id === run_id ? {
          ...r,
          current_lat: lat,
          current_lng: lng,
          current_ping_at: new Date().toISOString(),
        } : r),
      })),

      gateCheckIn: (codeOrId) => {
        const q = codeOrId.trim().toLowerCase()
        if (!q) return { ok: false, reason: "Enter or scan a student ID" }
        const st = get()
        const student = st.students.find((s) =>
          s.student_id.toLowerCase() === q || s.id.toLowerCase() === q
        )
        if (!student) return { ok: false, reason: "No student matches that code" }
        const today = todayISO()
        const nowHM = new Date().toTimeString().slice(0, 5)
        const existing = st.attendance.find((a) => a.student_id === student.id && a.date === today)
        if (existing) {
          return { ok: true, studentName: student.full_name, alreadyToday: true }
        }
        set((s2) => ({
          attendance: [...s2.attendance, {
            id: `att-gate-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            student_id: student.id,
            student_name: student.full_name,
            class_name: student.class_name,
            date: today,
            status: 'present' as const,
            parent_notified: false,
            marked_by: 'gate_kiosk',
            context: 'gate' as const,
            arrival_time: nowHM,
          }],
        }))
        return { ok: true, studentName: student.full_name }
      },

      submitAssignment: (input) => {
        const st = get()
        const assignment = st.onlineAssignments.find((a) => a.id === input.assignment_id)
        if (!assignment) {
          // Should not happen — UI prevents it. Returns a stub so callers don't crash.
          return { ...input, id: `as-fail-${Date.now()}`, submitted_at: new Date().toISOString() }
        }
        // Auto-grade multiple choice; tally total marks available.
        let autoScore = 0
        let totalPossible = 0
        for (const q of assignment.questions) {
          totalPossible += q.marks
          if (q.kind === 'multiple_choice') {
            const ans = input.answers.find((a) => a.question_id === q.id)
            if (ans && ans.choice_index === q.correct_choice_index) autoScore += q.marks
          }
        }
        const sub: AssignmentSubmission = {
          ...input,
          id: `asub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          submitted_at: new Date().toISOString(),
          auto_score: autoScore,
          total_possible: totalPossible,
        }
        // Dedupe: one submission per student per assignment — replace if present.
        set((s2) => ({
          assignmentSubmissions: [
            sub,
            ...s2.assignmentSubmissions.filter((x) => !(x.assignment_id === sub.assignment_id && x.student_id === sub.student_id)),
          ],
        }))
        return sub
      },

      gradeAssignmentSubmission: (id, manual_score, gradedBy) => set((st) => ({
        assignmentSubmissions: st.assignmentSubmissions.map((s) =>
          s.id === id
            ? { ...s, manual_score, graded_by: gradedBy, graded_at: new Date().toISOString() }
            : s),
      })),

      recordBusBoarding: (run_id, student_id, kind) => {
        const st = get()
        const student = st.students.find((s) => s.id === student_id)
        if (!student) return
        const today = todayISO()
        // Dedupe today's classroom-vs-bus row so a teacher's classroom mark
        // isn't overwritten — but if no record exists, this becomes the
        // canonical present mark for the day with context='bus'.
        const existingIdx = st.attendance.findIndex((a) => a.student_id === student_id && a.date === today)
        const record = {
          id: existingIdx >= 0 ? st.attendance[existingIdx].id : `att-bus-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          student_id,
          student_name: student.full_name,
          class_name: student.class_name,
          date: today,
          status: 'present' as const,
          parent_notified: existingIdx >= 0 ? st.attendance[existingIdx].parent_notified : false,
          marked_by: 'bus_driver',
          context: 'bus' as const,
        }
        const nextAttendance = existingIdx >= 0
          ? st.attendance.map((a, i) => i === existingIdx ? { ...a, context: 'bus' as const, marked_by: 'bus_driver' } : a)
          : [...st.attendance, record]

        const event = {
          id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          run_id,
          kind: 'arrived_stop' as const,
          stop_id: undefined,
          stop_name: kind === 'on' ? `${student.full_name} boarded` : `${student.full_name} alighted`,
          created_at: new Date().toISOString(),
        }
        set({ attendance: nextAttendance, busEvents: [event, ...st.busEvents] })
      },

      staffCheckInNow: (staff_id, staff_name, role_label) => {
        const today = todayISO()
        const now = new Date().toISOString()
        const existing = get().staffCheckIns.find((c) => c.staff_id === staff_id && c.date === today)
        if (existing) return
        const entry: StaffCheckIn = {
          id: `sci-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          staff_id, staff_name, role_label, date: today, in_at: now,
        }
        set((st) => ({ staffCheckIns: [entry, ...st.staffCheckIns] }))
      },

      staffCheckOutNow: (staff_id) => {
        const today = todayISO()
        set((st) => ({
          staffCheckIns: st.staffCheckIns.map((c) =>
            c.staff_id === staff_id && c.date === today && !c.out_at
              ? { ...c, out_at: new Date().toISOString() }
              : c),
        }))
      },

      submitExcuseRequest: (req) => {
        const entry: ExcuseRequest = {
          ...req,
          id: `exc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
        set((st) => ({ excuseRequests: [entry, ...st.excuseRequests] }))
        return entry
      },

      reviewExcuseRequest: (id, decision, reviewer, notes) => {
        const st = get()
        const req = st.excuseRequests.find((r) => r.id === id)
        if (!req) return
        const now = new Date().toISOString()
        // If approved, retro-mark every attendance row in the date range as
        // 'excused' (creating rows if they don't exist yet).
        let nextAttendance = st.attendance
        if (decision === 'approved') {
          const student = st.students.find((s) => s.id === req.student_id)
          const dates: string[] = []
          const start = new Date(req.start_date)
          const end = new Date(req.end_date)
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().slice(0, 10))
          }
          for (const date of dates) {
            const idx = nextAttendance.findIndex((a) => a.student_id === req.student_id && a.date === date)
            if (idx >= 0) {
              nextAttendance = nextAttendance.map((a, i) => i === idx ? { ...a, status: 'excused' as const } : a)
            } else if (student) {
              nextAttendance = [...nextAttendance, {
                id: `att-exc-${date}-${student.id}`,
                student_id: student.id,
                student_name: student.full_name,
                class_name: student.class_name,
                date,
                status: 'excused' as const,
                parent_notified: true,
                marked_by: reviewer ?? 'admin',
              }]
            }
          }
        }
        set({
          attendance: nextAttendance,
          excuseRequests: st.excuseRequests.map((r) => r.id === id
            ? { ...r, status: decision, reviewed_by: reviewer, reviewed_at: now, review_notes: notes }
            : r),
        })
      },

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

      proratePayrollByCheckIns: (month, year) => {
        const FULL_MONTH_DAYS = 22
        const st = get()
        const monthRows = st.payroll.filter((p) => p.month === month && p.year === year)
        if (monthRows.length === 0) return { adjusted: 0 }
        const monthPrefix = `${year}-${String(month).padStart(2, '0')}`
        let adjusted = 0
        const updates = new Map<string, Partial<Payroll>>()
        for (const row of monthRows) {
          const daysWorked = new Set(
            st.staffCheckIns
              .filter((c) => c.staff_id === row.teacher_id && c.date.startsWith(monthPrefix))
              .map((c) => c.date)
          ).size
          if (daysWorked >= FULL_MONTH_DAYS) continue
          const teacher = st.teachers.find((t) => t.id === row.teacher_id)
          if (!teacher) continue
          const proratedBasic = +(teacher.basic_salary * (daysWorked / FULL_MONTH_DAYS)).toFixed(2)
          const paye = calculatePAYE(proratedBasic)
          const ssnit = calculateSSNIT(proratedBasic)
          updates.set(row.id, {
            basic_salary: proratedBasic,
            paye,
            ssnit_employee: ssnit.employee,
            ssnit_employer: ssnit.employer,
            net_pay: +(proratedBasic + row.allowances - paye - ssnit.employee).toFixed(2),
          })
          adjusted += 1
        }
        if (adjusted > 0) {
          set((s2) => ({
            payroll: s2.payroll.map((p) => updates.has(p.id) ? { ...p, ...updates.get(p.id) } : p),
          }))
        }
        return { adjusted }
      },

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
    {
      name: 'phoenix-school-data',
      version: 2,
      // Persist v1 (build 10–13) shipped with `accounts: []`. On upgrade we
      // need to seed real admin + principal logins so the school can actually
      // sign in. Anything else in the persisted state stays untouched.
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== 'object') return persisted
        const state = persisted as Record<string, unknown>
        if (version < 2) {
          const existing = Array.isArray(state.accounts) ? (state.accounts as Array<{ email?: string }>) : []
          const hasAdmin     = existing.some((a) => a?.email?.toLowerCase() === 'admin@phoenixintl.school')
          const hasPrincipal = existing.some((a) => a?.email?.toLowerCase() === 'principal@phoenixintl.school')
          const adds: UserAccount[] = []
          const now = new Date().toISOString()
          if (!hasAdmin) {
            adds.push({ id: 'acct-admin-1',     full_name: 'School Administrator', email: 'admin@phoenixintl.school',     role: 'admin',     password: 'Phoenix2026!', is_active: true, force_password_change: true, created_at: now })
          }
          if (!hasPrincipal) {
            adds.push({ id: 'acct-principal-1', full_name: 'Principal',            email: 'principal@phoenixintl.school', role: 'principal', password: 'Phoenix2026!', is_active: true, force_password_change: true, created_at: now })
          }
          if (adds.length > 0) state.accounts = [...adds, ...existing]
        }
        return state
      },
    }
  )
)
