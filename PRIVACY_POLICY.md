# Phoenix International School App — Privacy Policy

**Last Updated: May 21, 2026**

## Overview

The Phoenix International School mobile application ("App") is designed to serve students, parents, teachers, and school administrators. This Privacy Policy explains how we collect, use, and protect your data within the App.

**Developer:** Phoenix International School  
**Data Controller:** Phoenix International School Administration  
**Primary Contact:** admin@phoenixintlschool.edu.gh

---

## 1. Data We Collect

### 1.1 Information You Provide
- **User Account Data:** Name, email, phone number, student ID, class assignment, role (student, parent, teacher, admin, driver, principal)
- **Profile Information:** Photo, gender, date of birth (optional), residential address (drivers and staff)
- **Authentication:** Passwords (hashed, never stored in plain text)

### 1.2 Location Data (GPS)
**Collection Context:** Real-time bus tracking for student safety during school transport.

- **What We Collect:**
  - GPS coordinates (latitude, longitude) from the bus vehicle during active runs
  - Timestamp of each location ping (typically every 30 seconds during transport)
  - Bus stop arrival/departure times
  - Student boarding/alighting events

- **How It's Used:**
  - Show parents real-time bus location on a map (parents can see where their child's bus is)
  - Help drivers track scheduled pickups and dropoffs
  - Enable admin to monitor transport operations and enforce punctuality
  - **Location data is deleted automatically once a bus run ends**

- **Who Can See It:**
  - Parents: See their child's bus location in real time during transport
  - Drivers: See their assigned route and next pickup locations
  - Admin/Principal: Full visibility for oversight and incident reporting

- **Data Retention:** GPS logs are cleared after each bus run completes. Historical bus runs (for audit/incident review) are retained for 90 days in admin logs, then deleted.

### 1.3 Photos and Media
**Collection Context:** Educational content, student portfolios, and lesson materials.

- **What We Collect:**
  - Photos uploaded by teachers in lesson plans (class photos, experiments, field trips)
  - Student-submitted homework attachments (handwritten work, diagrams, photographs)
  - Profile photos (student, parent, teacher)
  - Class activity photos shared on the school feed

- **How It's Used:**
  - Store lesson materials for offline access (cached locally on student devices)
  - Allow teachers to embed lesson photos and experimental documentation
  - Enable students to submit homework with visual evidence (photos of work, diagrams)
  - Share school activities on the internal feed (parent and staff visibility only)
  - Classroom record-keeping and portfolio building

- **Who Can See It:**
  - Lesson photos: Visible to all students in that class
  - Homework attachments: Visible only to the teacher and student
  - Profile photos: Visible to users with appropriate access (teachers, admins, family)
  - Feed photos: Visible only after admin approval; restricted to logged-in parents, teachers, and staff

- **Storage & Retention:**
  - Photos are stored locally in the app's private storage (not synced to cloud)
  - If a student is deleted, their homework attachments are retained for 1 year (audit trail)
  - Lesson photos are retained as long as the lesson exists; deleted when the lesson is removed

### 1.4 Chat & Messaging
**Collection Context:** Parent-teacher communication about student progress and wellbeing.

- **What We Collect:**
  - Messages sent between parents and teachers
  - Message metadata: sender, recipient, timestamp, read status
  - Message urgency flags (normal/urgent)
  - Chat thread history (parent, teacher, student names; class assignment)

- **How It's Used:**
  - Enable parents to ask questions about homework, assignments, and behavior
  - Allow teachers to send feedback, attendance alerts, and progress updates
  - Archive conversations for record-keeping (parents can reference past discussions)
  - Flag urgent messages (e.g., medical concerns, behavioral issues) for immediate attention

- **Who Can See It:**
  - Parent-teacher chats: Only the specific parent and teacher involved
  - Principal: Admin can view escalated/archived threads only on request or incident investigation
  - Students: Do NOT have access to parent-teacher messages

- **Encryption & Storage:**
  - Messages are stored locally in the app (end-to-end within the school network)
  - Messages are not encrypted in transit (school network responsibility)
  - Chat history is retained indefinitely until the parent or teacher deletes it
  - Deleted messages cannot be recovered

### 1.5 Academic & Attendance Data
**Collection Context:** Grades, homework, attendance, and performance tracking.

- **What We Collect:**
  - Student grades and test scores
  - Attendance records (arrival times, absences, excuses)
  - Homework assignments, due dates, and submission status
  - Homework submission metadata (student name, submission time, file details)
  - BECE (Ghana external exam) practice attempt records
  - Assignment scores and teacher feedback

- **How It's Used:**
  - Track student progress and identify learning gaps
  - Generate school reports for parents and teachers
  - Enforce attendance policies and send absence notifications
  - Support teacher grading workflows (offline homework uploads, bulk feedback)
  - Prepare transcripts and progress reports for student advancement

- **Who Can See It:**
  - Students: See their own grades, homework, and attendance
  - Parents: See their child's grades, homework, and attendance
  - Teachers: See all grades and attendance for their assigned classes
  - Admin/Principal: Full visibility for reporting and policy enforcement

- **Data Retention:**
  - Student grades and attendance: Retained for the entire school year + 5 years (regulatory requirement)
  - Homework submissions and feedback: Retained for 3 years
  - Deleted student records: Academic data retained for 5 years; personal data deleted after 1 year

---

## 2. Data Storage & Security

### 2.1 Where Data Lives
- **Primary Storage:** Local device storage (student/parent/teacher devices) using encrypted browser localStorage
- **No Cloud Sync:** All data is stored locally; no automatic cloud backup or sync to external servers
- **Offline First:** The app works offline; data syncs to other users when devices reconnect

### 2.2 Access Controls
- **Role-Based Access:** Only users with appropriate roles can view sensitive data
  - Students cannot see other students' grades or attendance
  - Parents can only see their own children's data
  - Teachers see data for their assigned classes only
  - Drivers see only bus route and student pickup details
  - Admin has full access for school operations

- **No API Keys Visible:** Admin API keys (if any) are gated behind admin-only settings; never exposed to students or parents

### 2.3 Security Measures
- **Password Hashing:** User passwords are hashed and never stored or displayed in plain text
- **No Plaintext Credentials:** Sensitive data (API keys, credentials) are never logged or cached insecurely
- **Local Encryption:** Device-level encryption via browser StorageAPI (depends on OS security)
- **Data Validation:** All user inputs are validated to prevent injection attacks
- **Authentication:** Role-based access control ensures users can only access their own data

---

## 3. Third-Party Integrations

### 3.1 Paystack (Payment Processing)
- **Data Shared:** Student family ID, student name, fee description, amount, payment status
- **Purpose:** Process school fee payments
- **Retention:** Paystack retains payment records per their privacy policy
- **Link:** https://paystack.com/privacy

### 3.2 Hubtel (SMS & Credit Alerts)
- **Data Shared:** Student/parent phone number, SMS message content (fee due dates, payment confirmations, balance alerts)
- **Purpose:** Send SMS notifications to parents about fees and school announcements
- **Retention:** Hubtel retains SMS logs per their privacy policy
- **Link:** https://hubtel.com/privacy

### 3.3 Google Maps / OpenStreetMap (Bus Tracking)
- **Data Shared:** GPS coordinates, bus location (no personal data)
- **Purpose:** Display bus location on a map for real-time tracking
- **Retention:** No data retained (location is real-time only)

### 3.4 QR Code Generation (QRServer)
- **Data Shared:** Student ID only (for gate check-in QR codes)
- **Purpose:** Generate QR codes for student gate entry
- **Retention:** No data retained; QR codes are stateless

---

## 4. Your Rights

### 4.1 Access Your Data
You have the right to request all data we hold about you or your child.  
**Request:** Contact admin@phoenixintlschool.edu.gh with subject "Data Access Request"

### 4.2 Correct Inaccurate Data
If any information is incorrect, you can update it directly in the app (student profile, contact details) or request correction from the school.

### 4.3 Delete Your Data
You may request deletion of your account or your child's student record.  
**Exceptions:** Academic records retained for 5 years per Ghana Education Service regulations; exam records cannot be deleted.

### 4.4 Opt Out of Features
- **Bus Tracking:** Ask the school to disable real-time location sharing for your child (manual dropoff only)
- **SMS Notifications:** Opt out via the app settings or by request to admin
- **Feed Photos:** Your child's photo will not appear on the school feed unless admin approves it

---

## 5. Children's Privacy (GDPR/Local Compliance)

### 5.1 Student Data (Under 18)
- Parents/guardians have the right to request access to their child's data
- We do not market to students or show third-party ads
- Student data is used solely for education, safety, and school operations
- A parent can request their child's account be deleted (with exception for academic records)

### 5.2 Parental Controls
- Parents can review their child's homework, grades, attendance, and messages
- Parents receive notifications of key events (absences, low grades, due dates)
- Parents can communicate directly with teachers about their child's progress

---

## 6. Data Breaches & Security Incidents

If we discover unauthorized access to student or family data:
1. We will notify affected users within 72 hours
2. We will detail what data was accessed and steps we're taking to prevent recurrence
3. We will cooperate with Ghana's Data Protection Authority if required

**Incident Report:** admin@phoenixintlschool.edu.gh

---

## 7. International Data Transfers

The app is used locally within Ghana. If data is accessed from outside Ghana (parent abroad), it remains protected under this Privacy Policy and Ghana's Data Protection Act.

---

## 8. Policy Changes

We may update this Privacy Policy as the app evolves.  
**Notice:** Material changes will be communicated via in-app notification or email.  
**Effective Date:** The date listed at the top of this document.

---

## 9. Contact Us

**Privacy Questions:**  
📧 admin@phoenixintlschool.edu.gh  
📱 +233 (school phone)  
🏫 Phoenix International School, Accra, Ghana

**Data Protection Authority (Ghana):**  
Data Protection Authority  
Email: info@dataprotection.gov.gh  
https://dataprotection.gov.gh

---

## Appendix: Data Use Summary

| Data Type | Collected From | Shared With | Retention |
|-----------|---|---|---|
| **Grades & Attendance** | Teachers, auto-sync from timetable | Parents, students, teachers | 5+ years |
| **GPS Location** | Bus vehicle (30-sec pings) | Parents (real-time), drivers, admin | Deleted after bus run |
| **Chat Messages** | Parents & teachers | Only the recipient; admin on escalation | Indefinite (until deleted) |
| **Homework Attachments** | Students | Teacher, student only | 3 years |
| **Photos (Profile/Lesson)** | Users upload | Authorized users only (role-based) | Life of lesson/account |
| **Payment Data** | Paystack gateway | Paystack, school finance team | Per Paystack policy |
| **SMS Logs** | Hubtel gateway | Hubtel, school staff | Per Hubtel policy |
| **Account Credentials** | User registration | Hashed, admin-only access | Account lifetime |

---

**By using the Phoenix International School app, you acknowledge that you have read and agreed to this Privacy Policy.**
