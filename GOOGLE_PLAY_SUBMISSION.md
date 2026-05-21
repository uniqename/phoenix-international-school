# Phoenix International School — Google Play Store Submission Checklist

## App Information

**App Name:** Phoenix International School  
**Package Name:** edu.phoenixintlschool  
**Version Code:** 1  
**Version Name:** 1.0.0  
**Target API Level:** 34 (Android 14)  
**Minimum API Level:** 24 (Android 7.0)  

---

## 1. App Store Listing

### Title (50 characters max)
```
Phoenix International School
```

### Short Description (80 characters max)
```
Student portal, grades, homework, bus tracking, and parent messaging.
```

### Full Description (4000 characters)
```
Phoenix International School — Your Complete School Portal

Welcome to Phoenix International School's official mobile app. A unified platform 
for students, parents, teachers, and staff to collaborate, communicate, and track 
student progress in real time.

KEY FEATURES:

📚 For Students:
• View your grades, homework assignments, and lesson materials
• Submit homework and track submission status
• Monitor your learning streak and achievement badges
• Access BECE practice quizzes with detailed feedback
• Chat with your teachers about assignments and coursework
• Check your school bus location in real time
• Gate check-in via QR code for attendance

👨‍👩‍👧 For Parents:
• Monitor your child's grades, attendance, and homework
• Review school announcements and event calendar
• Pay school fees securely (Paystack integration)
• Chat directly with teachers about progress and behavior
• Track the school bus in real time to pick up your child
• Receive SMS alerts for fees due, absences, and announcements
• Manage multiple children with one account

👨‍🏫 For Teachers:
• Create and manage lesson plans with videos and attachments
• Upload grades and attendance for your classes
• Assign and grade homework with feedback
• Share school announcements on the feed
• Use AI to draft student remarks and reports
• Chat with parents to discuss student progress
• Review lesson materials and student portfolios

🏫 For School Admins:
• Manage students, teachers, and staff accounts
• Configure fees, payment methods, and discounts
• Monitor bus routes and driver operations
• Review attendance reports and trends
• Moderate feed content and announcements
• Generate financial and academic reports
• Manage SMS and email communications

CORE FUNCTIONALITY:

✓ Complete grade management (GES grading scale)
✓ Real-time bus tracking with GPS updates
✓ Secure parent-teacher messaging
✓ Offline access to lessons and homework
✓ Integrated fee payment system (Paystack)
✓ Achievement badges and learning streaks
✓ QR code-based gate check-in for attendance
✓ BECE practice questions with scoring
✓ Library management and book loans
✓ Staff time clock and payroll
✓ School canteen menu and ordering
✓ Email and SMS notifications
✓ Multi-language support (English + local)

DATA & PRIVACY:

• All data is stored locally on your device (no cloud backup)
• End-to-end messaging between parents and teachers
• Role-based access control — students cannot see other students' data
• GPS location is deleted after each bus run ends
• Student photos and homework attachments are encrypted locally
• Compliant with Ghana Data Protection Act and GDPR principles
• Full privacy policy available in the app

OFFLINE MODE:

Use the app without an internet connection:
• View downloaded lessons and assignments
• Access offline practice quizzes
• Check stored grades and attendance records
• Compose messages (sent when reconnected)
• Gate check-in (sync when connected)

This app is designed for transparency, safety, and collaboration between 
schools, parents, and students. Built with privacy-first principles — your 
data stays on your device.

PERMISSIONS EXPLAINED:

📍 Location (GPS): Real-time bus tracking for student pickup/dropoff
📷 Camera: Take photos for profile uploads and homework submissions
📁 Files: Access storage to attach homework and lesson materials
📱 Phone: Identify your device for multi-device account management
📞 SMS: Receive fee alerts, absence notifications, and announcements
📧 Email: Account verification and password recovery

SUPPORT:

Questions or issues? Contact the school directly:
📧 admin@phoenixintlschool.edu.gh
🌐 www.phoenixintlschool.edu.gh
📱 +233 (school phone)

Download now and stay connected with your school.
```

### Category
```
Education
```

### Content Rating
```
Everyone (PEGI 3+)
```

---

## 2. Graphics & Screenshots

### App Icon (512×512 px, PNG)
- Design: Phoenix logo or school crest with purple/gold/dark theme
- Requirement: Transparent or solid background, no rounded corners (Google applies them)

### Screenshots (Minimum 4, Maximum 8)

**Phone Screenshots (1080×1920 px or 1440×2560 px):**

1. **Student Dashboard**
   - Show: Grade card, homework due, learning streak, achievement badges
   - Caption: "Track your grades, homework, and learning streaks"

2. **Bus Tracking Map**
   - Show: Map with bus location, pickup time, parent view
   - Caption: "Know where the school bus is in real time"

3. **Chat with Teacher**
   - Show: Parent-teacher message thread about homework
   - Caption: "Message your teachers directly about your child's progress"

4. **Homework Submission**
   - Show: Student submitting homework with file attachment
   - Caption: "Submit homework online with file attachments"

5. **Grades View**
   - Show: Student grades by subject with GES scale colors
   - Caption: "View detailed grades and exam results"

6. **Admin Dashboard** (optional)
   - Show: Fee management, bus monitoring, student list
   - Caption: "Complete school management in one app"

### Feature Graphic (1024×500 px, PNG/JPG)
- Text: "Phoenix International School — All-in-One Student Portal"
- Design: Collage of key features (messaging, grades, bus tracking, homework)

---

## 3. Permissions Justification

### Internet (INTERNET, ACCESS_NETWORK_STATE)
**Justification:** Required to sync grades, homework, messages, and bus location with the school server. Downloads lesson videos and attachments.

### Location (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
**Justification:** Real-time GPS tracking for school bus location. Parents need to see where the bus is during pickup/dropoff. Location is deleted after each run ends.

### Camera (CAMERA)
**Justification:** Allow students to take photos for homework submissions and parents to upload profile photos.

### Storage (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)
**Justification:** Access files and folders to attach homework, lesson materials, and photos. Store offline lesson cache.

### Phone (READ_PHONE_STATE)
**Justification:** Identify devices for multi-device account management and prevent duplicate logins.

### SMS (RECEIVE_SMS, READ_SMS, SEND_SMS)
**Justification:** Receive fee alerts, absence notifications, and school announcements via SMS (Hubtel integration).

---

## 4. Content Rating Questionnaire

**Questions to Answer:**

- **Violence:** No violent content
- **Sexual Content:** No sexual content
- **Profanity:** No profanity or offensive language
- **Alcohol/Drugs:** No references to alcohol or illegal drugs
- **Gambling:** No gambling or betting features
- **Personal Data:** Collects student data (name, grades, photos) — educational context only
- **Ads:** No third-party advertisements
- **In-App Purchases:** No paid features (all free within the school)
- **Locations:** School address only (not tracking user location outside bus context)

---

## 5. App Content Declaration

### Data Safety (Google Play's Data Safety Section)

**Data Collected:**
- Student names, IDs, grades
- Parent names, phone numbers, email
- GPS location (bus tracking only, deleted after run)
- Photos (homework, profiles, lessons)
- Chat messages
- Homework submissions

**Data Sharing:**
- Data is NOT shared with third parties except:
  - Paystack (payment processing)
  - Hubtel (SMS notifications)
  - Google Maps (bus location mapping)

**Data Retention:**
- Academic data: 5 years (regulatory requirement)
- Chat messages: Indefinite (until deleted)
- Homework attachments: 3 years
- GPS logs: Deleted after each bus run
- Photos: Life of lesson/account

**Encryption:**
- Data in transit: HTTPS (if applicable)
- Data at rest: Device-level encryption via OS

**Security Practices:**
- Role-based access control
- No plaintext passwords
- Regular security audits
- Incident response protocol

---

## 6. Content Policy Compliance

### Prohibited Content
- ✓ Does NOT contain hate speech or discrimination
- ✓ Does NOT target children with ads or manipulative content
- ✓ Does NOT have gambling or loot boxes
- ✓ Does NOT have misleading claims
- ✓ Does NOT contain malware or spyware
- ✓ Does NOT violate intellectual property

### Allowed Content
- ✓ Educational app for school use
- ✓ Parental access to child data (with consent)
- ✓ Essential location tracking (bus safety)
- ✓ Photo sharing in educational context
- ✓ Messaging between school staff and parents

---

## 7. Testing

Before Submission:

- [ ] Install APK on Android 7.0 and Android 14 devices
- [ ] Test all permissions (location, camera, storage, SMS)
- [ ] Verify grades, homework, and messages load correctly
- [ ] Test bus tracking map and real-time updates
- [ ] Check offline mode (no internet)
- [ ] Test homework file upload with different file types
- [ ] Verify parent-teacher chat works both directions
- [ ] Test payment flow with Paystack
- [ ] Check SMS notifications
- [ ] Test multi-user login (student, parent, teacher, admin)
- [ ] Verify no crashes on rapid navigation
- [ ] Check app size < 100 MB (aim for ~30 MB)
- [ ] Verify no sensitive data in logs or screenshots

---

## 8. Release Notes

```
Version 1.0.0 — Initial Release

Welcome to Phoenix International School app!

✨ Features:
• Student grades, homework, and lesson access
• Real-time school bus tracking for parents
• Parent-teacher messaging and communication
• Homework submission with file attachments
• Achievement badges and learning streaks
• BECE practice quizzes with scoring
• School fee payment integration (Paystack)
• SMS alerts for fees, absences, and announcements
• Offline access to lessons and previous grades
• QR code-based gate check-in for attendance

📱 Works on Android 7.0 and up
⚡ Optimized for low bandwidth areas
🔒 All data stored securely on your device
🌙 Dark mode support

This is a community app built by Phoenix International School for students, 
parents, and teachers. Report bugs or suggest features to admin@phoenixintlschool.edu.gh
```

---

## 9. Submission Checklist

- [ ] App name, short description, and full description written
- [ ] Category: Education
- [ ] Content rating: Everyone / PEGI 3+
- [ ] Screenshots (minimum 4) uploaded
- [ ] App icon (512×512) uploaded
- [ ] Feature graphic (1024×500) uploaded
- [ ] Privacy policy URL: https://phoenixintlschool.edu.gh/privacy
- [ ] Support email: admin@phoenixintlschool.edu.gh
- [ ] Support website: https://phoenixintlschool.edu.gh
- [ ] Permissions justified in content rating questionnaire
- [ ] Data safety section completed
- [ ] APK signed with release key
- [ ] APK tested on Android 7.0 and Android 14
- [ ] Version code incremented (start at 1)
- [ ] Release notes added
- [ ] Pricing set to Free
- [ ] All required fields completed

---

## 10. Account & Publishing

**Google Play Developer Account:**
- Developer name: Phoenix International School
- Email: admin@phoenixintlschool.edu.gh
- Payment method: School bank account
- Account type: Business (Educational Institution)

**Release Process:**
1. Sign into Google Play Console
2. Create new app (select "Education" category)
3. Fill in app information (above)
4. Upload graphics and screenshots
5. Set up pricing (Free)
6. Configure store listing
7. Complete data safety questionnaire
8. Upload signed APK
9. Review app content policies
10. Submit for review (2-4 hours for approval)

**After Approval:**
- Monitor ratings and reviews
- Respond to user feedback
- Publish updates for bug fixes and new features
- Track download numbers and crash reports via Google Play Console

---

**Submission Ready:** Once all items are checked, the app is ready to submit to Google Play.

**Timeline:** Approval typically takes 2-4 hours for a first submission.

For questions, contact: admin@phoenixintlschool.edu.gh
