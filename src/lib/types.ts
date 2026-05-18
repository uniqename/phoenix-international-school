export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'principal'

// ── Phase 9: HR + granular RBAC ───────────────────────────────
export type PermissionKey =
  | 'general_school_settings'
  | 'admit_students'
  | 'manage_students'
  | 'teacher'
  | 'manage_hr_setup'
  | 'manage_employees'
  | 'manage_employee_roles'
  | 'manage_messaging'
  | 'manage_enquiries'
  | 'finance_control'
  | 'manage_fees'
  | 'fees_cashier'
  | 'delete_fee_transaction'
  | 'manage_payroll'
  | 'receive_finance_notice'
  | 'authorize_fee_discount'
  | 'approve_fee_discount'
  | 'create_expense'
  | 'approve_expense'
  | 'pay_expense'
  | 'approve_payroll'
  | 'authorize_payroll'
  | 'manage_online_learning'
  | 'fees_reports'
  | 'finance_reports'
  | 'take_attendance'
  | 'view_attendance_reports'
  | 'canteen_cashier'
  | 'eacademic_control'
  | 'store_cashier'
  | 'store_manager'
  | 'transport_manager'

export interface EmployeeCategory {
  id: string
  name: string                          // e.g. "Permanent", "Contract", "System Admin"
  code: string                          // e.g. "Pm", "CT", "Admin"
  created_at: string
}

export interface EmployeeDepartment {
  id: string
  name: string                          // e.g. "Administration", "Finance", "Teaching Staff"
  code: string                          // e.g. "AD", "FC", "TS"
  created_at: string
}

export interface EmployeePosition {
  id: string
  name: string                          // e.g. "Teacher", "Cook", "Matron", "CEO"
  description?: string
  created_at: string
}

export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'terminated'

export interface Employee {
  id: string
  employee_id: string                   // auto-generated, e.g. PSS061
  full_name: string
  other_names?: string
  email?: string
  phone?: string
  alt_phone?: string
  emergency_contact?: string
  gender?: 'male' | 'female'
  dob?: string
  ssn?: string                          // SSNIT number
  nationality?: string
  residential_city?: string
  address?: string
  photo_url?: string
  category_id?: string
  department_id?: string
  position_id?: string
  supervisor_id?: string
  qualification?: string
  date_of_employment: string
  status: EmploymentStatus
  // Assignments
  class_ids?: string[]                  // batches/classes this employee teaches or oversees
  subject_ids?: string[]
  // RBAC
  permissions: PermissionKey[]
  is_principal: boolean
  // Auth linkage
  account_id?: string                   // links to UserAccount when this employee gets a login
  created_at: string
}

export interface PayrollPeriod {
  id: string
  month: number
  year: number
  is_published: boolean
  authorized_by?: string
  authorized_at?: string
  approved_by?: string
  approved_at?: string
  paid_at?: string
}

// ── Phase 10: Finance bookkeeping ─────────────────────────────
export type AccountFlow = 'income' | 'expense'

export interface AccountGroup {
  id: string
  name: string                          // e.g. "Canteen Expense", "General Expense"
  code: string                          // e.g. "CS", "GE1"
  flow: AccountFlow
  approver_employee_id?: string         // links to Employee
  created_at: string
}

export interface ChartAccount {
  id: string
  name: string                          // e.g. "Bus Fuel", "Adesua360 Payments"
  code?: string                         // accounting code
  flow: AccountFlow
  group_id?: string                     // links to AccountGroup
  approver_employee_id?: string
  last_closed?: string
  active: boolean
  created_at: string
}

export interface BankBranch {
  id: string
  bank_id: string
  name: string
  branch_code?: string
}

export interface BankAccount {
  id: string
  bank_name: string                     // e.g. "GCB Bank Ghana"
  sort_code?: string                    // e.g. "001"
  is_school_bank: boolean               // primary school account flag
  account_number?: string
  account_name?: string
  branches: BankBranch[]
  created_at: string
}

export type TransactionKind = 'payment' | 'receipt' | 'bank_transfer'
export type TransactionStatus = 'pending' | 'pre_approved' | 'approved' | 'paid' | 'rejected'
export type FinancePaymentMode = 'cash' | 'momo' | 'cheque' | 'bank_transfer' | 'card' | 'pos'

// ── Phase 11: LMS ─────────────────────────────────────────────
export interface TimetablePeriod {
  id: string
  start_time: string                    // HH:MM
  end_time: string
  subject_id?: string
  teacher_id?: string                   // Employee.id
  room?: string
  notes?: string
}

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface ClassTimetableDay {
  day: WeekDay
  periods: TimetablePeriod[]
}

export interface ClassTimetable {
  id: string                            // = class_id
  class_id: string
  days: ClassTimetableDay[]
  updated_at: string
}

export type ExamFormat = 'objective_only' | 'essay_only' | 'objective_and_essay'
export type ExamDeliveryStatus = 'draft' | 'published' | 'closed'

export interface OnlineExam {
  id: string
  name: string
  code: string                          // short code, e.g. "MATH-T2-2025"
  subject_id?: string
  class_ids: string[]
  starts_on: string                     // ISO datetime
  ends_on: string
  duration_minutes: number
  exam_format: ExamFormat
  status: ExamDeliveryStatus
  created_by_employee_id?: string
  total_marks?: number
  created_at: string
}

export type AssignmentQuestionKind = 'multiple_choice' | 'short_answer' | 'essay' | 'file_upload'

export interface AssignmentQuestion {
  id: string
  order: number
  kind: AssignmentQuestionKind
  prompt: string                        // markdown / rich text content
  marks: number
  // Multiple choice
  choices?: string[]
  correct_choice_index?: number
  // Media attachments — references kept generic so we can swap storage backend
  image_url?: string
  attachment_urls?: string[]
}

export type AssignmentStatus = 'draft' | 'published' | 'closed'

export interface OnlineAssignment {
  id: string
  title: string
  subject_id?: string
  class_ids: string[]
  due_date?: string
  instructions?: string
  questions: AssignmentQuestion[]
  status: AssignmentStatus
  created_by_employee_id?: string
  total_marks?: number
  created_at: string
}

// ── Phase 12: Canteen module ──────────────────────────────────
export type MealType = 'breakfast' | 'snacks' | 'brunch' | 'lunch' | 'supper'

export interface CanteenMeal {
  id: string
  name: string                          // e.g. "Jollof Rice"
  type: MealType
  description?: string
  price?: number                        // default price; per-day menu can override
  active: boolean
  created_at: string
}

export interface CanteenFeeParticular {
  id: string
  name: string                          // e.g. "FEEDING FEE - FAMILY OF THREE"
  default_amount: number
  active: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  meal_id: string
  override_price?: number
}

export interface CanteenMenuDay {
  id: string
  date: string                          // YYYY-MM-DD
  items: MenuItem[]                     // meals offered that day
  notes?: string
  created_at: string
}

export type ClassroomSessionKind = 'live' | 'recorded' | 'discussion'

export interface OnlineClassroomSession {
  id: string
  title: string
  description?: string
  kind: ClassroomSessionKind
  subject_id?: string
  class_ids: string[]
  scheduled_at?: string                 // ISO datetime for live sessions
  duration_minutes?: number
  meeting_url?: string                  // Jitsi / Zoom / Google Meet
  recording_url?: string
  teacher_id?: string                   // Employee.id
  is_active: boolean
  created_at: string
}

export interface FinanceTransaction {
  id: string
  kind: TransactionKind
  // For payments: who you're paying / what for
  paying_to?: string                    // free-text receiver name (vendor, employee, etc.)
  description: string
  // Account flow
  spending_from_id?: string             // ChartAccount.id (revenue / source)
  spending_to_id?: string               // ChartAccount.id (expense / destination)
  bank_account_id?: string              // For bank transfers / when source is a bank
  // Money
  amount: number
  payment_mode: FinancePaymentMode
  // Workflow
  status: TransactionStatus
  created_by_employee_id?: string
  approved_by_employee_id?: string
  paid_by_employee_id?: string
  // Audit
  date: string                          // YYYY-MM-DD
  pre_approved: boolean
  receipt_reference?: string
  notes?: string
  created_at: string
  approved_at?: string
  paid_at?: string
}
export type FeeStatus = 'cleared' | 'partial' | 'outstanding'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type PaymentMethod = 'mtn_momo' | 'telecel' | 'at_money' | 'cash' | 'bank'
export type StudentLevel = 'creche' | 'nursery' | 'kg' | 'primary' | 'jhs'
export type StudentCategory = 'new' | 'continuing'
export type SchoolSection = 'preschool' | 'primary' | 'jhs'
export type SubjectCategory = 'core' | 'elective' | 'co-scholastic'
export type Mood = 'happy' | 'tired' | 'sad' | 'active' | 'sick'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'

export interface Student {
  id: string
  student_id: string
  full_name: string
  other_names?: string
  dob?: string
  gender?: 'male' | 'female'
  level: StudentLevel
  class_name: string
  category?: StudentCategory
  course_group_id?: string
  family_id?: string
  parent_id?: string
  parent_name?: string
  parent_phone?: string
  fee_status: FeeStatus
  photo_url?: string
  blood_group?: BloodGroup
  nhis_no?: string
  gps_address?: string
  residential_city?: string
  nationality?: string
  address?: string
  mobile_no?: string
  email?: string
  can_receive_sms?: boolean
  can_receive_email?: boolean
  previous_school?: string
  previous_class?: string
  created_at: string
}

export interface CourseGroup {
  id: string
  name: string
  code: string
  description?: string
  active: boolean
  created_at: string
}

export type GuardianRelationship =
  | 'mother' | 'father' | 'grandparent' | 'aunt' | 'uncle'
  | 'sibling' | 'driver' | 'nanny' | 'guardian' | 'other'

export interface Guardian {
  id: string
  full_name: string
  relationship: GuardianRelationship
  phone?: string
  alt_phone?: string
  email?: string
  occupation?: string
  workplace?: string
  address?: string
  is_emergency_contact: boolean
  can_pick_up_students: boolean
  notes?: string
  created_at: string
}

export interface GuardianLink {
  id: string
  guardian_id: string
  student_id: string
  is_primary: boolean
  created_at: string
}

export type WalletTxType = 'topup' | 'fee_payment' | 'refund' | 'adjustment'

export interface WalletTransaction {
  id: string
  family_id: string
  amount: number
  type: WalletTxType
  description: string
  recorded_by?: string
  created_at: string
}

export interface Family {
  id: string
  family_name: string
  family_code?: string
  primary_parent_id?: string
  secondary_parent_id?: string
  primary_email?: string
  primary_phone?: string
  secondary_email?: string
  secondary_phone?: string
  discount_override_percent?: number
  discount_override_note?: string
  wallet_balance?: number
  invite_token?: string
  invite_role?: 'primary' | 'secondary'
  invite_expires_at?: string
  created_at: string
}

export interface SchoolSettings {
  name: string
  motto?: string
  location: string
  phones: string[]
  email: string
  website?: string
  logo_url?: string
  current_academic_year: string
  current_term: 1 | 2 | 3

  // SMS / messaging
  sms_provider: 'hubtel' | 'mnotify' | 'arkesel' | 'none'
  sms_sender_id?: string
  sms_credit_balance: number
  sms_alert_threshold: number
  hubtel_client_id?: string
  hubtel_client_secret?: string
  hubtel_last_balance_check?: string

  // Payments
  payment_provider: 'paystack' | 'hubtel' | 'none'
  paystack_public_key?: string
  paystack_secret_key?: string
  paystack_subaccount_code?: string
  hubtel_payments_merchant_id?: string
  hubtel_settlement_bank?: string
  hubtel_settlement_account?: string
}

export type SmsStatus = 'pending' | 'sent' | 'failed'

export interface SmsLog {
  id: string
  to: string[]
  body: string
  audience?: string
  cost_estimate?: number
  status: SmsStatus
  provider: 'hubtel' | 'mnotify' | 'arkesel' | 'none'
  reference?: string
  error?: string
  sent_at?: string
  created_at: string
}

export type FeePaymentRequestStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface FeePaymentRequest {
  id: string
  student_id: string
  fee_id?: string
  family_id?: string
  amount: number
  method: 'paystack' | 'hubtel_momo' | 'hubtel_card' | 'hubtel_bank' | 'cash' | 'manual'
  channel?: string // e.g. 'mtn-gh', 'vodafone-gh', 'tigo-gh', 'visa', 'mastercard'
  phone_or_ref?: string
  hubtel_invoice_id?: string
  hubtel_checkout_url?: string
  paystack_reference?: string
  status: FeePaymentRequestStatus
  created_at: string
  paid_at?: string
  error?: string
}

export interface ClassDef {
  id: string
  name: string
  section: SchoolSection
  level: StudentLevel
  capacity?: number
  head_teacher_id?: string
  order: number
}

export interface Subject {
  id: string
  name: string
  section: SchoolSection
  category: SubjectCategory
  level?: StudentLevel
  code?: string
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  terms: AcademicTerm[]
}

export interface AcademicTerm {
  number: 1 | 2 | 3
  start_date: string
  end_date: string
  holidays?: AcademicHoliday[]
  is_current?: boolean
}

export interface AcademicHoliday {
  id: string
  name: string
  start_date: string
  end_date: string
}

export interface DiscountTier {
  sibling_count: number
  percent: number
}

export interface DiscountPolicy {
  tiers: DiscountTier[]
  applies_to_fee_types: string[]
  active: boolean
}

// ── Phase 6: Fees rebuild ───────────────────────────────────────
export type FeeFrequency = 'one_time' | 'per_term' | 'per_session' | 'monthly'

export interface FeeParticular {
  id: string
  name: string                        // e.g. "SCHOOL FEES", "ADMISSION FEE"
  code?: string                       // optional accounting code
  finance_account?: string            // free-text for now; later linked to Chart of Accounts (Phase 10)
  priority: number                    // display + application order (lower = first)
  applies_to_categories?: StudentCategory[]  // empty = both new + continuing
  frequency: FeeFrequency
  default_amount?: number             // optional base amount used as suggestion
  active: boolean
  created_at: string
}

export interface InstantFeeBucket {
  id: string
  particular_id: string               // links to a FeeParticular (e.g. FEEDING FEE)
  bucket_name: string                 // e.g. "FULL FEEDING", "THIRD CHILD"
  amount: number
  applies_to_class_ids?: string[]     // empty = all
  applies_to_categories?: StudentCategory[]
  auto_deduct: boolean                // pulls from family wallet automatically
  created_at: string
}

export type StandaloneDiscountType = 'percent' | 'amount'

export interface StandaloneFeeDiscount {
  id: string
  name: string                        // e.g. "SCHOOL FEE", "PARENTS REBATE", "COVID-19 RELIEF"
  type: StandaloneDiscountType
  value: number                       // percent (0-100) or fixed amount
  on_main_fees: boolean               // true = applies to main fee particulars; false = only Other Fees
  applies_to_fee_ids?: string[]       // FeeParticular.id list (empty = all matching on_main_fees)
  active: boolean
  notes?: string
  created_at: string
}

export interface FeeBillingItem {
  id: string
  particular_id: string
  amount: number                      // resolved amount for this batch/category combo
  class_ids: string[]                 // which classes (empty = all)
  course_group_ids?: string[]
  categories?: StudentCategory[]      // empty = both
  student_ids?: string[]              // optional override for specific students
  due_date?: string
  notes?: string
}

export interface FeeBilling {
  id: string
  name: string                        // e.g. "2025-2026 FIRST TERM FEES"
  academic_year: string
  term: 1 | 2 | 3
  items: FeeBillingItem[]
  is_published: boolean               // true once billing has been pushed to student Fee records
  created_at: string
  published_at?: string
}

// ── Assessments ────────────────────────────────────────────────
export type AssessmentMarkerScale = 'abcd' | 'percent' | 'letter5' | 'narrative'
export type AssessmentScope = 'admission' | 'term' | 'mid-term' | 'project'
export type AssessmentGrade = 'A' | 'B' | 'C' | 'D'

export interface AssessmentMarker {
  id: string
  name: string
  description?: string
  weight?: number
  order: number
}

export interface AssessmentTemplate {
  id: string
  class_id: string
  name: string
  scope: AssessmentScope
  scale: AssessmentMarkerScale
  markers: AssessmentMarker[]
  description?: string
  active: boolean
  created_at: string
}

export interface AssessmentScoreEntry {
  marker_id: string
  grade?: AssessmentGrade
  raw_score?: number
  note?: string
}

// ── Phase 7: Assessment depth ─────────────────────────────────
export type GradingScale = 'abcd' | 'percent' | 'letter5' | 'letter6_basic_school' | 'narrative_preschool' | 'kg_frequency'

export interface GradeLevel {
  id: string
  grade_name: string                    // e.g. "A", "B+", "MO" (KG), "Excellent" (narrative)
  min_score?: number                    // minimum % to earn this grade (omitted for narrative scales)
  aggregate_value?: number              // BECE-style aggregate contribution (1=top)
  short_remark?: string                 // e.g. "Excellent", "Very Good"
  description?: string                  // longer guidance for teachers
}

export interface GradingGroup {
  id: string
  name: string                          // e.g. "Basic School", "JHS 3 Grading", "Pre-School", "Kindergarten"
  scale: GradingScale
  applies_to_class_ids?: string[]       // empty = manual assignment per student/class
  applies_to_levels?: StudentLevel[]    // e.g. ['primary'] for Basic School
  levels: GradeLevel[]
  active: boolean
  created_at: string
}

export type RemarkGroupKind = 'headmaster' | 'class_teacher' | 'interest' | 'conduct' | 'health' | 'other'

export interface RemarkBank {
  id: string
  kind: RemarkGroupKind
  group_name: string                    // e.g. "Headmaster's Remarks", "Interest", "Conduct"
  remarks: RemarkEntry[]
  created_at: string
}

export interface RemarkEntry {
  id: string
  text: string                          // e.g. "Attention must be given to the core subjects."
  min_score?: number                    // optional auto-suggest threshold
  max_score?: number
  order: number
}

export interface StudentInterest {
  id: string
  student_id: string
  interest: string                      // e.g. "Athletics", "Basketball", "Reading"
  rating?: 'low' | 'medium' | 'high'
  notes?: string
  created_at: string
}

export type AcademicAssessmentType = 'marks_only' | 'marks_with_grades' | 'grades_only' | 'narrative'
export type AcademicAssessmentReport = 'single' | 'combined'

export interface AcademicAssessment {
  id: string
  name: string                          // e.g. "1ST TERM BASIC SCHOOL EXAMINATION", "CAT1"
  code: string                          // short code, e.g. "TERM1", "CAT1"
  max_marks: number
  type: AcademicAssessmentType
  report_type: AcademicAssessmentReport // combined assessments roll into a term report
  grading_group_id?: string             // optional link to GradingGroup
  applies_to_levels?: StudentLevel[]
  weight?: number                       // for combined assessments (e.g. CAT1 = 10% of term)
  active: boolean
  created_at: string
}

export interface ReportSignatory {
  id: string
  role_label: string                    // "Headmaster", "Class Teacher", "Examinations Officer"
  full_name: string
  signature_url?: string                // optional uploaded signature image
  active: boolean
  order: number
}

export interface AssessmentResult {
  id: string
  template_id: string
  student_id: string
  term?: 1 | 2 | 3
  academic_year?: string
  entries: AssessmentScoreEntry[]
  teacher_remark?: string
  teacher_remark_by?: string
  headmaster_remark?: string
  headmaster_remark_by?: string
  finalized: boolean
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  profile_id?: string
  employee_id: string
  full_name: string
  phone?: string
  email?: string
  class_name?: string
  subjects: string[]
  basic_salary: number
  hire_date?: string
  ssnit_number?: string
}

export interface Fee {
  id: string
  student_id: string
  student_name?: string
  class_name?: string
  term: 1 | 2 | 3
  academic_year: string
  fee_type: string
  amount: number
  paid_amount: number
  due_date?: string
  status: FeeStatus
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  student_name?: string
  class_name?: string
  fee_id?: string
  amount: number
  method: PaymentMethod
  reference?: string
  receipt_number: string
  paid_at: string
  recorded_by?: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  student_name?: string
  class_name: string
  date: string
  status: AttendanceStatus
  parent_notified: boolean
  marked_by?: string
  context?: 'classroom' | 'bus'
}

export interface Grade {
  id: string
  student_id: string
  student_name?: string
  subject: string
  class_name?: string
  term: number
  academic_year: string
  raw_score: number
  ges_grade: number
  position?: number
  created_at?: string
}

export interface HomeworkAssignment {
  id: string
  class_name: string
  subject: string
  title: string
  description?: string
  due_date: string
  teacher_id?: string
  teacher_name?: string
  video_url?: string
  submission_count?: number
  total_students?: number
  created_at: string
}

export interface LessonPlan {
  id: string
  teacher_id?: string
  teacher_name?: string
  class_name?: string
  subject: string
  strand: string
  sub_strand: string
  week_number?: number
  content?: string
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'push' | 'sms' | 'both' | 'internal'
  audience: 'all' | 'parents' | 'teachers' | 'students' | 'specific_class'
  class_name?: string
  created_by?: string
  created_at: string
}

export interface CrecheLog {
  id: string
  student_id: string
  student_name?: string
  log_date: string
  arrival_time?: string
  breakfast_note?: string
  lunch_note?: string
  nap_duration?: string
  health_notes?: string
  activity_notes?: string
  mood?: Mood
  created_by?: string
}

export interface PickupCode {
  id: string
  student_id: string
  student_name?: string
  code: string
  valid_date: string
  used: boolean
  used_at?: string
}

export interface CanteenWallet {
  id: string
  student_id: string
  student_name?: string
  class_name?: string
  balance: number
  updated_at: string
}

export interface CanteenTransaction {
  id: string
  student_id: string
  student_name?: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  created_at: string
}

export interface Payroll {
  id: string
  teacher_id: string
  teacher_name?: string
  month: number
  year: number
  basic_salary: number
  allowances: number
  paye: number
  ssnit_employee: number
  ssnit_employer: number
  net_pay: number
  paid: boolean
  paid_at?: string
}

export interface FeedPost {
  id: string
  title: string
  content?: string
  image_url?: string
  likes: number
  created_by?: string
  author_name?: string
  created_at: string
}

export interface BECEAttempt {
  id: string
  student_id: string
  subject: string
  score: number
  total: number
  percentage: number
  completed_at: string
}

export interface HomeworkSubmission {
  id: string
  homework_id: string
  student_id: string
  student_name?: string
  file_name: string
  file_type: string
  file_size: number
  submitted_at: string
}

export interface QuizQuestion {
  id: string
  subject: string
  year?: number
  question: string
  options: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  explanation?: string
  source?: string
  created_by?: string
  created_at: string
}

export interface UserAccount {
  id: string
  full_name: string
  email: string
  role: UserRole
  password: string
  is_active: boolean
  force_password_change: boolean
  created_at: string
  last_login?: string
  linked_id?: string
}
