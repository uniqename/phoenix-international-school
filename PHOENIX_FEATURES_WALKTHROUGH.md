# Phoenix International School — App Features Walkthrough

**Version shipped:** v2.0.0 · build 10 (Android AAB + iOS IPA)
**Last updated:** 2026‑05‑18
**Audience:** Principal, Administrator, Financial Secretary, Teachers, Parents
**Purpose:** Live training / walkthrough script. Each section is a topic; bullets are talk‑through items. Star (★) = signature feature worth dwelling on.

---

## 0. Sign‑in & roles

- One login for everyone; the app routes you to the right home screen based on your role.
- **Roles supported (8):** Principal, Administrator, Financial Secretary, Teacher, Cashier, Cook / Canteen, Store Manager, Transport.
- **Fine‑grained permissions (30+):** every module can be turned on/off per role from *Admin → Accounts*.
- Dual‑parent login: both mum and dad can have their own credentials tied to the same family, with independent permissions (e.g., one parent receives finance emails, the other doesn't).
- Invite flow: admin sends a tokenised invite link to a parent or staff member; they click it and set their own password — no shared accounts.
- Offline‑aware: the app shows a clear "you're offline" screen when there's no internet, and queues changes where supported.

---

## 1. Admissions & Enrolment

### 1.1 Enquiries pipeline ★
*Admin → Enquiries*
- Walk‑in / phone / website enquiries logged with parent name, child name, target class, source (referral, social media, etc.).
- Status pipeline: **New → Tour booked → Tested → Accepted → Enrolled / Lost**.
- Convert an enquiry into a full student record in one click — admission number auto‑generated (`PIS###`).

### 1.2 Student record
*Admin → Students*
- Full demographic profile: name, DOB, gender, blood group, NHIS, GPS address, nationality, photo, previous school.
- Linked to a **family** (so siblings share fee structure & discount).
- Linked to one or more **guardians** (mother, father, grandparent, driver, nanny, etc.) with pick‑up authority per guardian.
- Communication preferences: per‑student SMS / email opt‑in flags (used for Phase 15b absence alerts).

### 1.3 Families & guardians
*Admin → Families · Admin → Guardians*
- A family is a billing unit (one fee account, one wallet, automatic sibling discount).
- A guardian is a person attached to one or more students (with `is_emergency_contact` and `can_pick_up_students` flags).
- Family wallet balance + invite link to bring secondary parents on board.

### 1.4 Data import
*Admin → Data Import · Admin → Data Uploads*
- Bulk‑upload students, guardians, fee particulars from CSV.
- Audit log of every upload (who, when, row count, errors).

---

## 2. Academic structure

### 2.1 Classes & subjects
*Admin → Classes & Subjects*
- Levels: Crèche, Nursery, KG, Primary, JHS — each with its own class roster.
- Subject catalogue per class (Maths, English, Integrated Science, Social Studies, ICT, …).
- Course groups for streams / electives.

### 2.2 Academic calendar
*Admin → Academic Calendar*
- Define academic year, terms, half‑terms, public holidays, special days.
- The current academic year flows everywhere (grading, fee billing, reports).

### 2.3 Timetable
*Admin → Timetable*
- Period‑by‑period weekly grid per class.
- Teacher assignments link automatically to the gradebook & attendance.

### 2.4 Online learning
*Admin → Online Learning*
- Recorded lessons, learning materials, Zoom/Meet links per class & subject.

---

## 3. Attendance ★

### 3.1 Classroom attendance
*Teacher → Attendance · Admin → Attendance*
- One‑tap mark **Present / Absent / Late / Excused** per student.
- Per‑day, per‑class roster; teacher dashboard shows today's roll at a glance.

### 3.2 Live parent push notifications ★ (Phase 15b — new in this build)
- The moment a student is marked **absent**, the system automatically dispatches the **"Absent today"** message template to the parents' phone (SMS / WhatsApp) and email.
- Honours each student's `can_receive_sms` / `can_receive_email` preference.
- Deduped: a student is notified only once per day (no spam if the teacher edits the register).
- Template is editable in *Admin → Messaging Service* — merge tokens `{{school_name}}`, `{{full_name}}`, `{{date}}` are filled in for you.

### 3.3 Bus tracking ★ (new)
*Admin → Transport · Driver app `/driver` · Parent → Bus Tracking*
- **Admin** defines routes (e.g., *Route A — Tema → Spintex*), bus label / plate, driver name + phone, conductor, and stops with scheduled pickup / drop‑off times.
- **Driver** opens `/driver` on a phone, picks the route, taps 🌅 *Start morning pickup* or 🌇 *Start afternoon drop‑off*. Then large one‑handed buttons cycle through *Arrived at stop → Departed stop* down the list. GPS pings every 30 seconds while a run is active (asks for browser geolocation permission).
- **Parent** sees a live status panel: route name, current/next stop, scheduled time, last‑update timestamp, driver name + bus label, and a one‑tap *Call driver* button.
- All events are stored as a timeline (`BusEvent`) per run so admin can audit any incident later.

---

## 4. Grading, assessments & report cards

### 4.1 Gradebook
*Teacher → Gradebook · Admin → Grading & Remarks*
- Enter raw scores per student / subject / term.
- Auto‑converted to **GES grade band** (1‑9 scale) with colour‑coded badge.
- Class position calculated.

### 4.2 Assessments
*Teacher → Assessments · Admin → Assessments*
- Dynamic assessment builder: quizzes, class tests, end‑of‑term papers.
- Question bank with reusable items.

### 4.3 Question bank
*Admin → Question Bank · Teacher → Question Bank*
- Tagged by subject, level, topic, difficulty.
- Reuse the same question across multiple assessments.

### 4.4 Reports & remarks ★
*Admin → Reports & Remarks*
- Compile a printable report card per student per term (scores, GES grade, position, teacher's remarks, principal's remarks).
- ★ **AI draft (free):** click **📋 Copy AI prompt** on any headmaster's‑remark box. The app copies a ready‑made prompt (with the student's marker grades baked in) and opens **claude.ai** — paste it into the free Claude chat, then copy Claude's draft back into the remark box. **No API key, no monthly bill.** Optional one‑tap auto‑draft is also available for schools with budget who add an Anthropic API key in Settings.

### 4.5 Homework
*Teacher → Homework · Parent → Homework*
- Teacher uploads homework with due date and attachment.
- Students / parents submit by uploading the completed file.
- Submission count shown to teacher live.

### 4.6 Lesson planner
*Teacher → Lesson Planner*
- Weekly lesson plan per subject; tied to the timetable.

### 4.7 Transcripts (graduates) ★
*Admin → Transcripts*
- Pick a student (JHS 3 leavers are listed first with a 🎓 marker).
- Compiles a multi‑year academic transcript: every year, every term, every subject — with score, GES grade band, GES remark and class position.
- Per‑term, per‑year, and cumulative averages all calculated.
- "🖨️ Print / Save PDF" uses the browser's print dialog; choose *Save as PDF* in the destination.

### 4.8 Smart reports
*Admin → Smart Reports*
- Build ad‑hoc analytical reports across attendance, grades, fees, enrolment.

### 4.8 BECE prep
*/bece page*
- Public‑facing BECE preparation portal (final‑year focus).

---

## 5. Fees & finance ★

### 5.1 Fee particulars
*Admin → Fee Particulars*
- Define each fee item (tuition, PTA, ICT, sports, exam, bus, feeding, etc.) — amount per class, per term.

### 5.2 Fee billing setup
*Admin → Fee Billing Setup*
- Choose which particulars apply to which class & term.
- Generate the term's invoice for every student in one batch.

### 5.3 Sibling discount engine ★
*Admin → Sibling Discount*
- Tiered policy — e.g., **2 siblings = 5%**, **3 siblings = +2%**, **4+ = +3%**.
- Per‑family override for special cases (staff family, scholarship).
- Discount auto‑applies whenever fees are computed.

### 5.4 Other fees
*Admin → Other Fees*
- One‑off ad‑hoc charges (replacement uniform, lost ID card, trip fee).

### 5.5 Finance accounts & payments
*Admin → Finance Accounts · Admin → Finance Payments*
- Multiple bank accounts (school operations, capex, payroll).
- Record any income or expense against an account with category, payee, reference.

### 5.6 Fee reports & finance reports
*Admin → Fee Reports · Admin → Finance Reports*
- Outstanding balances per class / per family.
- Daily / weekly / term collection summary.
- Cashflow & expense report.

### 5.7 Online fee payment (parents) ★
*Parent → Fees*
- Parent sees outstanding balance per child, with sibling discount already applied.
- Pay online in **GHS** via **Paystack** (MoMo, Visa / Mastercard, bank transfer, USSD).
- Hubtel as the secondary processor (live once KYC clears).

### 5.8 Payroll
*Admin → Payroll*
- Run monthly payroll across staff records, with SSNIT number, basic salary, deductions.

---

## 6. Communication & messaging ★

### 6.1 Announcements
*Admin → Announcements · Parent → Dashboard*
- School‑wide or class‑targeted announcements that show on parent / student dashboards.

### 6.2 Messaging service ★
*Admin → Messaging Service*
- Send SMS, WhatsApp, or email to any audience: individual student, class, all parents, staff.
- **Templates** with merge tokens — pre‑seeded for: welcome, payment confirmed, absent today, fees due, birthday, low‑credit alert.
- Trigger system: a template fires automatically on an event (e.g., `absent_today` fires from the attendance register — Phase 15b).
- Message log: every dispatch recorded with status (delivered / failed), recipients, gateway response.
- **Low SMS credit alert** to principal when balance dips below threshold.

### 6.3 Parent–teacher chat ★ (new)
*Parent → Chat Teacher · Teacher → Parent Chat*
- Private 1:1 thread per child with their class teacher.
- Parent side: dedicated chat block on the parent portal, scoped to the active child; auto-creates the thread on first open.
- Teacher side: dedicated **/teacher/chat** page with a thread list (sorted by most recent) and unread-message badges per thread.
- Threads carry the child's name + class so the teacher always knows whose parent they're replying to.
- Enter sends; Shift+Enter for a new line.

### 6.4 Pickup code ★
*Teacher → Pickup Verify · Parent → Pick‑up Code*
- Parent shows a rotating 6‑digit code at the gate.
- Teacher scans / types it; system verifies the guardian is on the student's authorised pick‑up list.
- Audit trail of every pickup.

### 6.5 School feed ★
*Admin → School Feed · Teacher → School Feed · Parent → School Feed*
- Internal Instagram‑style feed: photos from class trips, events, art day, etc.
- ★ **Photo albums:** paste multiple image URLs (one per line) and they post as a 2×2 album with "+N more" overflow.
- ★ **Moderation queue:** Approved / Pending / Rejected tabs on the admin page. Teacher and parent submissions auto‑land in Pending; admin self‑publishes. Reject with a reason, re‑approve, unpublish, or delete. Teachers see their own Pending / Rejected posts (with reason) on their own feed view but parents only see Approved posts.

---

## 7. Canteen ★

### 7.1 Canteen wallet
*Admin → Canteen Wallet*
- Each student has a prepaid canteen balance.
- Top‑up via MoMo (parent) or cash at front desk (cashier).

### 7.2 Canteen module
*Admin → Canteen*
- Cook / canteen staff debits the wallet at point of sale (debit transactions are logged).
- Low‑balance flag so parent can top‑up before the child runs out.

---

## 8. Staff & HR

- **Staff** (`Admin → Staff`) — directory with class assignment, subjects, hire date, SSNIT.
- **Employees** (`Admin → Employees`) — broader (non‑teaching) employee roster.
- **HR Settings** (`Admin → HR Settings`) — leave types, salary bands, holiday calendar.
- **Payroll** — see §5.8.

---

## 9. Library & student life

- **Library** (`/library`) — book catalogue + lending log.
- **Student Interests** (`Admin → Student Interests`) — hobbies, clubs, talents per student (used for personalised report‑card remarks and house assignments).

---

## 10. Parent portal ★
*Single screen, mobile‑first — `/parent`*

Tabs the parent sees:
1. **Dashboard** — announcements, today's snapshot per child.
2. **Fees** — outstanding balance, history, "Pay now" button.
3. **Attendance** — child's term attendance, days absent / late.
4. **Report Card** — latest term grades, position, GES bands.
5. **Homework** — assignments due, submit a file.
6. **Daily Log** — Crèche / Nursery: meals, naps, mood, nappies (logged by the teacher).
7. **Pick‑up Code** — rotating code, list of authorised pick‑up guardians.
8. **School Feed** — class photos, react / like.

Dual‑parent: both parents log in independently and see the same children but can have different notification preferences.

---

## 11. Student portal
*`/student`*
- Today's timetable.
- Homework due.
- Recent grades.
- Announcements.

---

## 12. Principal dashboard ★
*`/principal`*
- Real‑time KPI tiles: enrolment, attendance %, fees collected this term, outstanding, SMS credit balance.
- Drill into any module from one screen.
- Receives low‑credit alerts and exception reports.

---

## 13. Mobile app
- Native **Android (Play Store)** and **iOS (App Store)** apps already shipped (this build, v2.0.0 build 10).
- Same login, same data — designed mobile‑first with the **Phoenix dark‑glass + gold** aesthetic and a Gen‑Z feel (emoji‑led navigation, big tap targets).
- Built on Capacitor + Next.js so the web and the apps stay in sync — fix once, ship everywhere.

---

## 14. Settings (admin only)
*Admin → Settings*
- School profile (name, motto, logo, address, GPS, phone, email, account details).
- Current academic year.
- Payment provider toggle (Paystack / Hubtel) + keys + subaccount code.
- SMS credit threshold for low‑credit alerts.

---

## 15. What's next (roadmap — Phase 15+)

Already shipped in this codebase (in addition to v2.0.0 build 10):

| # | Feature | Status |
|---|---|---|
| 15b | **Live attendance push to parents** | ✅ Shipped — auto‑fires on absence |
| 15g | **AI report‑card narratives** (free copy‑prompt → claude.ai flow) | ✅ Shipped |
| 15e | **Transcripts for graduates** (multi‑year PDF compile) | ✅ Shipped |
| 15d | **Photo gallery & moderation** (album posts + Approved/Pending/Rejected queue) | ✅ Shipped |
| 15c | **Parent–teacher chat** (1:1 threads per child with the class teacher) | ✅ Shipped |
| 15f | **Bus tracking** (admin routes/stops + driver app + parent live status panel) | ✅ Shipped |

**Dropped from scope:** Phase 15h (diaspora multi-currency payments) — fees stay in GHS only. Parents abroad can still pay via international Visa / Mastercard on the GHS Paystack flow.

---

## Suggested walkthrough order (90‑minute session)

1. **(10 min)** Sign‑in, roles, dual‑parent invite flow.
2. **(15 min)** Admissions: enquiry → enrolment → family → guardians → data import.
3. **(15 min)** Fees end‑to‑end: particulars → billing → sibling discount → parent pays online → finance report.
4. **(10 min)** Attendance + the new live SMS/WhatsApp push to parents.
5. **(10 min)** Gradebook → assessment → report card → smart report.
6. **(10 min)** Messaging service: send a class‑wide message, view delivery log, edit a template.
7. **(10 min)** Parent portal + pickup code demo.
8. **(10 min)** Q&A + roadmap (Phase 15+).
