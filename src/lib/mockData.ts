import type {
  Student, Teacher, Fee, Payment, AttendanceRecord, Grade,
  HomeworkAssignment, LessonPlan, Announcement, CrecheLog,
  CanteenWallet, FeedPost, Payroll, UserProfile, QuizQuestion,
  SchoolSettings, ClassDef, Subject, AcademicYear, Family, DiscountPolicy,
  AssessmentTemplate, CourseGroup, Guardian, GuardianLink,
  FeeParticular, InstantFeeBucket, StandaloneFeeDiscount, FeeBilling,
  GradingGroup, RemarkBank, AcademicAssessment, ReportSignatory, StudentInterest,
  EmployeeCategory, EmployeeDepartment, EmployeePosition, Employee, PermissionKey,
  AccountGroup, ChartAccount, BankAccount, FinanceTransaction,
  CanteenMeal, CanteenFeeParticular, CanteenMenuDay,
  MessageTemplate, MessageLog,
  Enquiry, DataUpload, SmartReport,
} from './types'
import { getGESGrade, calculatePAYE, calculateSSNIT } from './utils'

export const MOCK_USERS: UserProfile[] = [
  { id: 'admin-1', email: 'admin@phoenixgh.edu', full_name: 'Mr. Emmanuel Adjei', role: 'admin', phone: '0244123456' },
  { id: 'principal-1', email: 'principal@phoenixgh.edu', full_name: 'Mrs. Akua Boateng', role: 'principal', phone: '0508923445' },
  { id: 'teacher-1', email: 'teacher@phoenixgh.edu', full_name: 'Mrs. Adjoa Koomson', role: 'teacher', phone: '0244234567' },
  { id: 'parent-1', email: 'parent@phoenixgh.edu', full_name: 'Mr. Kwame Asante', role: 'parent', phone: '0244345678' },
  { id: 'student-1', email: 'student@phoenixgh.edu', full_name: 'Kwame Asante Jr.', role: 'student', phone: '' },
]

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', student_id: 'JHS-2024-001', full_name: 'Kwame Asante Jr.', dob: '2010-03-15', gender: 'male', level: 'jhs', class_name: 'JHS 3A', parent_name: 'Mr. Kwame Asante', parent_phone: '0244345678', fee_status: 'cleared', created_at: '2024-01-05T00:00:00Z' },
  { id: 's2', student_id: 'JHS-2024-002', full_name: 'Abena Frimpong', dob: '2010-07-22', gender: 'female', level: 'jhs', class_name: 'JHS 3A', parent_name: 'Mrs. Frimpong', parent_phone: '0201456789', fee_status: 'cleared', created_at: '2024-01-05T00:00:00Z' },
  { id: 's3', student_id: 'JHS-2024-003', full_name: 'Yaw Mensah', dob: '2011-01-10', gender: 'male', level: 'jhs', class_name: 'JHS 3A', parent_name: 'Mr. Mensah', parent_phone: '0277567890', fee_status: 'outstanding', created_at: '2024-01-05T00:00:00Z' },
  { id: 's4', student_id: 'PR-2024-001', full_name: 'Ama Boateng', dob: '2013-05-18', gender: 'female', level: 'primary', class_name: 'Primary 5B', parent_name: 'Mrs. Boateng', parent_phone: '0244678901', fee_status: 'cleared', created_at: '2024-01-06T00:00:00Z' },
  { id: 's5', student_id: 'PR-2024-002', full_name: 'Kofi Asiedu', dob: '2013-11-30', gender: 'male', level: 'primary', class_name: 'Primary 5B', parent_name: 'Mr. Asiedu', parent_phone: '0200789012', fee_status: 'partial', created_at: '2024-01-06T00:00:00Z' },
  { id: 's6', student_id: 'PR-2024-003', full_name: 'Efua Darko', dob: '2014-02-14', gender: 'female', level: 'primary', class_name: 'Primary 5B', parent_name: 'Mr. Darko', parent_phone: '0246890123', fee_status: 'cleared', created_at: '2024-01-06T00:00:00Z' },
  { id: 's7', student_id: 'KG-2024-001', full_name: 'Nana Owusu', dob: '2019-08-05', gender: 'male', level: 'kg', class_name: 'KG 2', parent_name: 'Mrs. Owusu', parent_phone: '0244901234', fee_status: 'cleared', created_at: '2024-01-07T00:00:00Z' },
  { id: 's8', student_id: 'CR-2024-001', full_name: 'Maame Adu', dob: '2022-04-10', gender: 'female', level: 'creche', class_name: 'Crèche', parent_name: 'Mrs. Adu', parent_phone: '0277012345', fee_status: 'cleared', created_at: '2024-01-07T00:00:00Z' },
  { id: 's9', student_id: 'JHS-2024-004', full_name: 'Akua Nyarko', dob: '2010-09-25', gender: 'female', level: 'jhs', class_name: 'JHS 3A', parent_name: 'Mr. Nyarko', parent_phone: '0200123456', fee_status: 'outstanding', created_at: '2024-01-05T00:00:00Z' },
  { id: 's10', student_id: 'JHS-2024-005', full_name: 'Kweku Appiah', dob: '2011-12-01', gender: 'male', level: 'jhs', class_name: 'JHS 3A', parent_name: 'Mrs. Appiah', parent_phone: '0244234567', fee_status: 'cleared', created_at: '2024-01-05T00:00:00Z' },
]

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', employee_id: 'EMP-001', full_name: 'Mrs. Adjoa Koomson', phone: '0244234567', email: 'akoomson@phoenixgh.edu', class_name: 'JHS 3A', subjects: ['Mathematics', 'Integrated Science'], basic_salary: 3200, hire_date: '2018-09-01', ssnit_number: 'G0001234567' },
  { id: 't2', employee_id: 'EMP-002', full_name: 'Mr. Kofi Amponsah', phone: '0201345678', email: 'kamponsah@phoenixgh.edu', class_name: 'JHS 2A', subjects: ['English Language', 'Social Studies'], basic_salary: 2800, hire_date: '2019-01-15' },
  { id: 't3', employee_id: 'EMP-003', full_name: 'Miss Yaa Owusu', phone: '0246456789', email: 'yowusu@phoenixgh.edu', class_name: 'Primary 5B', subjects: ['Mathematics', 'Science', 'Social Studies'], basic_salary: 2500, hire_date: '2020-09-01' },
  { id: 't4', employee_id: 'EMP-004', full_name: 'Mr. Ebo Asante', phone: '0277567890', email: 'easante@phoenixgh.edu', class_name: 'KG 2', subjects: ['All KG Subjects'], basic_salary: 2200, hire_date: '2021-01-05' },
  { id: 't5', employee_id: 'EMP-005', full_name: 'Mrs. Ama Boateng-Addae', phone: '0200678901', email: 'aboateng@phoenixgh.edu', class_name: 'Crèche', subjects: ['All Crèche Activities'], basic_salary: 2000, hire_date: '2022-09-01' },
]

export const MOCK_FEES: Fee[] = [
  { id: 'f1', student_id: 's1', student_name: 'Kwame Asante Jr.', class_name: 'JHS 3A', term: 2, academic_year: '2025/2026', fee_type: 'School Fees', amount: 800, paid_amount: 800, status: 'cleared', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f2', student_id: 's2', student_name: 'Abena Frimpong', class_name: 'JHS 3A', term: 2, academic_year: '2025/2026', fee_type: 'School Fees', amount: 800, paid_amount: 800, status: 'cleared', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f3', student_id: 's3', student_name: 'Yaw Mensah', class_name: 'JHS 3A', term: 2, academic_year: '2025/2026', fee_type: 'School Fees', amount: 800, paid_amount: 0, status: 'outstanding', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f4', student_id: 's4', student_name: 'Ama Boateng', class_name: 'Primary 5B', term: 2, academic_year: '2025/2026', fee_type: 'School Fees', amount: 650, paid_amount: 650, status: 'cleared', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f5', student_id: 's5', student_name: 'Kofi Asiedu', class_name: 'Primary 5B', term: 2, academic_year: '2025/2026', fee_type: 'School Fees', amount: 650, paid_amount: 300, status: 'partial', created_at: '2026-01-10T00:00:00Z' },
  { id: 'f6', student_id: 's9', student_name: 'Akua Nyarko', class_name: 'JHS 3A', term: 2, academic_year: '2025/2026', fee_type: 'School Fees', amount: 800, paid_amount: 0, status: 'outstanding', created_at: '2026-01-10T00:00:00Z' },
]

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', student_id: 's1', student_name: 'Kwame Asante Jr.', class_name: 'JHS 3A', amount: 800, method: 'mtn_momo', reference: 'MTN-ABC123', receipt_number: 'PIS-2026-A1B2C', paid_at: '2026-01-12T09:02:00Z' },
  { id: 'p2', student_id: 's2', student_name: 'Abena Frimpong', class_name: 'JHS 3A', amount: 800, method: 'telecel', reference: 'TEL-DEF456', receipt_number: 'PIS-2026-D3E4F', paid_at: '2026-01-13T10:30:00Z' },
  { id: 'p3', student_id: 's4', student_name: 'Ama Boateng', class_name: 'Primary 5B', amount: 650, method: 'mtn_momo', reference: 'MTN-GHI789', receipt_number: 'PIS-2026-G5H6I', paid_at: '2026-01-14T11:00:00Z' },
  { id: 'p4', student_id: 's5', student_name: 'Kofi Asiedu', class_name: 'Primary 5B', amount: 300, method: 'at_money', reference: 'AT-JKL012', receipt_number: 'PIS-2026-J7K8L', paid_at: '2026-01-15T12:05:00Z' },
]

const today = new Date().toISOString().split('T')[0]

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', student_id: 's1', student_name: 'Kwame Asante Jr.', class_name: 'JHS 3A', date: today, status: 'present', parent_notified: false },
  { id: 'a2', student_id: 's2', student_name: 'Abena Frimpong', class_name: 'JHS 3A', date: today, status: 'present', parent_notified: false },
  { id: 'a3', student_id: 's3', student_name: 'Yaw Mensah', class_name: 'JHS 3A', date: today, status: 'absent', parent_notified: true },
  { id: 'a4', student_id: 's9', student_name: 'Akua Nyarko', class_name: 'JHS 3A', date: today, status: 'present', parent_notified: false },
  { id: 'a5', student_id: 's10', student_name: 'Kweku Appiah', class_name: 'JHS 3A', date: today, status: 'late', parent_notified: false },
]

const rawGrades = [
  { student_id: 's1', student_name: 'Kwame Asante Jr.', scores: [82, 76, 89, 91, 74, 61] },
  { student_id: 's2', student_name: 'Abena Frimpong', scores: [91, 88, 85, 93, 82, 78] },
  { student_id: 's3', student_name: 'Yaw Mensah', scores: [55, 48, 62, 70, 51, 43] },
  { student_id: 's9', student_name: 'Akua Nyarko', scores: [77, 72, 80, 84, 68, 55] },
  { student_id: 's10', student_name: 'Kweku Appiah', scores: [68, 81, 74, 78, 72, 65] },
]
const subjects = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'ICT', 'French']

export const MOCK_GRADES: Grade[] = rawGrades.flatMap(({ student_id, student_name, scores }) =>
  subjects.map((subject, i) => ({
    id: `g-${student_id}-${i}`,
    student_id,
    student_name,
    subject,
    class_name: 'JHS 3A',
    term: 2,
    academic_year: '2025/2026',
    raw_score: scores[i],
    ges_grade: getGESGrade(scores[i]),
    created_at: '2026-04-01T00:00:00Z',
  }))
)

export const MOCK_HOMEWORK: HomeworkAssignment[] = [
  { id: 'hw1', class_name: 'JHS 3A', subject: 'Mathematics', title: 'Exercises 14.1–14.4: Fractions & Decimals', description: 'Complete all questions in the textbook.', due_date: '2026-05-06', teacher_name: 'Mrs. Adjoa Koomson', submission_count: 18, total_students: 27, created_at: '2026-05-03T00:00:00Z' },
  { id: 'hw2', class_name: 'JHS 3A', subject: 'English Language', title: 'Essay: My Community', description: 'Write a 2-page essay on your community.', due_date: '2026-05-08', teacher_name: 'Mr. Kofi Amponsah', submission_count: 24, total_students: 27, created_at: '2026-05-03T00:00:00Z' },
  { id: 'hw3', class_name: 'JHS 3A', subject: 'Integrated Science', title: 'Diagram: Types of Soil', description: 'Draw and label the three types of soil found in Ghana.', due_date: '2026-05-10', teacher_name: 'Mrs. Adjoa Koomson', submission_count: 9, total_students: 27, created_at: '2026-05-03T00:00:00Z' },
  { id: 'hw4', class_name: 'Primary 5B', subject: 'Mathematics', title: 'Multiplication Tables 1–12', description: 'Practice and memorise all tables.', due_date: '2026-05-07', teacher_name: 'Miss Yaa Owusu', submission_count: 28, total_students: 32, created_at: '2026-05-03T00:00:00Z' },
]

export const MOCK_LESSON_PLANS: LessonPlan[] = [
  { id: 'lp1', class_name: 'JHS 3A', subject: 'Mathematics', strand: 'Number and Algebra', sub_strand: 'Fractions & Decimals', week_number: 14, content: 'Students will be able to add, subtract and simplify fractions. Starter: 5 warm-up problems. Main: Guided practice with worked examples. Group work: peer teaching. Plenary: exit ticket.', teacher_name: 'Mrs. Adjoa Koomson', created_at: '2026-04-28T00:00:00Z' },
  { id: 'lp2', class_name: 'JHS 3A', subject: 'Integrated Science', strand: 'Earth & Environment', sub_strand: 'Soil Types in Ghana', week_number: 14, content: 'Identify and compare clay, sandy and loam soils. Practical: soil texture test using water. Discussion on farming implications.', teacher_name: 'Mrs. Adjoa Koomson', created_at: '2026-04-29T00:00:00Z' },
]

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'an1', title: 'No School — Workers Day Holiday', content: 'School will be closed on Thursday 1st May for Workers Day. School resumes Friday 2nd May.', type: 'both', audience: 'all', created_by: 'Mr. Emmanuel Adjei', created_at: '2026-04-30T08:00:00Z' },
  { id: 'an2', title: 'BECE Mock Exams — Week 16', content: 'JHS 3 students will write mock BECE exams starting Monday 19th May. Please ensure all fees are cleared to access results.', type: 'sms', audience: 'parents', created_at: '2026-05-01T09:00:00Z' },
  { id: 'an3', title: 'Sports Day — 24 May 2026', content: 'Annual Sports Day will be held on Saturday 24th May. All students are to report by 7:30 AM in their house colours.', type: 'both', audience: 'all', created_at: '2026-05-02T10:00:00Z' },
]

export const MOCK_CRECHE_LOG: CrecheLog[] = [
  { id: 'cl1', student_id: 's8', student_name: 'Maame Adu', log_date: today, arrival_time: '7:28 AM', breakfast_note: 'Ate well — porridge & boiled egg', lunch_note: 'Rice & stew, full portion', nap_duration: '45 minutes (10:00–10:45)', health_notes: 'No issues', activity_notes: 'Finger painting & building blocks', mood: 'happy', created_by: 'Mrs. Ama Boateng-Addae' },
]

export const MOCK_CANTEEN_WALLETS: CanteenWallet[] = [
  { id: 'cw1', student_id: 's1', student_name: 'Kwame Asante Jr.', class_name: 'JHS 3A', balance: 42.50, updated_at: today },
  { id: 'cw2', student_id: 's2', student_name: 'Abena Frimpong', class_name: 'JHS 3A', balance: 78.00, updated_at: today },
  { id: 'cw3', student_id: 's3', student_name: 'Yaw Mensah', class_name: 'JHS 3A', balance: 5.00, updated_at: today },
  { id: 'cw4', student_id: 's4', student_name: 'Ama Boateng', class_name: 'Primary 5B', balance: 55.00, updated_at: today },
  { id: 'cw5', student_id: 's7', student_name: 'Nana Owusu', class_name: 'KG 2', balance: 30.00, updated_at: today },
  { id: 'cw6', student_id: 's8', student_name: 'Maame Adu', class_name: 'Crèche', balance: 20.00, updated_at: today },
]

export const MOCK_FEED_POSTS: FeedPost[] = [
  { id: 'fp1', title: 'Sports Day Prep — JHS vs Primary', content: 'Our JHS students practiced relay races today! The energy was amazing. Sports Day is 24 May — see you there!', likes: 24, author_name: 'Mrs. Adjoa Koomson', created_at: '2026-05-02T14:30:00Z' },
  { id: 'fp2', title: 'Crèche Painting Day', content: 'Our little ones explored finger painting today. Every masterpiece is now on display at the Crèche corridor!', likes: 38, author_name: 'Mrs. Ama Boateng-Addae', created_at: '2026-05-01T11:00:00Z' },
  { id: 'fp3', title: 'Wear Ghana Friday', content: 'Students and teachers showed up in beautiful Ghanaian attire for Wear Ghana Friday. Proud of our culture!', likes: 52, author_name: 'Admin', created_at: '2026-04-25T16:00:00Z' },
]

export const MOCK_PAYROLL: Payroll[] = MOCK_TEACHERS.map((t, i) => {
  const paye = calculatePAYE(t.basic_salary)
  const ssnit = calculateSSNIT(t.basic_salary)
  return {
    id: `pay-${i}`,
    teacher_id: t.id,
    teacher_name: t.full_name,
    month: 4,
    year: 2026,
    basic_salary: t.basic_salary,
    allowances: 200,
    paye,
    ssnit_employee: ssnit.employee,
    ssnit_employer: ssnit.employer,
    net_pay: t.basic_salary + 200 - paye - ssnit.employee,
    paid: i < 3,
  }
})

const D = "2025-01-01T00:00:00Z"
export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Mathematics
  { id:"qq-m1",  subject:"Mathematics", question:"Simplify: 3/4 + 2/3",                                           options:["5/7","17/12","1 5/12","11/12"],                                                                                       answer:2, explanation:"LCM of 4 and 3 is 12. So 9/12 + 8/12 = 17/12 = 1 5/12", source:"BECE Sample", created_at:D },
  { id:"qq-m2",  subject:"Mathematics", question:"Find the value of x in: 2x + 5 = 17",                           options:["4","6","5","11"],                                                                                                       answer:1, explanation:"2x = 17 − 5 = 12, so x = 6",                              source:"BECE Sample", created_at:D },
  { id:"qq-m3",  subject:"Mathematics", question:"A rectangle has length 8cm and width 5cm. What is its area?",    options:["26 cm²","40 cm²","13 cm²","80 cm²"],                                                                                   answer:1, explanation:"Area = length × width = 8 × 5 = 40 cm²",                   source:"BECE Sample", created_at:D },
  { id:"qq-m4",  subject:"Mathematics", question:"What is 15% of GH₵200?",                                        options:["GH₵25","GH₵30","GH₵35","GH₵20"],                                                                                      answer:1, explanation:"15% × 200 = 0.15 × 200 = GH₵30",                           source:"BECE Sample", created_at:D },
  { id:"qq-m5",  subject:"Mathematics", question:"Round 4,756 to the nearest hundred.",                            options:["4,700","4,800","5,000","4,760"],                                                                                        answer:1, explanation:"The digit in the tens place is 5, so we round up: 4,800",   source:"BECE Sample", created_at:D },
  { id:"qq-m6",  subject:"Mathematics", question:"What is the HCF of 12 and 18?",                                  options:["3","6","9","12"],                                                                                                       answer:1, explanation:"Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. HCF = 6", source:"BECE Sample", created_at:D },
  { id:"qq-m7",  subject:"Mathematics", question:"A shopkeeper buys an item for GH₵120 and sells it for GH₵150. What is the profit percentage?", options:["20%","25%","30%","15%"],                                                               answer:1, explanation:"Profit = 30. Profit% = (30/120) × 100 = 25%",               source:"BECE Sample", created_at:D },
  { id:"qq-m8",  subject:"Mathematics", question:"Find the perimeter of a square with side 7cm.",                  options:["28 cm","49 cm","14 cm","21 cm"],                                                                                        answer:0, explanation:"Perimeter = 4 × side = 4 × 7 = 28 cm",                      source:"BECE Sample", created_at:D },
  { id:"qq-m9",  subject:"Mathematics", question:"Express 0.35 as a fraction in its lowest terms.",                options:["35/100","7/20","3/5","7/10"],                                                                                           answer:1, explanation:"0.35 = 35/100 = 7/20 (divide by 5)",                        source:"BECE Sample", created_at:D },
  { id:"qq-m10", subject:"Mathematics", question:"Solve: 3(x − 2) = 9",                                            options:["x = 3","x = 5","x = 1","x = 7"],                                                                                       answer:1, explanation:"3x − 6 = 9, 3x = 15, x = 5",                               source:"BECE Sample", created_at:D },
  // English Language
  { id:"qq-e1", subject:"English Language", question:"Choose the correct sentence:", options:["The boys plays football every day.","The boys play football every day.","The boys playing football every day.","The boys played football every days."], answer:1, explanation:"'The boys' is plural so we use 'play' (base form), not 'plays'.", source:"BECE Sample", created_at:D },
  { id:"qq-e2", subject:"English Language", question:"Which of these is a synonym of 'courageous'?",               options:["Cowardly","Fearful","Brave","Timid"],                                                                                   answer:2, explanation:"'Courageous' means showing courage — 'Brave' is the correct synonym.", source:"BECE Sample", created_at:D },
  { id:"qq-e3", subject:"English Language", question:"The word 'benevolent' means:",                                options:["Wicked","Charitable and kind","Powerful","Cowardly"],                                                                  answer:1, explanation:"'Benevolent' means well-meaning and kindly — charitable and kind.", source:"BECE Sample", created_at:D },
  { id:"qq-e4", subject:"English Language", question:"Which punctuation mark ends a question?",                     options:["Full stop","Exclamation mark","Question mark","Comma"],                                                                answer:2, explanation:"A question mark (?) is placed at the end of a direct question.", source:"BECE Sample", created_at:D },
  { id:"qq-e5", subject:"English Language", question:"Choose the correct plural of 'leaf':",                        options:["Leafs","Leaves","Leaes","Leafes"],                                                                                     answer:1, explanation:"Words ending in '-f' or '-fe' change to '-ves' in the plural: leaf → leaves.", source:"BECE Sample", created_at:D },
  { id:"qq-e6", subject:"English Language", question:"What is the antonym of 'generous'?",                         options:["Kind","Giving","Miserly","Wealthy"],                                                                                   answer:2, explanation:"'Miserly' means unwilling to spend — the opposite of generous.", source:"BECE Sample", created_at:D },
  { id:"qq-e7", subject:"English Language", question:"The sentence 'She went to the market' is in which tense?",   options:["Present simple","Past simple","Future simple","Present continuous"],                                                  answer:1, explanation:"'Went' is the past tense of 'go' — so this is past simple.", source:"BECE Sample", created_at:D },
  // Integrated Science
  { id:"qq-s1", subject:"Integrated Science", question:"Which organ is responsible for filtering waste from the blood?",   options:["Heart","Liver","Kidney","Lungs"],                                              answer:2, explanation:"The kidneys filter waste products and excess water from the blood to produce urine.", source:"BECE Sample", created_at:D },
  { id:"qq-s2", subject:"Integrated Science", question:"What is the process by which plants make their own food?",        options:["Respiration","Transpiration","Photosynthesis","Digestion"],                    answer:2, explanation:"Photosynthesis: plants use sunlight, water, and CO₂ to make glucose.", source:"BECE Sample", created_at:D },
  { id:"qq-s3", subject:"Integrated Science", question:"The force that pulls objects toward the Earth is called:",        options:["Friction","Magnetism","Gravity","Tension"],                                    answer:2, explanation:"Gravity is the force of attraction between the Earth and objects on or near its surface.", source:"BECE Sample", created_at:D },
  { id:"qq-s4", subject:"Integrated Science", question:"What gas do plants take in during photosynthesis?",               options:["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],                              answer:2, explanation:"Plants absorb CO₂ through tiny pores called stomata during photosynthesis.", source:"BECE Sample", created_at:D },
  { id:"qq-s5", subject:"Integrated Science", question:"Which state of matter has no fixed shape or volume?",             options:["Solid","Liquid","Gas","Plasma"],                                               answer:2, explanation:"Gases expand to fill any container — they have no fixed shape or volume.", source:"BECE Sample", created_at:D },
  { id:"qq-s6", subject:"Integrated Science", question:"The unit of electric current is:",                                options:["Volt","Ampere","Ohm","Watt"],                                                  answer:1, explanation:"Electric current is measured in Amperes (A).", source:"BECE Sample", created_at:D },
  { id:"qq-s7", subject:"Integrated Science", question:"Which of these is a renewable source of energy?",                 options:["Coal","Petroleum","Natural Gas","Solar energy"],                              answer:3, explanation:"Solar energy is renewable — it comes from the sun and will not run out.", source:"BECE Sample", created_at:D },
  // Social Studies
  { id:"qq-ss1", subject:"Social Studies", question:"Who was Ghana's first President?",                                    options:["J.J. Rawlings","John Kufuor","Kwame Nkrumah","Kofi Busia"],                   answer:2, explanation:"Dr. Kwame Nkrumah became Ghana's first President on 1 July 1960.", source:"BECE Sample", created_at:D },
  { id:"qq-ss2", subject:"Social Studies", question:"What does 'GDP' stand for?",                                          options:["Gross Domestic Product","General Development Plan","Government Domestic Policy","Gross Daily Production"], answer:0, explanation:"GDP = Gross Domestic Product — the total value of all goods and services produced in a country.", source:"BECE Sample", created_at:D },
  { id:"qq-ss3", subject:"Social Studies", question:"Lake Volta was created by the construction of which dam?",            options:["Bui Dam","Akosombo Dam","Kpong Dam","Vea Dam"],                               answer:1, explanation:"The Akosombo Dam (1961–1965) created Lake Volta, one of the world's largest man-made lakes.", source:"BECE Sample", created_at:D },
  { id:"qq-ss4", subject:"Social Studies", question:"The capital city of Ghana is:",                                       options:["Kumasi","Tamale","Accra","Takoradi"],                                          answer:2, explanation:"Accra is the capital and largest city of Ghana.", source:"BECE Sample", created_at:D },
  { id:"qq-ss5", subject:"Social Studies", question:"Ghana gained independence from which country?",                       options:["France","Portugal","USA","Britain"],                                           answer:3, explanation:"Ghana (formerly the Gold Coast) gained independence from Britain on 6 March 1957.", source:"BECE Sample", created_at:D },
  { id:"qq-ss6", subject:"Social Studies", question:"Which is the largest region in Ghana by land area?",                  options:["Ashanti","Northern","Oti","North East"],                                      answer:1, explanation:"Among current regions, the Northern Region remains the largest by land area.", source:"BECE Sample", created_at:D },
  // French
  { id:"qq-f1", subject:"French", question:"What is the French word for 'school'?",                                        options:["Maison","École","Classe","Livre"],                                             answer:1, explanation:"'École' is the French word for school.", source:"BECE Sample", created_at:D },
  { id:"qq-f2", subject:"French", question:"Translate: 'Je m'appelle Kwame'",                                              options:["I am from Kwame","My name is Kwame","I know Kwame","Hello Kwame"],            answer:1, explanation:"'Je m'appelle' literally means 'I call myself' — in English: 'My name is'.", source:"BECE Sample", created_at:D },
  { id:"qq-f3", subject:"French", question:"How do you say 'Thank you' in French?",                                        options:["Bonjour","Au revoir","Merci","S'il vous plaît"],                              answer:2, explanation:"'Merci' means 'Thank you' in French.", source:"BECE Sample", created_at:D },
  { id:"qq-f4", subject:"French", question:"What does 'Bonjour' mean?",                                                    options:["Good night","Goodbye","Good morning / Hello","Please"],                       answer:2, explanation:"'Bonjour' is a daytime greeting meaning 'Good day' or 'Hello'.", source:"BECE Sample", created_at:D },
  { id:"qq-f5", subject:"French", question:"Translate: 'Combien coûte ce livre?'",                                         options:["Where is the book?","Is this your book?","How much does this book cost?","I like this book"], answer:2, explanation:"'Combien coûte' = 'How much does … cost'. So: 'How much does this book cost?'", source:"BECE Sample", created_at:D },
  // RME
  { id:"qq-r1", subject:"RME", question:"Which of these is the holy book of Islam?",                                       options:["The Bible","The Torah","The Quran","The Vedas"],                              answer:2, explanation:"The Quran (also written Koran) is the holy scripture of Islam.", source:"BECE Sample", created_at:D },
  { id:"qq-r2", subject:"RME", question:"The Golden Rule in most religions teaches us to:",                                 options:["Pray daily","Treat others as you want to be treated","Give to the poor only","Attend church regularly"], answer:1, explanation:"The Golden Rule: 'Do unto others as you would have them do unto you.'", source:"BECE Sample", created_at:D },
  { id:"qq-r3", subject:"RME", question:"Which of these is a traditional Ghanaian festival?",                               options:["Diwali","Odwira","Eid al-Fitr","Christmas"],                                  answer:1, explanation:"Odwira is a traditional Akan festival of purification and thanksgiving.", source:"BECE Sample", created_at:D },
  { id:"qq-r4", subject:"RME", question:"The pillar of Islam that requires fasting is called:",                             options:["Salah","Zakat","Sawm","Hajj"],                                                answer:2, explanation:"Sawm is the Islamic practice of fasting, particularly during the month of Ramadan.", source:"BECE Sample", created_at:D },
  { id:"qq-r5", subject:"RME", question:"The Ten Commandments were given to which prophet?",                                options:["Abraham","David","Jesus","Moses"],                                            answer:3, explanation:"According to the Bible, God gave the Ten Commandments to Moses on Mount Sinai.", source:"BECE Sample", created_at:D },
]

// ──────────────────────────────────────────────────────────────────────────────
// School configuration (settings, classes, subjects, calendar, discount policy)
// Sourced from principal's brief 2026-05-07.
// ──────────────────────────────────────────────────────────────────────────────

export const PHOENIX_SCHOOL_SETTINGS: SchoolSettings = {
  name: 'Phoenix International School',
  motto: 'Rising to Excellence',
  location: 'AGAPE',
  phones: ['0508923445', '0545307614'],
  email: 'myphoenixschool@gmail.com',
  current_academic_year: '2025/2026',
  current_term: 2,

  // SMS deferred until Hubtel onboarding clears (they need: cert of incorporation,
  // business logo, Ghana Card IDs of directors). Switch to 'hubtel' + paste keys
  // once approved. Until then notices stay in-app + email.
  sms_provider: 'none',
  sms_sender_id: 'PHOENIX',
  sms_credit_balance: 0,
  sms_alert_threshold: 10,

  // Payments via Paystack while Hubtel KYC is in progress.
  // Phoenix shares the DOXA & CO. LLC Paystack business with HomeLink — both apps
  // settle to the same bank account, transactions are tagged via metadata.school
  // so admin can reconcile per-app. Swap to a dedicated subaccount later if the
  // school wants separate payouts.
  payment_provider: 'paystack',
  // Public key is designed to ship client-side — paystack inline checkout uses
  // it directly from the browser. Shared with HomeLink (same DOXA business).
  paystack_public_key: 'pk_live_b8d1605d6d4607c062f32641133b20719bcc0e6c',
  // Secret key intentionally NOT seeded here: it must stay server-side. Admin
  // can paste it into /admin/settings (kept in localStorage only) for future
  // server-proxy use — never commit it to this public repo.
}

export const PHOENIX_CLASSES: ClassDef[] = [
  { id: 'cls-creche',   name: 'Crèche',     section: 'preschool', level: 'creche',  order: 1 },
  { id: 'cls-nur1',     name: 'Nursery 1',  section: 'preschool', level: 'nursery', order: 2 },
  { id: 'cls-nur2',     name: 'Nursery 2',  section: 'preschool', level: 'nursery', order: 3 },
  { id: 'cls-kg1',      name: 'KG 1',       section: 'preschool', level: 'kg',      order: 4 },
  { id: 'cls-kg2',      name: 'KG 2',       section: 'preschool', level: 'kg',      order: 5 },
  { id: 'cls-p1',       name: 'Class 1',    section: 'primary',   level: 'primary', order: 6 },
  { id: 'cls-p2',       name: 'Class 2',    section: 'primary',   level: 'primary', order: 7 },
  { id: 'cls-p3',       name: 'Class 3',    section: 'primary',   level: 'primary', order: 8 },
  { id: 'cls-p4',       name: 'Class 4',    section: 'primary',   level: 'primary', order: 9 },
  { id: 'cls-p5',       name: 'Class 5',    section: 'primary',   level: 'primary', order: 10 },
  { id: 'cls-p6',       name: 'Class 6',    section: 'primary',   level: 'primary', order: 11 },
  { id: 'cls-jhs1',     name: 'JHS 1',      section: 'jhs',       level: 'jhs',     order: 12 },
  { id: 'cls-jhs2',     name: 'JHS 2',      section: 'jhs',       level: 'jhs',     order: 13 },
  { id: 'cls-jhs3',     name: 'JHS 3',      section: 'jhs',       level: 'jhs',     order: 14 },
]

export const PHOENIX_SUBJECTS: Subject[] = [
  // Preschool — Co-Scholastic
  { id: 'sub-ps-play',  name: 'Learning Through Play', section: 'preschool', category: 'co-scholastic' },
  { id: 'sub-ps-lang',  name: 'Language Development',  section: 'preschool', category: 'co-scholastic' },
  { id: 'sub-ps-num',   name: 'Numeracy',              section: 'preschool', category: 'co-scholastic' },
  { id: 'sub-ps-arts',  name: 'Creative Arts',         section: 'preschool', category: 'co-scholastic' },
  { id: 'sub-ps-pe',    name: 'Physical Education',    section: 'preschool', category: 'co-scholastic' },
  { id: 'sub-ps-rme',   name: 'RME',                   section: 'preschool', category: 'co-scholastic' },
  // Primary — Core
  { id: 'sub-pr-eng',   name: 'English Language',      section: 'primary',   category: 'core' },
  { id: 'sub-pr-math',  name: 'Mathematics',           section: 'primary',   category: 'core' },
  { id: 'sub-pr-sci',   name: 'Science',               section: 'primary',   category: 'core' },
  { id: 'sub-pr-soc',   name: 'Social Studies',        section: 'primary',   category: 'core' },
  { id: 'sub-pr-rme',   name: 'RME',                   section: 'primary',   category: 'core' },
  { id: 'sub-pr-fre',   name: 'French',                section: 'primary',   category: 'core' },
  { id: 'sub-pr-ict',   name: 'ICT',                   section: 'primary',   category: 'core' },
  { id: 'sub-pr-arts',  name: 'Creative Arts',         section: 'primary',   category: 'core' },
  // JHS — Core
  { id: 'sub-jhs-eng',  name: 'English Language',      section: 'jhs', category: 'core' },
  { id: 'sub-jhs-math', name: 'Mathematics',           section: 'jhs', category: 'core' },
  { id: 'sub-jhs-sci',  name: 'Integrated Science',    section: 'jhs', category: 'core' },
  { id: 'sub-jhs-soc',  name: 'Social Studies',        section: 'jhs', category: 'core' },
  { id: 'sub-jhs-rme',  name: 'RME',                   section: 'jhs', category: 'core' },
  { id: 'sub-jhs-fre',  name: 'French',                section: 'jhs', category: 'core' },
  { id: 'sub-jhs-ict',  name: 'ICT',                   section: 'jhs', category: 'core' },
  // JHS — Elective
  { id: 'sub-jhs-ct',   name: 'Career Technology',     section: 'jhs', category: 'elective' },
  { id: 'sub-jhs-arts', name: 'Creative Arts & Design',section: 'jhs', category: 'elective' },
  { id: 'sub-jhs-gha',  name: 'Ghanaian Language',     section: 'jhs', category: 'elective' },
]

export const PHOENIX_ACADEMIC_YEAR: AcademicYear = {
  id: 'ay-2025-2026',
  name: '2025/2026',
  start_date: '2025-09-09',
  end_date: '2026-07-31',
  is_current: true,
  terms: [
    { number: 1, start_date: '2025-09-09', end_date: '2025-12-19', is_current: false },
    { number: 2, start_date: '2026-01-13', end_date: '2026-04-03', is_current: true },
    { number: 3, start_date: '2026-04-28', end_date: '2026-07-31', is_current: false },
  ],
}

export const PHOENIX_DISCOUNT_POLICY: DiscountPolicy = {
  active: true,
  applies_to_fee_types: ['School Fees'],
  tiers: [
    { sibling_count: 1, percent: 0 },
    { sibling_count: 2, percent: 5 },
    { sibling_count: 3, percent: 8 },
    { sibling_count: 4, percent: 11 },
    { sibling_count: 5, percent: 14 },
  ],
}

export const MOCK_FAMILIES: Family[] = []

// Course Groups — separate from Class. A student can be in JHS 1 + Science group.
// Schools often use this for elective tracks or scholarship cohorts.
export const PHOENIX_COURSE_GROUPS: CourseGroup[] = [
  { id: 'cg-regular',   name: 'Regular',            code: 'REG',    description: 'Standard curriculum, no elective track', active: true,  created_at: '2026-01-01T00:00:00Z' },
  { id: 'cg-science',   name: 'Science Track',      code: 'SCI',    description: 'JHS students focused on STEM electives', active: true,  created_at: '2026-01-01T00:00:00Z' },
  { id: 'cg-arts',      name: 'Arts Track',         code: 'ART',    description: 'JHS students focused on Creative Arts + Design', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'cg-language',  name: 'Language Track',     code: 'LANG',   description: 'Extra French + Ghanaian Language hours', active: true,  created_at: '2026-01-01T00:00:00Z' },
  { id: 'cg-scholarship', name: 'Scholarship Cohort', code: 'SCHOLAR', description: 'Students on full or partial scholarship', active: true, created_at: '2026-01-01T00:00:00Z' },
]

export const MOCK_GUARDIANS: Guardian[] = []
export const MOCK_GUARDIAN_LINKS: GuardianLink[] = []

// ── Phase 6 seed: Fees Particulars (mirrors Adesua's Phoenix list) ──
const T0 = '2026-01-01T00:00:00Z'
export const PHOENIX_FEE_PARTICULARS: FeeParticular[] = [
  { id: 'fp-arrears',      name: 'ARREARS',              priority: 1,  frequency: 'per_term',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-school',       name: 'SCHOOL FEES',          priority: 2,  frequency: 'per_term',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-admission',    name: 'ADMISSION FEE',        priority: 3,  frequency: 'one_time',    finance_account: 'Fee', applies_to_categories: ['new'], active: true, created_at: T0 },
  { id: 'fp-bece-reg',     name: 'BECE REGISTRATION FEE',priority: 4,  frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-additional',   name: 'ADDITIONAL FEE',       priority: 5,  frequency: 'per_term',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-sms',          name: 'SMS FEE',              priority: 6,  frequency: 'per_session', finance_account: 'Fee', default_amount: 30, active: true, created_at: T0 },
  { id: 'fp-exams',        name: 'EXAMS FEE',            priority: 7,  frequency: 'per_term',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-id-card',      name: 'ID CARD',              priority: 8,  frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-graduation',   name: 'GRADUATION FEE',       priority: 9,  frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-grad-support', name: 'GRADUATION SUPPORT',   priority: 10, frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-uniforms',     name: 'UNIFORMS FEE',         priority: 11, frequency: 'one_time',    finance_account: 'Fee', applies_to_categories: ['new'], active: true, created_at: T0 },
  { id: 'fp-library',      name: 'LIBRARY FEE',          priority: 12, frequency: 'per_session', finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-camping',      name: 'CAMPING FEE BALANCE',  priority: 13, frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-feeding',      name: 'FEEDING FEE',          priority: 14, frequency: 'per_term',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-other',        name: 'OTHER FEES',           priority: 15, frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-seminars',     name: 'SEMINARS',             priority: 16, frequency: 'one_time',    finance_account: 'Fee', active: true, created_at: T0 },
  { id: 'fp-feeding-arr',  name: 'FEEDING FEE ARREARS',  priority: 17, frequency: 'per_term',    finance_account: 'Fee', active: true, created_at: T0 },
]

// Feeding fee buckets — mirrors Adesua's instant fee particulars by family size
export const PHOENIX_INSTANT_BUCKETS: InstantFeeBucket[] = [
  { id: 'ib-feed-full',   particular_id: 'fp-feeding', bucket_name: 'FULL FEEDING',   amount: 10, auto_deduct: true, created_at: T0 },
  { id: 'ib-feed-3rd',    particular_id: 'fp-feeding', bucket_name: 'THIRD CHILD',    amount: 5,  auto_deduct: true, created_at: T0 },
  { id: 'ib-feed-4th',    particular_id: 'fp-feeding', bucket_name: 'FOURTH CHILD',   amount: 0,  auto_deduct: true, created_at: T0 },
  { id: 'ib-feed-d1',     particular_id: 'fp-feeding', bucket_name: 'DISCOUNT 1',     amount: 4,  auto_deduct: true, created_at: T0 },
  { id: 'ib-feed-d2',     particular_id: 'fp-feeding', bucket_name: 'DISCOUNT 2',     amount: 5,  auto_deduct: true, created_at: T0 },
  { id: 'ib-feed-d3',     particular_id: 'fp-feeding', bucket_name: 'DISCOUNT 3',     amount: 6,  auto_deduct: true, created_at: T0 },
  { id: 'ib-feed-d4',     particular_id: 'fp-feeding', bucket_name: 'DISCOUNT 4',     amount: 7,  auto_deduct: true, created_at: T0 },
]

export const PHOENIX_STANDALONE_DISCOUNTS: StandaloneFeeDiscount[] = [
  { id: 'sd-school',  name: 'SCHOOL FEE DISCOUNT',  type: 'percent', value: 10, on_main_fees: true,  applies_to_fee_ids: ['fp-school'], active: true, created_at: T0 },
  { id: 'sd-rebate',  name: 'PARENTS REBATE',       type: 'percent', value: 5,  on_main_fees: true,  active: true, created_at: T0 },
  { id: 'sd-other',   name: 'SCHOOL/OTHER FEES',    type: 'amount',  value: 50, on_main_fees: false, active: true, created_at: T0 },
  { id: 'sd-covid',   name: 'COVID-19 RELIEF',      type: 'amount',  value: 30, on_main_fees: true,  active: false, notes: 'Suspended 2023', created_at: T0 },
]

// Billing setup mirrors Adesua's per-term per-class amounts from doc page 33-34
export const PHOENIX_FEE_BILLINGS: FeeBilling[] = [
  {
    id: 'fb-2025-26-t3',
    name: '2025-2026 THIRD TERM FEES',
    academic_year: '2025/2026',
    term: 3,
    is_published: false,
    created_at: T0,
    items: [
      { id: 'fbi-1', particular_id: 'fp-school',    amount: 500, class_ids: ['cls-jhs1', 'cls-jhs2'] },
      { id: 'fbi-2', particular_id: 'fp-school',    amount: 330, class_ids: ['cls-creche', 'cls-kg1', 'cls-kg2', 'cls-nur1', 'cls-nur2'] },
      { id: 'fbi-3', particular_id: 'fp-school',    amount: 400, class_ids: ['cls-p1', 'cls-p2', 'cls-p3'] },
      { id: 'fbi-4', particular_id: 'fp-school',    amount: 430, class_ids: ['cls-p4', 'cls-p5', 'cls-p6'] },
      { id: 'fbi-5', particular_id: 'fp-school',    amount: 700, class_ids: ['cls-jhs3'] },
      { id: 'fbi-6', particular_id: 'fp-admission', amount: 200, class_ids: ['cls-p1', 'cls-p2', 'cls-p3', 'cls-p4', 'cls-p5', 'cls-p6', 'cls-creche', 'cls-kg1', 'cls-kg2', 'cls-nur1', 'cls-nur2'], categories: ['new'] },
      { id: 'fbi-7', particular_id: 'fp-admission', amount: 350, class_ids: ['cls-jhs1', 'cls-jhs2'], categories: ['new'] },
      { id: 'fbi-8', particular_id: 'fp-additional', amount: 200, class_ids: ['cls-jhs1', 'cls-jhs2'], categories: ['new'] },
      { id: 'fbi-9', particular_id: 'fp-uniforms',  amount: 500, class_ids: [], categories: ['new'] },
    ],
  },
]



// Seed templates — Preschool admission as starter (the principal's example use case).
// Admin can edit / add more per class.
export const PHOENIX_ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  {
    id: 'tmpl-creche-admission',
    class_id: 'cls-creche',
    name: 'Crèche Admission Readiness',
    scope: 'admission',
    scale: 'abcd',
    description: 'Baseline readiness check for children joining Crèche. Score each marker A (excellent) → D (needs support).',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    markers: [
      { id: 'mk-creche-1', name: 'Responds to name', description: 'Looks up or turns when called', order: 1 },
      { id: 'mk-creche-2', name: 'Separates from parent', description: 'Calms within 10 minutes of drop-off', order: 2 },
      { id: 'mk-creche-3', name: 'Plays alongside peers', description: 'Engages in parallel play', order: 3 },
      { id: 'mk-creche-4', name: 'Communicates basic needs', description: 'Indicates hungry, sleepy, toilet', order: 4 },
      { id: 'mk-creche-5', name: 'Eats independently', description: 'Can feed themselves with hands or spoon', order: 5 },
    ],
  },
  {
    id: 'tmpl-kg1-admission',
    class_id: 'cls-kg1',
    name: 'KG 1 Admission Readiness',
    scope: 'admission',
    scale: 'abcd',
    description: 'Pre-literacy and pre-numeracy markers for entry to KG 1.',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    markers: [
      { id: 'mk-kg1-1', name: 'Can child read simple words', description: 'Recognizes "cat", "mat", "sun", etc.', order: 1 },
      { id: 'mk-kg1-2', name: 'Can child recognize numbers', description: 'Identifies numerals 1–10', order: 2 },
      { id: 'mk-kg1-3', name: 'Recognizes letters', description: 'Identifies upper- and lower-case letters', order: 3 },
      { id: 'mk-kg1-4', name: 'Holds pencil correctly', description: 'Tripod or quadrupod grasp', order: 4 },
      { id: 'mk-kg1-5', name: 'Follows two-step instructions', description: 'e.g. "Pick up the book and bring it to me"', order: 5 },
      { id: 'mk-kg1-6', name: 'Recognizes basic colors', description: 'Red, blue, yellow, green', order: 6 },
      { id: 'mk-kg1-7', name: 'Recognizes basic shapes', description: 'Circle, square, triangle', order: 7 },
    ],
  },
]

// ── Phase 7 seed: Grading Groups (4 rubrics from doc) ──
export const PHOENIX_GRADING_GROUPS: GradingGroup[] = [
  {
    id: 'gg-basic-school',
    name: 'Basic School',
    scale: 'letter6_basic_school',
    applies_to_levels: ['primary'],
    active: true,
    created_at: T0,
    levels: [
      { id: 'gl-bs-a', grade_name: 'A', min_score: 80, aggregate_value: 1, short_remark: 'Excellent',     description: 'Achieved Basic Competence exceptionally well.' },
      { id: 'gl-bs-b', grade_name: 'B', min_score: 70, aggregate_value: 2, short_remark: 'Very Good',     description: 'Achieved Basic Competence very well; highly proficient in most areas of competency.' },
      { id: 'gl-bs-c', grade_name: 'C', min_score: 60, aggregate_value: 3, short_remark: 'Good',          description: 'Achieved Basic Competence satisfactorily.' },
      { id: 'gl-bs-d', grade_name: 'D', min_score: 50, aggregate_value: 4, short_remark: 'Below Average', description: 'Achieved minimum Basic Competence — may sometimes need help.' },
      { id: 'gl-bs-e', grade_name: 'E', min_score: 40, aggregate_value: 5, short_remark: 'Weak',          description: 'Not achieved majority of the Basic Competencies.' },
      { id: 'gl-bs-f', grade_name: 'F', min_score: 0,  aggregate_value: 6, short_remark: 'Fail',          description: 'Does not meet grade level expectation.' },
    ],
  },
  {
    id: 'gg-jhs3',
    name: 'JHS 3 Grading',
    scale: 'percent',
    applies_to_levels: ['jhs'],
    active: true,
    created_at: T0,
    levels: [
      { id: 'gl-jhs-1', grade_name: '1', min_score: 80, aggregate_value: 1, short_remark: 'Highest',      description: 'Strong excellent performance.' },
      { id: 'gl-jhs-2', grade_name: '2', min_score: 70, aggregate_value: 2, short_remark: 'Higher',       description: 'Strong performance.' },
      { id: 'gl-jhs-3', grade_name: '3', min_score: 65, aggregate_value: 3, short_remark: 'High',         description: 'Appropriate development.' },
      { id: 'gl-jhs-4', grade_name: '4', min_score: 60, aggregate_value: 4, short_remark: 'High Average', description: 'Slow development.' },
      { id: 'gl-jhs-5', grade_name: '5', min_score: 55, aggregate_value: 5, short_remark: 'Average',      description: 'Beginning knowledge.' },
      { id: 'gl-jhs-6', grade_name: '6', min_score: 50, aggregate_value: 6, short_remark: 'Low Average',  description: 'Weak understanding.' },
      { id: 'gl-jhs-7', grade_name: '7', min_score: 45, aggregate_value: 7, short_remark: 'Low',          description: 'Weak knowledge.' },
      { id: 'gl-jhs-8', grade_name: '8', min_score: 40, aggregate_value: 8, short_remark: 'Lower',        description: 'Weak knowledge.' },
      { id: 'gl-jhs-9', grade_name: '9', min_score: 0,  aggregate_value: 9, short_remark: 'Lowest',       description: 'Does not meet grade level expectation.' },
    ],
  },
  {
    id: 'gg-preschool',
    name: 'Pre-School',
    scale: 'narrative_preschool',
    applies_to_levels: ['creche', 'nursery'],
    active: true,
    created_at: T0,
    levels: [
      { id: 'gl-ps-a', grade_name: 'A', short_remark: 'Excellent',     description: 'Outstanding in all areas of competency.' },
      { id: 'gl-ps-b', grade_name: 'B', short_remark: 'Very Good',     description: 'Highly proficient in most areas.' },
      { id: 'gl-ps-c', grade_name: 'C', short_remark: 'Good',          description: 'Mastered the competencies satisfactorily.' },
      { id: 'gl-ps-d', grade_name: 'D', short_remark: 'Below Average', description: 'Achieved minimum competencies — may sometimes need help.' },
    ],
  },
  {
    id: 'gg-kg',
    name: 'Kindergarten',
    scale: 'kg_frequency',
    applies_to_levels: ['kg'],
    active: true,
    created_at: T0,
    levels: [
      { id: 'gl-kg-mo', grade_name: 'MO', short_remark: 'Most Often',       description: 'Consistently demonstrates the competency.' },
      { id: 'gl-kg-o',  grade_name: 'O',  short_remark: 'Often',            description: 'Often demonstrates the competency.' },
      { id: 'gl-kg-s',  grade_name: 'S',  short_remark: 'Sometimes',        description: 'Sometimes demonstrates the competency.' },
      { id: 'gl-kg-n',  grade_name: 'N',  short_remark: 'Needs Assistance', description: 'Needs assistance to demonstrate.' },
      { id: 'gl-kg-na', grade_name: 'NA', short_remark: 'Not at all',       description: 'Does not yet demonstrate the competency.' },
    ],
  },
]

export const PHOENIX_REMARK_BANKS: RemarkBank[] = [
  {
    id: 'rb-headmaster',
    kind: 'headmaster',
    group_name: "Headmaster's Remarks",
    created_at: T0,
    remarks: [
      { id: 'r-hm-1',  text: 'Attention must be given to the core subjects.',   min_score: 0,  max_score: 40, order: 1 },
      { id: 'r-hm-2',  text: 'Not too good a performance. Buck up.',            min_score: 40, max_score: 50, order: 2 },
      { id: 'r-hm-3',  text: 'Can do better still.',                            min_score: 50, max_score: 60, order: 3 },
      { id: 'r-hm-4',  text: 'A good effort. Work harder still.',               min_score: 60, max_score: 70, order: 4 },
      { id: 'r-hm-5',  text: 'Much would be expected of her next term.',        min_score: 70, max_score: 80, order: 5 },
      { id: 'r-hm-6',  text: 'Much would be expected of him next term.',        min_score: 70, max_score: 80, order: 6 },
      { id: 'r-hm-7',  text: 'An encouraging performance. Keep it up.',         min_score: 75, max_score: 85, order: 7 },
      { id: 'r-hm-8',  text: 'Needs to put in more efforts.',                   min_score: 0,  max_score: 50, order: 8 },
      { id: 'r-hm-9',  text: 'Excellent performance. Keep it up!',              min_score: 85, max_score: 100, order: 9 },
      { id: 'r-hm-10', text: 'A great improvement. Well done!',                                              order: 10 },
    ],
  },
  {
    id: 'rb-class-teacher',
    kind: 'class_teacher',
    group_name: "Class Teacher's Remarks",
    created_at: T0,
    remarks: [
      { id: 'r-ct-1', text: 'Hardworking and attentive in class.',                order: 1 },
      { id: 'r-ct-2', text: 'Shows promise — needs to apply herself more.',       order: 2 },
      { id: 'r-ct-3', text: 'Shows promise — needs to apply himself more.',       order: 3 },
      { id: 'r-ct-4', text: 'Polite and well-behaved. A pleasure to teach.',      order: 4 },
      { id: 'r-ct-5', text: 'Needs to participate more in class discussions.',    order: 5 },
      { id: 'r-ct-6', text: 'Consistent performance across all subjects.',        order: 6 },
    ],
  },
  {
    id: 'rb-interest',
    kind: 'interest',
    group_name: 'Interests',
    created_at: T0,
    remarks: [
      { id: 'r-int-1',  text: 'Athletics',           order: 1 },
      { id: 'r-int-2',  text: 'Basketball',          order: 2 },
      { id: 'r-int-3',  text: 'Drawing and colouring', order: 3 },
      { id: 'r-int-4',  text: 'Drumming',            order: 4 },
      { id: 'r-int-5',  text: 'Football',            order: 5 },
      { id: 'r-int-6',  text: 'Listening to stories', order: 6 },
      { id: 'r-int-7',  text: 'Music and dancing',   order: 7 },
      { id: 'r-int-8',  text: 'Playing with puzzles', order: 8 },
      { id: 'r-int-9',  text: 'Reading',             order: 9 },
      { id: 'r-int-10', text: 'Writing',             order: 10 },
      { id: 'r-int-11', text: 'Singing',             order: 11 },
      { id: 'r-int-12', text: 'Swimming',            order: 12 },
    ],
  },
  {
    id: 'rb-conduct',
    kind: 'conduct',
    group_name: 'Conduct',
    created_at: T0,
    remarks: [
      { id: 'r-con-1', text: 'Excellent',          order: 1 },
      { id: 'r-con-2', text: 'Very Good',          order: 2 },
      { id: 'r-con-3', text: 'Good',               order: 3 },
      { id: 'r-con-4', text: 'Fair',               order: 4 },
      { id: 'r-con-5', text: 'Needs Improvement',  order: 5 },
    ],
  },
]

export const PHOENIX_ACADEMIC_ASSESSMENTS: AcademicAssessment[] = [
  { id: 'aa-term1',  name: '1ST TERM BASIC SCHOOL EXAMINATION', code: 'TERM1', max_marks: 100, type: 'marks_with_grades', report_type: 'combined', grading_group_id: 'gg-basic-school', applies_to_levels: ['primary', 'kg', 'nursery'], weight: 70, active: true, created_at: T0 },
  { id: 'aa-term2',  name: '2ND TERM BASIC SCHOOL EXAMINATION', code: 'TM2E',  max_marks: 100, type: 'marks_with_grades', report_type: 'combined', grading_group_id: 'gg-basic-school', applies_to_levels: ['primary', 'kg', 'nursery'], weight: 70, active: true, created_at: T0 },
  { id: 'aa-term3',  name: '3RD TERM BASIC SCHOOL EXAMINATION', code: 'TM3',   max_marks: 100, type: 'marks_with_grades', report_type: 'combined', grading_group_id: 'gg-basic-school', applies_to_levels: ['primary', 'kg', 'nursery'], weight: 70, active: true, created_at: T0 },
  { id: 'aa-cat1',   name: 'CONTINUOUS ASSESSMENT 1',           code: 'CAT1',  max_marks: 10,  type: 'marks_only',        report_type: 'single',   weight: 10, active: true, created_at: T0 },
  { id: 'aa-cat2',   name: 'CONTINUOUS ASSESSMENT 2',           code: 'CAT2',  max_marks: 20,  type: 'marks_only',        report_type: 'single',   weight: 10, active: true, created_at: T0 },
  { id: 'aa-cat3',   name: 'CONTINUOUS ASSESSMENT 3',           code: 'CAT3',  max_marks: 20,  type: 'marks_only',        report_type: 'single',   weight: 10, active: true, created_at: T0 },
  { id: 'aa-cat4',   name: 'CONTINUOUS ASSESSMENT 4',           code: 'CAT4',  max_marks: 10,  type: 'marks_only',        report_type: 'single',   weight: 10, active: true, created_at: T0 },
  { id: 'aa-cat5',   name: 'CONTINUOUS ASSESSMENT 5',           code: 'CAT5',  max_marks: 20,  type: 'marks_only',        report_type: 'single',   weight: 10, active: true, created_at: T0 },
  { id: 'aa-cat6',   name: 'CONTINUOUS ASSESSMENT 6',           code: 'CAT6',  max_marks: 20,  type: 'marks_only',        report_type: 'single',   weight: 10, active: true, created_at: T0 },
]

export const PHOENIX_SIGNATORIES: ReportSignatory[] = [
  { id: 'sig-headmaster',    role_label: 'Headmaster / Principal', full_name: '', active: true, order: 1 },
  { id: 'sig-class-teacher', role_label: 'Class Teacher',          full_name: '', active: true, order: 2 },
  { id: 'sig-examiner',      role_label: 'Examinations Officer',   full_name: '', active: true, order: 3 },
]

export const MOCK_STUDENT_INTERESTS: StudentInterest[] = []

// ── Phase 9 seed: HR (mirrors Adesua doc) ──
export const PHOENIX_EMPLOYEE_CATEGORIES: EmployeeCategory[] = [
  { id: 'ec-permanent',  name: 'Permanent',     code: 'Pm',    created_at: T0 },
  { id: 'ec-contract',   name: 'Contract',      code: 'CT',    created_at: T0 },
  { id: 'ec-system-admin', name: 'System Admin', code: 'Admin', created_at: T0 },
]

export const PHOENIX_EMPLOYEE_DEPARTMENTS: EmployeeDepartment[] = [
  { id: 'ed-admin',      name: 'Administration',     code: 'AD',    created_at: T0 },
  { id: 'ed-finance',    name: 'Finance',            code: 'FC',    created_at: T0 },
  { id: 'ed-non-teach',  name: 'Non-Teaching Staff', code: 'NTS',   created_at: T0 },
  { id: 'ed-sys-admin',  name: 'System Admin',       code: 'Admin', created_at: T0 },
  { id: 'ed-teaching',   name: 'Teaching Staff',     code: 'TS',    created_at: T0 },
]

export const PHOENIX_EMPLOYEE_POSITIONS: EmployeePosition[] = [
  { id: 'ep-administrator',          name: 'Administrator',           created_at: T0 },
  { id: 'ep-assistant-administrator', name: 'Assistant Administrator', created_at: T0 },
  { id: 'ep-attendant',              name: 'Attendant',               created_at: T0 },
  { id: 'ep-ceo',                    name: 'CEO',                     created_at: T0 },
  { id: 'ep-cook',                   name: 'Cook',                    created_at: T0 },
  { id: 'ep-financial-secretary',    name: 'Financial Secretary',     created_at: T0 },
  { id: 'ep-matron',                 name: 'Matron',                  created_at: T0 },
  { id: 'ep-system-admin',           name: 'System Admin',            created_at: T0 },
  { id: 'ep-teacher',                name: 'Teacher',                 created_at: T0 },
  { id: 'ep-driver',                 name: 'Driver',                  created_at: T0 },
  { id: 'ep-security',               name: 'Security',                created_at: T0 },
]

export const MOCK_EMPLOYEES: Employee[] = []

// Permission templates for one-click role setup
export const PERMISSION_TEMPLATES: Record<string, { label: string; emoji: string; permissions: PermissionKey[] }> = {
  principal: {
    label: 'Principal / Headmaster',
    emoji: '👔',
    permissions: [
      'general_school_settings', 'admit_students', 'manage_students',
      'manage_hr_setup', 'manage_employees', 'manage_employee_roles',
      'manage_messaging', 'manage_enquiries',
      'finance_control', 'manage_fees', 'manage_payroll',
      'authorize_fee_discount', 'approve_fee_discount',
      'create_expense', 'approve_expense', 'pay_expense',
      'approve_payroll', 'authorize_payroll',
      'manage_online_learning',
      'fees_reports', 'finance_reports',
      'take_attendance', 'view_attendance_reports',
      'receive_finance_notice',
    ],
  },
  admin: {
    label: 'Administrator',
    emoji: '🏛️',
    permissions: [
      'admit_students', 'manage_students',
      'manage_employees',
      'manage_messaging', 'manage_enquiries',
      'manage_fees',
      'manage_online_learning',
      'fees_reports',
      'take_attendance', 'view_attendance_reports',
    ],
  },
  finance_officer: {
    label: 'Financial Secretary',
    emoji: '💰',
    permissions: [
      'finance_control', 'manage_fees', 'fees_cashier',
      'create_expense', 'approve_expense',
      'manage_payroll',
      'receive_finance_notice',
      'fees_reports', 'finance_reports',
    ],
  },
  teacher: {
    label: 'Teacher',
    emoji: '👩‍🏫',
    permissions: [
      'teacher',
      'take_attendance',
      'manage_online_learning',
    ],
  },
  cashier: {
    label: 'Fees Cashier',
    emoji: '🧾',
    permissions: [
      'fees_cashier',
      'fees_reports',
    ],
  },
  cook: {
    label: 'Cook / Canteen',
    emoji: '🍳',
    permissions: [
      'canteen_cashier',
    ],
  },
  store_manager: {
    label: 'Store Manager',
    emoji: '📦',
    permissions: [
      'store_cashier', 'store_manager',
    ],
  },
  transport: {
    label: 'Transport Manager',
    emoji: '🚌',
    permissions: [
      'transport_manager',
    ],
  },
}

// Display labels for every permission (used in the permission matrix UI)
export const PERMISSION_LABELS: Record<PermissionKey, { label: string; group: string; emoji: string }> = {
  general_school_settings: { label: 'General School Settings',   group: 'School',     emoji: '⚙️' },
  admit_students:          { label: 'Admit Students',            group: 'Students',   emoji: '🎒' },
  manage_students:         { label: 'Manage Students',           group: 'Students',   emoji: '📚' },
  teacher:                 { label: 'Teacher',                   group: 'Academics',  emoji: '👩‍🏫' },
  manage_hr_setup:         { label: 'Manage HR Setup',           group: 'HR',         emoji: '🧰' },
  manage_employees:        { label: 'Manage Employees',          group: 'HR',         emoji: '🧑‍💼' },
  manage_employee_roles:   { label: 'Manage Employee Roles',     group: 'HR',         emoji: '🔑' },
  manage_messaging:        { label: 'Manage Messaging',          group: 'Communications', emoji: '📢' },
  manage_enquiries:        { label: 'Manage Enquiries',          group: 'Communications', emoji: '📥' },
  finance_control:         { label: 'Finance Control',           group: 'Finance',    emoji: '🏦' },
  manage_fees:             { label: 'Manage Fees',               group: 'Finance',    emoji: '💳' },
  fees_cashier:            { label: 'Fees Cashier',              group: 'Finance',    emoji: '🧾' },
  delete_fee_transaction:  { label: 'Delete Fee Transaction',    group: 'Finance',    emoji: '🗑️' },
  manage_payroll:          { label: 'Manage Payroll',            group: 'Finance',    emoji: '💼' },
  receive_finance_notice:  { label: 'Receive Finance Notice',    group: 'Finance',    emoji: '🔔' },
  authorize_fee_discount:  { label: 'Authorize Fee Discount',    group: 'Finance',    emoji: '✅' },
  approve_fee_discount:    { label: 'Approve Fee Discount',      group: 'Finance',    emoji: '🆗' },
  create_expense:          { label: 'Create Expense',            group: 'Finance',    emoji: '➕' },
  approve_expense:         { label: 'Approve Expense',           group: 'Finance',    emoji: '☑️' },
  pay_expense:             { label: 'Pay Expense',               group: 'Finance',    emoji: '💸' },
  approve_payroll:         { label: 'Approve Payroll',           group: 'Finance',    emoji: '✔️' },
  authorize_payroll:       { label: 'Authorize Payroll',         group: 'Finance',    emoji: '🔏' },
  manage_online_learning:  { label: 'Manage Online Learning',    group: 'Academics',  emoji: '💻' },
  fees_reports:            { label: 'Fees Reports',              group: 'Reports',    emoji: '📊' },
  finance_reports:         { label: 'Finance Reports',           group: 'Reports',    emoji: '📈' },
  take_attendance:         { label: 'Take Attendance',           group: 'Attendance', emoji: '📡' },
  view_attendance_reports: { label: 'View Attendance Reports',   group: 'Attendance', emoji: '📋' },
  canteen_cashier:         { label: 'Canteen Cashier',           group: 'Operations', emoji: '🍱' },
  eacademic_control:       { label: 'EAcademic Control',         group: 'Academics',  emoji: '🎓' },
  store_cashier:           { label: 'Store Cashier',             group: 'Operations', emoji: '🏪' },
  store_manager:           { label: 'Store Manager',             group: 'Operations', emoji: '📦' },
  transport_manager:       { label: 'Transport Manager',         group: 'Operations', emoji: '🚌' },
}

// ── Phase 10 seed: Finance bookkeeping (mirrors Adesua doc) ──
export const PHOENIX_ACCOUNT_GROUPS: AccountGroup[] = [
  { id: 'ag-canteen-exp', name: 'Canteen Expense',    code: 'CS',  flow: 'expense', created_at: T0 },
  { id: 'ag-canteen-sale', name: 'Canteen Sale',       code: 'CE',  flow: 'income',  created_at: T0 },
  { id: 'ag-director-upk', name: "Director's Upkeep",  code: 'DU',  flow: 'expense', created_at: T0 },
  { id: 'ag-fees',         name: 'Fees',               code: 'SF',  flow: 'income',  created_at: T0 },
  { id: 'ag-general-exp',  name: 'General Expense',    code: 'GE1', flow: 'expense', created_at: T0 },
  { id: 'ag-govt-exp',     name: 'Government Expenses', code: 'GE', flow: 'expense', created_at: T0 },
  { id: 'ag-maintenance',  name: 'Maintenance',        code: 'MT',  flow: 'expense', created_at: T0 },
  { id: 'ag-miscellaneous', name: 'Miscellaneous',     code: 'MS',  flow: 'expense', created_at: T0 },
  { id: 'ag-salaries',     name: 'Salaries & Payroll', code: 'SAL', flow: 'expense', created_at: T0 },
  { id: 'ag-utilities',    name: 'Utilities',          code: 'UT',  flow: 'expense', created_at: T0 },
  { id: 'ag-transport',    name: 'Transport',          code: 'TR',  flow: 'expense', created_at: T0 },
]

export const PHOENIX_CHART_ACCOUNTS: ChartAccount[] = [
  { id: 'ca-ades-pay',    name: 'Adesua360 Payments',         code: 'ADSLTL001', flow: 'expense', group_id: 'ag-general-exp', active: true, created_at: T0 },
  { id: 'ca-app-reg',     name: 'Applicant Registration',     flow: 'income',  group_id: 'ag-fees',         active: true, created_at: T0 },
  { id: 'ca-bus-fuel',    name: 'Bus Fuel',                   code: 'BF',  flow: 'expense', group_id: 'ag-utilities',    active: true, created_at: T0 },
  { id: 'ca-canteen-exp', name: 'Canteen Expense',            code: 'CE',  flow: 'expense', group_id: 'ag-canteen-exp',  active: true, created_at: T0 },
  { id: 'ca-canteen-sale', name: 'Canteen Sale',               code: 'CS',  flow: 'income',  group_id: 'ag-canteen-sale', active: true, created_at: T0 },
  { id: 'ca-car-insur',   name: 'Car Insurance',              code: 'CA',  flow: 'expense', group_id: 'ag-transport',    active: true, created_at: T0 },
  { id: 'ca-carpentry',   name: 'Carpentry Materials and Labour', code: 'CW', flow: 'expense', group_id: 'ag-maintenance', active: true, created_at: T0 },
  { id: 'ca-school-fees', name: 'School Fees',                code: 'SF',  flow: 'income',  group_id: 'ag-fees',         active: true, created_at: T0 },
  { id: 'ca-electricity', name: 'Electricity Bill',           code: 'EB',  flow: 'expense', group_id: 'ag-utilities',    active: true, created_at: T0 },
  { id: 'ca-water',       name: 'Water Bill',                 code: 'WB',  flow: 'expense', group_id: 'ag-utilities',    active: true, created_at: T0 },
  { id: 'ca-internet',    name: 'Internet',                   code: 'INT', flow: 'expense', group_id: 'ag-utilities',    active: true, created_at: T0 },
  { id: 'ca-salaries',    name: 'Teacher Salaries',           code: 'TS',  flow: 'expense', group_id: 'ag-salaries',     active: true, created_at: T0 },
  { id: 'ca-stationery',  name: 'Stationery',                 code: 'STA', flow: 'expense', group_id: 'ag-general-exp',  active: true, created_at: T0 },
  { id: 'ca-cleaning',    name: 'Cleaning Supplies',          code: 'CL',  flow: 'expense', group_id: 'ag-maintenance',  active: true, created_at: T0 },
  { id: 'ca-paystack',    name: 'Paystack Receipts',          code: 'PS',  flow: 'income',  group_id: 'ag-fees',         active: true, created_at: T0 },
]

export const PHOENIX_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba-gcb',
    bank_name: 'GCB Bank Ghana',
    sort_code: '001',
    is_school_bank: true,
    account_number: '',
    account_name: 'Phoenix International School',
    branches: [
      { id: 'br-gcb-accra-central', bank_id: 'ba-gcb', name: 'Accra Central', branch_code: '0011' },
      { id: 'br-gcb-east-legon',    bank_id: 'ba-gcb', name: 'East Legon',    branch_code: '0021' },
    ],
    created_at: T0,
  },
  {
    id: 'ba-fbn',
    bank_name: 'FBN BANK',
    sort_code: '002',
    is_school_bank: false,
    branches: [],
    created_at: T0,
  },
]

export const MOCK_FINANCE_TRANSACTIONS: FinanceTransaction[] = []

// ── Phase 12 seed: Canteen ──
export const PHOENIX_CANTEEN_MEALS: CanteenMeal[] = [
  { id: 'cm-jollof',       name: 'Jollof Rice',                 type: 'lunch',     price: 8,  active: true, created_at: T0 },
  { id: 'cm-banku',        name: 'Banku & Tilapia',             type: 'lunch',     price: 12, active: true, created_at: T0 },
  { id: 'cm-fufu',         name: 'Fufu & Groundnut Soup',       type: 'lunch',     price: 10, active: true, created_at: T0 },
  { id: 'cm-omelette',     name: 'Omelette & Bread',            type: 'breakfast', price: 5,  active: true, created_at: T0 },
  { id: 'cm-porridge',     name: 'Hausa Koko & Koose',          type: 'breakfast', price: 4,  active: true, created_at: T0 },
  { id: 'cm-fruits',       name: 'Fruit Cup',                   type: 'snacks',    price: 3,  active: true, created_at: T0 },
  { id: 'cm-meatpie',      name: 'Meat Pie',                    type: 'snacks',    price: 3,  active: true, created_at: T0 },
  { id: 'cm-water',        name: 'Bottled Water',               type: 'snacks',    price: 1,  active: true, created_at: T0 },
  { id: 'cm-brunch',       name: 'Indomie & Egg',               type: 'brunch',    price: 6,  active: true, created_at: T0 },
  { id: 'cm-supper',       name: 'Rice & Stew',                 type: 'supper',    price: 7,  active: true, created_at: T0 },
]

export const PHOENIX_CANTEEN_FEE_PARTICULARS: CanteenFeeParticular[] = [
  { id: 'cfp-feeding',         name: 'FEEDING FEE',                default_amount: 10, active: true, created_at: T0 },
  { id: 'cfp-family-three',    name: 'FEEDING FEE - FAMILY OF THREE', default_amount: 5,  active: true, created_at: T0 },
  { id: 'cfp-family-four',     name: 'FEEDING FEE - FAMILIY OF FOUR', default_amount: 0,  active: true, created_at: T0 },
  { id: 'cfp-discount',        name: 'FEEDING FEE - DISCOUNT',     default_amount: 4,  active: true, created_at: T0 },
]

export const MOCK_CANTEEN_MENU_DAYS: CanteenMenuDay[] = []

// ── Phase 13 seed: messaging templates ──
export const PHOENIX_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'mt-welcome',
    name: 'Welcome new admission',
    trigger: 'admission',
    channels: ['sms', 'email'],
    subject: 'Welcome to {{school_name}}',
    body: 'Hi {{first_name}}, welcome to {{school_name}}! Your ERP login is: username {{username}}, initial password {{password}}. Sign in at {{erp_portal_url}}.',
    is_active: true,
    created_at: T0,
  },
  {
    id: 'mt-payment',
    name: 'Payment confirmed',
    trigger: 'payment_confirmed',
    channels: ['sms'],
    body: 'Thank you {{first_name}} for your payment of GHS {{amount}} to {{school_name}}. Receipt #{{receipt_number}}.',
    is_active: true,
    created_at: T0,
  },
  {
    id: 'mt-absent',
    name: 'Absent today',
    trigger: 'absent_today',
    channels: ['sms', 'whatsapp'],
    body: '{{school_name}}: {{full_name}} was marked ABSENT today ({{date}}). Please respond if this was unexpected.',
    is_active: true,
    created_at: T0,
  },
  {
    id: 'mt-fees-due',
    name: 'Fees due reminder',
    trigger: 'fees_due',
    channels: ['sms', 'email'],
    subject: 'Fee balance reminder',
    body: 'Hi {{first_name}}, this is a reminder that {{full_name}} has an outstanding fee balance of GHS {{balance}}. Please settle by {{due_date}}.',
    is_active: true,
    created_at: T0,
  },
  {
    id: 'mt-birthday',
    name: 'Birthday greeting',
    trigger: 'birthday',
    channels: ['sms'],
    body: '🎂 Happy Birthday {{first_name}}! Wishing you a wonderful year ahead — from everyone at {{school_name}}.',
    is_active: true,
    created_at: T0,
  },
  {
    id: 'mt-low-credit',
    name: 'Principal low-credit alert',
    trigger: 'low_credit',
    channels: ['email', 'sms'],
    subject: '⚠️ Low SMS credit',
    body: '{{school_name}} SMS balance is now GHS {{balance}}, below the threshold of GHS {{threshold}}. Top up at unity.hubtel.com to avoid delivery interruptions.',
    is_active: true,
    created_at: T0,
  },
]

export const MOCK_MESSAGE_LOGS: MessageLog[] = []

// ── Phase 14 seed ──
export const PHOENIX_SMART_REPORT_TARGETS = [
  { table: 'students',           label: '🎒 Students',           fields: ['student_id', 'full_name', 'class_name', 'level', 'category', 'fee_status', 'parent_phone', 'mobile_no', 'email', 'dob', 'gender', 'blood_group'] },
  { table: 'employees',          label: '🧑‍💼 Employees',         fields: ['employee_id', 'full_name', 'department_id', 'position_id', 'category_id', 'status', 'phone', 'email', 'date_of_employment'] },
  { table: 'families',           label: '👨‍👩‍👧 Families',          fields: ['family_name', 'primary_email', 'primary_phone', 'secondary_email', 'secondary_phone', 'wallet_balance', 'discount_override_percent'] },
  { table: 'fees',               label: '💳 Fees',                fields: ['student_name', 'class_name', 'fee_type', 'term', 'academic_year', 'amount', 'paid_amount', 'status', 'due_date'] },
  { table: 'payments',           label: '🧾 Payments',            fields: ['student_name', 'class_name', 'amount', 'method', 'reference', 'receipt_number', 'paid_at'] },
  { table: 'attendance',         label: '📡 Attendance',          fields: ['student_name', 'class_name', 'date', 'status', 'context', 'parent_notified'] },
  { table: 'guardians',          label: '🧑‍🤝‍🧑 Guardians',         fields: ['full_name', 'relationship', 'phone', 'email', 'is_emergency_contact', 'can_pick_up_students'] },
  { table: 'finance_transactions', label: '🏦 Finance Transactions', fields: ['date', 'kind', 'description', 'paying_to', 'amount', 'payment_mode', 'status'] },
  { table: 'message_logs',       label: '📨 Message Logs',        fields: ['sent_at', 'channel', 'audience_description', 'recipient_count', 'status'] },
  { table: 'enquiries',          label: '📥 Enquiries',           fields: ['child_name', 'intended_class', 'parent_name', 'parent_phone', 'source', 'status', 'created_at'] },
]

export const MOCK_ENQUIRIES: Enquiry[] = []
export const MOCK_DATA_UPLOADS: DataUpload[] = []
export const MOCK_SMART_REPORTS: SmartReport[] = []


