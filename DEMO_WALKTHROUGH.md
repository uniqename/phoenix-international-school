# Phoenix International School App — Demo Walkthrough

## 🎯 Overview
Phoenix International School app is a complete school management system with 60+ features across 6 user roles. This guide shows you how to walk through the features with the school owner.

---

## 🔑 Demo Login Credentials

All demo accounts use password: **demo1234**

| Role | Email | Purpose |
|------|-------|---------|
| **Admin** | admin@phoenixgh.edu | Full system control, configuration, reports |
| **Principal** | principal@phoenixgh.edu | Academic oversight, teacher management |
| **Teacher** | teacher@phoenixgh.edu | Create lessons, set homework, grade students, chat with parents |
| **Parent** | parent@phoenixgh.edu | View child's progress, pay fees, communicate with teachers |
| **Student** | student@phoenixgh.edu | View assignments, check grades, submit work, participate in chats |
| **Driver** | driver@phoenixgh.edu | Track bus route, mark attendance, send GPS updates |

---

## 📚 TEACHER WALKTHROUGH (Most Complete)

### Login & Dashboard
1. Go to login page
2. Click "👩‍🏫 Teacher Demo" button (or enter `teacher@phoenixgh.edu` / `demo1234`)
3. See teacher dashboard with:
   - Classes assigned
   - Pending tasks (homework to grade, messages)
   - Recent activity

### 1️⃣ Lesson Planner (📝 Lesson Planner Tab)
**Show:** Teachers create structured lessons aligned to curriculum

- Click **"+ Create Lesson"** button
- Fill form:
  - **Class:** JHS 3A
  - **Subject:** Mathematics
  - **Learning Strand:** Number and Algebra (NACCA aligned)
  - **Sub-strand:** Fractions & Decimals
  - **Week:** 14
  - **Learning Objectives:** "Students will add, subtract, and simplify fractions"
  - **Content:** "Starter (10 min): warm-up. Main (25 min): guided practice..."
  - **Experiments:** "Pizza slicing with actual pizzas to show fractions"
  - **Video URL:** Can paste YouTube link
  - **Cover Image:** Can upload lesson cover
  - **Attachments:** Upload PDFs, worksheets, images
- Click **"Save as Draft"** or **"Publish"** (published = students see it)
- **Demo fact:** Teacher already created 6 published lessons visible in the list

### 2️⃣ Homework Management (📚 Homework Tab)
**Show:** Teachers assign work and track completion

- Click **"+ Set Homework"**
- Assign:
  - **Title:** "Exercises 14.1–14.4: Fractions & Decimals"
  - **Due Date:** May 26
  - **Description:** "Complete all questions. Show working."
- **See submissions:** Click any homework → see 24/27 students submitted
- Grade submissions with comments and scores
- **Demo fact:** 6 homework assignments already created for walk-through

### 3️⃣ Grades & Gradebook (📋 Gradebook Tab)
**Show:** Teachers record and track student performance

- Click class → see all students
- Enter marks for each student in subject
- Click student name → see full grade history
- See aggregate class performance

### 4️⃣ Attendance (📡 Attendance Tab)
**Show:** Quick roll call each morning

- Click **"Mark Attendance"**
- Checkboxes for each student (present/absent)
- Save → records time-stamped attendance
- Export reports by date range

### 5️⃣ Parent Communication (💬 Parent Chat Tab)
**Show:** 1:1 messaging with parents about student progress

- See list of parent conversations
- Click to open chat
- Send messages about: homework, attendance, behavior, grades
- Real-time typing indicators (new in v1.0.2)

### 6️⃣ School Feed (📸 School Feed Tab)
**Show:** Share school updates and photos

- Click **"+ New Post"**
- Post: "Sports Day Practice — JHS students doing relay races!"
- Add photo
- See likes and comments

### 7️⃣ Question Bank (❓ Question Bank Tab)
**Show:** Create reusable quiz questions

- Click **"+ Add Question"**
- Enter: Math question with 4 options
- Mark correct answer
- Add explanation
- **Demo fact:** 40+ questions already created (Math, Science, English, Social Studies)

### 8️⃣ Assessment Rubrics (📝 Assessments Tab)
**Show:** Create grading standards for projects/presentations

- Define rubric criteria
- Set performance levels (Excellent, Good, Fair, Poor)
- Apply to student work

### 9️⃣ Pickup Code Verification (🔐 Pickup Verify Tab)
**Show:** Verify authorized pickups

- Shows daily pickup codes for students
- Tick off as parents pick up
- Prevents unauthorized pickups

---

## 👨‍👩‍👧 PARENT WALKTHROUGH (Secondary)

### Login as Parent
- Email: `parent@phoenixgh.edu`
- Password: `demo1234`

### Key Sections:
1. **📊 Dashboard** — Child's grades, attendance, fees due
2. **💳 Fees** — View fees, payment history, payment plans (split into 2-4 installments)
3. **📡 Attendance** — See attendance calendar, excuses
4. **📄 Report Card** — Full academic report
5. **📚 Homework** — See assignments, submit work
6. **🔐 Pick-up Code** — Daily pickup authorization code
7. **💬 Chat Teacher** — Message child's teacher (real-time typing indicators)
8. **🚌 Bus Tracking** — Real-time bus location (if assigned)
9. **💻 Lessons** — View published lessons from teacher
10. **📸 School Feed** — See school announcements and photos
11. **📋 Submit Excuse** — Request excuse for absence

---

## 🏛️ ADMIN WALKTHROUGH (Most Powerful)

### Login as Admin
- Email: `admin@phoenixgh.edu`
- Password: `demo1234`

### Key Features:
1. **📊 Overview** — School stats, pending tasks
2. **🎒 Students** — Add, edit, manage student records
3. **👨‍👩‍👧 Families** — Family grouping, multi-child discount policy
4. **💳 Fee Management** — Define fees, track payment
5. **📡 Attendance** — View school-wide attendance reports
6. **👩‍🏫 Staff** — Add teachers, assign to classes
7. **💬 Parent Chats** — Monitor all teacher-parent conversations
8. **📋 Audit Logs** (New) — See all user actions, search by user/action/date
9. **⚙️ Settings** — Configure school info, payment gateway (Paystack), backups
10. **💾 Backup/Restore** (New) — Download data backups, restore from backup

---

## 🆕 NEW Features in v1.0.2

### ✍️ Real-time Typing Indicators
- **Where:** Chat pages (parent-to-teacher)
- **What:** See "X is typing…" when someone is composing
- **Demo:** Open chat, start typing in message input

### 🔐 Social Login (OAuth)
- **Where:** Login page
- **Buttons:** Google & WhatsApp login (demo buttons present)
- **Future:** Link social accounts to school accounts

### 📋 Audit Log Dashboard
- **Where:** Admin → Audit Logs
- **Shows:** All user actions (login, create, edit, delete)
- **Filter:** By role, action, date range, user
- **Use:** Track who did what when

### 💾 Backup/Restore Modal
- **Where:** Admin Settings
- **Download:** Full backup as JSON (students, fees, grades, etc.)
- **Restore:** Upload JSON to restore data
- **Use:** Data migration, safety copies

### 🧹 Hubtel Cleanup
- Removed SMS payment gateway
- Kept: Paystack payments + in-app push notifications only
- Cleaner, more focused interface

---

## 💡 Walking Through the App

### 5-Minute Quick Demo
1. **Login as Teacher** → Show lesson creation (5 subject areas)
2. **Switch to Parent** → Show fees, grades, chat with teacher
3. **Switch to Admin** → Show settings, backup feature, audit logs

### 15-Minute Full Demo
Follow the **Teacher Walkthrough** section above in order:
1. Lesson Planner (create a lesson)
2. Homework (set assignment, show submissions)
3. Gradebook (enter a grade)
4. Attendance (mark roll)
5. Chat with parents
6. Feed (post update)
7. Question bank (demo BECE prep)

### Talking Points
- **"Complete ERP"** — 60+ features, not just attendance
- **"Curriculum Aligned"** — NACCA strands, learning objectives
- **"Real-time Communication"** — Teachers ↔ Parents instantly
- **"Secure Payments"** — Paystack gateway, transparent billing
- **"Data Backup"** — Download all school data anytime
- **"Audit Trail"** — See all actions by all users
- **"Mobile & Web"** — Works on phones (iOS/Android) and web
- **"Offline Ready"** — App works offline, syncs when online

---

## 🌐 Live Demo Link

- **URL:** https://phoenix-international-school.vercel.app
- **Updated:** May 21, 2026 (v1.0.2)
- **Demo Data:** 6 teachers, 27 students, 6 lesson plans, 6 homework, 40+ quiz questions

---

## 📞 Support

For questions or to customize the demo:
- GitHub: uniqename/phoenix-international-school
- Email: consulting.enam@gmail.com
- Version: 1.0.2 (production-ready)

---

**Ready to impress the school owner! 🚀**
