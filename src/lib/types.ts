export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'principal'
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

export interface Student {
  id: string
  student_id: string
  full_name: string
  dob?: string
  gender?: 'male' | 'female'
  level: StudentLevel
  class_name: string
  category?: StudentCategory
  family_id?: string
  parent_id?: string
  parent_name?: string
  parent_phone?: string
  fee_status: FeeStatus
  photo_url?: string
  created_at: string
}

export interface Family {
  id: string
  family_name: string
  primary_parent_id?: string
  secondary_parent_id?: string
  primary_email?: string
  primary_phone?: string
  secondary_email?: string
  secondary_phone?: string
  discount_override_percent?: number
  discount_override_note?: string
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
  sms_provider: 'hubtel' | 'mnotify' | 'arkesel' | 'none'
  sms_sender_id?: string
  sms_credit_balance: number
  sms_alert_threshold: number
  hubtel_client_id?: string
  hubtel_client_secret?: string
  hubtel_payments_merchant_id?: string
  hubtel_settlement_bank?: string
  hubtel_settlement_account?: string
  hubtel_last_balance_check?: string
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
  method: 'hubtel_momo' | 'hubtel_card' | 'hubtel_bank' | 'cash' | 'manual'
  channel?: string // e.g. 'mtn-gh', 'vodafone-gh', 'tigo-gh', 'visa', 'mastercard'
  phone_or_ref?: string
  hubtel_invoice_id?: string
  hubtel_checkout_url?: string
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
