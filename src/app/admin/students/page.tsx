"use client";
import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { CLASSES, LEVEL_NAMES } from "@/lib/utils";
import type { Student, StudentLevel, GuardianRelationship } from "@/lib/types";
import toast from "react-hot-toast";

const LEVELS: StudentLevel[] = ["creche","nursery","kg","primary","jhs"];
const STUDENT_CATEGORIES = ['Day', 'Boarding'];
const HOUSES = ['Red House', 'Blue House', 'Green House', 'Yellow House'];
const GUARDIAN_RELATIONSHIPS: GuardianRelationship[] = ['father', 'mother', 'grandparent', 'aunt', 'uncle', 'sibling', 'other'];
const COUNTRIES = ['Ghana', 'Nigeria', 'Côte d\'Ivoire', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'Other'];
const RELIGIONS = ['Christianity', 'Islam', 'Judaism', 'Buddhism', 'Hinduism', 'Traditional', 'None', 'Other'];

const blankForm = (): Omit<Student,"id"|"created_at"|"fee_status"> => ({
  student_id: "",
  first_name: "",
  last_name: "",
  other_names: "",
  dob: "",
  gender: "male",
  level: "primary",
  class_name: "Primary 1",
  admission_date: new Date().toISOString().split('T')[0],
  course_group_id: undefined,
  category: "Day",
  student_house: undefined,
  country: "Ghana",
  nationality: "Ghanaian",
  state_province: "",
  residential_city: "",
  address: "",
  mobile_no: "",
  email: "",
  can_receive_sms: false,
  can_receive_email: false,
  allergies: "",
  special_health_needs: "",
  hometown: "",
  religion: "",
  language_spoken: "",
  previous_school: "",
  year_of_leaving_previous_school: undefined,
  previous_class: "",
  sibling_id: undefined,
  guardian_id: undefined,
  photo_url: undefined,
});

const blankGuardian = () => ({
  first_name: '',
  last_name: '',
  relationship: 'father' as GuardianRelationship,
  username: '',
  occupation: '',
  phone: '',
  alt_phone: '',
  email: '',
  address: '',
  photo_url: undefined,
  can_receive_sms: false,
  can_receive_email: false,
});

type FormTab = "basic" | "admission" | "contact" | "health" | "social" | "previous" | "relations" | "guardian";

export default function StudentsPage() {
  const students = useAppStore((s) => s.students);
  const addStudent = useAppStore((s) => s.addStudent);
  const updateStudent = useAppStore((s) => s.updateStudent);
  const deleteStudent = useAppStore((s) => s.deleteStudent);
  const guardians = useAppStore((s) => s.guardians);
  const addGuardian = useAppStore((s) => s.addGuardian);
  const courseGroups = useAppStore((s) => s.courseGroups);
  const nextAdmissionNumber = useAppStore((s) => s.nextAdmissionNumber);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(blankForm());
  const [newGuardian, setNewGuardian] = useState(blankGuardian());
  const [tab, setTab] = useState<FormTab>("basic");
  const [addingNewGuardian, setAddingNewGuardian] = useState(false);

  const filtered = students.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    return (fullName.includes(search.toLowerCase()) || s.student_id.includes(search)) && (levelFilter === "all" || s.level === levelFilter);
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...blankForm(), student_id: nextAdmissionNumber() });
    setNewGuardian(blankGuardian());
    setAddingNewGuardian(false);
    setTab("basic");
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      student_id: s.student_id,
      first_name: s.first_name,
      last_name: s.last_name,
      other_names: s.other_names ?? "",
      dob: s.dob ?? "",
      gender: s.gender ?? "male",
      level: s.level,
      class_name: s.class_name,
      admission_date: s.admission_date ?? new Date().toISOString().split('T')[0],
      course_group_id: s.course_group_id,
      category: s.category ?? "Day",
      student_house: s.student_house,
      country: s.country ?? "Ghana",
      nationality: s.nationality ?? "Ghanaian",
      state_province: s.state_province ?? "",
      residential_city: s.residential_city ?? "",
      address: s.address ?? "",
      mobile_no: s.mobile_no ?? "",
      email: s.email ?? "",
      can_receive_sms: s.can_receive_sms ?? false,
      can_receive_email: s.can_receive_email ?? false,
      allergies: s.allergies ?? "",
      special_health_needs: s.special_health_needs ?? "",
      hometown: s.hometown ?? "",
      religion: s.religion ?? "",
      language_spoken: s.language_spoken ?? "",
      previous_school: s.previous_school ?? "",
      year_of_leaving_previous_school: s.year_of_leaving_previous_school,
      previous_class: s.previous_class ?? "",
      sibling_id: s.sibling_id,
      guardian_id: s.guardian_id,
      photo_url: s.photo_url,
    });
    setTab("basic");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.first_name.trim()) { toast.error("First Name is required"); return; }
    if (!form.last_name.trim()) { toast.error("Last Name is required"); return; }
    if (!form.dob) { toast.error("Date of Birth is required"); return; }
    if (!form.guardian_id && !addingNewGuardian) { toast.error("Select or create a guardian"); return; }

    let guardianId = form.guardian_id;
    if (addingNewGuardian && !guardianId) {
      if (!newGuardian.first_name.trim() || !newGuardian.last_name.trim()) {
        toast.error("Guardian First Name and Last Name required");
        return;
      }
      const g = addGuardian({
        first_name: newGuardian.first_name,
        last_name: newGuardian.last_name,
        relationship: newGuardian.relationship,
        username: newGuardian.username || undefined,
        occupation: newGuardian.occupation || undefined,
        phone: newGuardian.phone || undefined,
        alt_phone: newGuardian.alt_phone || undefined,
        email: newGuardian.email || undefined,
        address: newGuardian.address || undefined,
        can_receive_sms: newGuardian.can_receive_sms,
        can_receive_email: newGuardian.can_receive_email,
        is_emergency_contact: false,
        can_pick_up_students: true,
      });
      guardianId = g.id;
    }

    if (!editing) {
      const id = (form.student_id || nextAdmissionNumber()).trim();
      if (students.find((s) => s.student_id === id)) {
        toast.error(`Admission number ${id} already exists`);
        return;
      }
      addStudent({ ...form, student_id: id, guardian_id: guardianId, fee_status: "outstanding" });
      toast.success(`Student admitted: ${id}`);
    } else {
      updateStudent(editing.id, { ...form, guardian_id: guardianId });
      toast.success("Student updated");
    }
    setShowModal(false);
  };

  const handleDelete = (s: Student) => {
    if (confirm(`Delete ${s.first_name} ${s.last_name}?`)) {
      deleteStudent(s.id);
      toast.success("Student deleted");
    }
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Students ({students.length})</h2>
        <button onClick={openAdd} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">+ Admit Student</button>
      </div>

      <div className="flex gap-3 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or ID..."
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-900 focus:outline-none focus:border-indigo-500" />
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-900 focus:outline-none focus:border-indigo-500">
          <option value="all">All Levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{LEVEL_NAMES[l]}</option>)}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "#0A1628" }}>
            <tr className="text-xs text-blue-300 uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-semibold">Student</th>
              <th className="text-left px-4 py-3 font-semibold">ID</th>
              <th className="text-left px-4 py-3 font-semibold">Class</th>
              <th className="text-left px-4 py-3 font-semibold">Guardian</th>
              <th className="text-left px-4 py-3 font-semibold">Fees</th>
              <th className="text-left px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const g = guardians.find(x => x.id === s.guardian_id);
              return (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><strong className="text-gray-900">{s.first_name} {s.last_name}</strong><br/><span className="text-xs text-gray-500">{s.gender} · {s.dob}</span></td>
                  <td className="px-4 py-3 font-mono text-gray-600">{s.student_id}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-indigo-100 text-indigo-900 rounded font-bold text-xs">{s.class_name}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{g ? `${g.first_name} ${g.last_name}` : "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded ${s.fee_status === 'cleared' ? 'bg-green-100 text-green-900' : s.fee_status === 'partial' ? 'bg-yellow-100 text-yellow-900' : 'bg-red-100 text-red-900'}`}>{s.fee_status}</span></td>
                  <td className="px-4 py-3"><button onClick={() => openEdit(s)} className="px-2 py-1 text-indigo-600 font-bold text-xs hover:bg-indigo-50 rounded mr-2">Edit</button><button onClick={() => handleDelete(s)} className="px-2 py-1 text-red-600 font-bold text-xs hover:bg-red-50 rounded">Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* HEADER WITH TABS */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Student Admission</h2>
              <p className="text-sm text-gray-700 mb-4">Fill in the form below. All starred (*) fields are required.</p>

              <div className="flex gap-2 border-t pt-3">
                {(['basic','admission','contact','health','social','previous','relations','guardian'] as FormTab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-all ${
                      tab === t
                        ? 'bg-white border-indigo-600 text-indigo-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900'
                    }`}>
                    {t === 'basic' ? '1. Basic' : t === 'admission' ? '2. Admission' : t === 'contact' ? '3. Contact' : t === 'health' ? '4. Health' : t === 'social' ? '5. Social' : t === 'previous' ? '6. Previous' : t === 'relations' ? '7. Relations' : '8. Guardian'}
                  </button>
                ))}
              </div>
            </div>

            {/* FORM CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

              {/* SECTION 1: BASIC INFORMATION */}
              {tab === 'basic' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: BASIC INFORMATION</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">First Name *</label>
                      <input type="text" placeholder="e.g. Kwame" value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Last Name *</label>
                      <input type="text" placeholder="e.g. Asante" value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Other Names */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Other Names</label>
                      <input type="text" placeholder="Middle names" value={form.other_names} onChange={(e) => setForm({...form, other_names: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Date of Birth *</label>
                      <input type="date" value={form.dob} onChange={(e) => setForm({...form, dob: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Gender *</label>
                      <select value={form.gender ?? 'male'} onChange={(e) => setForm({...form, gender: e.target.value as 'male' | 'female'})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    {/* Student Image */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Student Image</label>
                      <input type="file" accept="image/jpg,image/png"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-medium focus:border-indigo-500 focus:outline-none" />
                      <p className="text-xs text-gray-500 mt-1">JPG or PNG format</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: ADMISSION DETAILS */}
              {tab === 'admission' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: ADMISSION DETAILS</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Admission Date */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Admission Date *</label>
                      <input type="date" value={form.admission_date ?? ''} onChange={(e) => setForm({...form, admission_date: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Admission Number */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Admission Number *</label>
                      <input type="text" value={form.student_id} onChange={(e) => setForm({...form, student_id: e.target.value})} disabled={!!editing}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none disabled:bg-gray-100" />
                    </div>

                    {/* Select a Course */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Select a Course</label>
                      <select value={form.course_group_id ?? ''} onChange={(e) => setForm({...form, course_group_id: e.target.value || undefined})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        <option value="">— Select —</option>
                        {courseGroups.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    {/* Select a Class */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Select a Class *</label>
                      <select value={form.class_name} onChange={(e) => setForm({...form, class_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Student Category */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Student Category</label>
                      <select value={form.category ?? 'Day'} onChange={(e) => setForm({...form, category: e.target.value as any})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        {STUDENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Student House */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Student House</label>
                      <select value={form.student_house ?? ''} onChange={(e) => setForm({...form, student_house: e.target.value || undefined})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        <option value="">— Select —</option>
                        {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: CONTACT DETAILS */}
              {tab === 'contact' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: CONTACT DETAILS</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Country */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Country</label>
                      <select value={form.country ?? 'Ghana'} onChange={(e) => setForm({...form, country: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Nationality</label>
                      <input type="text" placeholder="e.g. Ghanaian" value={form.nationality ?? ''} onChange={(e) => setForm({...form, nationality: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* State / Province / Region */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">State / Province / Region</label>
                      <input type="text" placeholder="e.g. Greater Accra" value={form.state_province ?? ''} onChange={(e) => setForm({...form, state_province: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">City</label>
                      <input type="text" placeholder="e.g. Accra" value={form.residential_city ?? ''} onChange={(e) => setForm({...form, residential_city: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-gray-900 mb-2">Address</label>
                      <textarea placeholder="Street address" value={form.address ?? ''} onChange={(e) => setForm({...form, address: e.target.value})} rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Student's Mobile Number */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Student's Mobile Number</label>
                      <input type="tel" placeholder="0244000000" value={form.mobile_no ?? ''} onChange={(e) => setForm({...form, mobile_no: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Email</label>
                      <input type="email" placeholder="student@email.com" value={form.email ?? ''} onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Can Receive SMS */}
                    <div className="flex items-center pt-3">
                      <input type="checkbox" id="sms" checked={form.can_receive_sms ?? false} onChange={(e) => setForm({...form, can_receive_sms: e.target.checked})}
                        className="w-5 h-5 mr-3 rounded border-2 border-gray-300" />
                      <label htmlFor="sms" className="font-bold text-gray-900">Student Can Receive SMS</label>
                    </div>

                    {/* Can Receive Email */}
                    <div className="flex items-center pt-3">
                      <input type="checkbox" id="email" checked={form.can_receive_email ?? false} onChange={(e) => setForm({...form, can_receive_email: e.target.checked})}
                        className="w-5 h-5 mr-3 rounded border-2 border-gray-300" />
                      <label htmlFor="email" className="font-bold text-gray-900">Student Can Receive Email</label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: BASIC HEALTH INFO */}
              {tab === 'health' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: BASIC HEALTH INFO</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Any Allergies */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Any Allergies</label>
                      <textarea placeholder="e.g. Peanuts, Dairy" value={form.allergies ?? ''} onChange={(e) => setForm({...form, allergies: e.target.value})} rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Special Health Needs */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Special Health Needs</label>
                      <textarea placeholder="e.g. Asthma, requires inhaler" value={form.special_health_needs ?? ''} onChange={(e) => setForm({...form, special_health_needs: e.target.value})} rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: OTHER SOCIAL INFO */}
              {tab === 'social' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: OTHER SOCIAL INFO</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hometown */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Hometown</label>
                      <input type="text" placeholder="e.g. Kumasi" value={form.hometown ?? ''} onChange={(e) => setForm({...form, hometown: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Religion */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Religion</label>
                      <select value={form.religion ?? ''} onChange={(e) => setForm({...form, religion: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        <option value="">— Select —</option>
                        {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    {/* Language Spoken */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-gray-900 mb-2">Language Spoken</label>
                      <input type="text" placeholder="e.g. English, Twi, Ga" value={form.language_spoken ?? ''} onChange={(e) => setForm({...form, language_spoken: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                      <p className="text-xs text-gray-500 mt-1">Separate multiple with commas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: STUDENT'S PREVIOUS EDUCATION */}
              {tab === 'previous' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: STUDENT'S PREVIOUS EDUCATION</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name of School */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Name of School</label>
                      <input type="text" placeholder="e.g. ABC Primary School" value={form.previous_school ?? ''} onChange={(e) => setForm({...form, previous_school: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Year of Leaving */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Year of Leaving</label>
                      <input type="number" placeholder="e.g. 2023" value={form.year_of_leaving_previous_school ?? ''} onChange={(e) => setForm({...form, year_of_leaving_previous_school: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>

                    {/* Last Batch / Class */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Last Batch / Class</label>
                      <input type="text" placeholder="e.g. Class 6" value={form.previous_class ?? ''} onChange={(e) => setForm({...form, previous_class: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: OTHER RELATIONS */}
              {tab === 'relations' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: OTHER RELATIONS</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Select Sibling Class */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Select Sibling Class</label>
                      <select value={form.sibling_id ?? ''} onChange={(e) => setForm({...form, sibling_id: e.target.value || undefined})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        <option value="">— No Sibling —</option>
                        {students.filter(s => s.id !== editing?.id).map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.class_name})</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: GUARDIAN */}
              {tab === 'guardian' && (
                <div className="space-y-5 max-w-3xl">
                  <div className="bg-indigo-100 px-4 py-3 rounded-lg border-l-4 border-indigo-600">
                    <h3 className="font-black text-gray-900 text-lg">SECTION: SELECT GUARDIAN</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Select Guardian Dropdown */}
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Select Guardian</label>
                      <select value={form.guardian_id ?? ''} onChange={(e) => { setForm({...form, guardian_id: e.target.value || undefined}); setAddingNewGuardian(false); }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                        <option value="">— Select Existing Guardian —</option>
                        {guardians.map(g => <option key={g.id} value={g.id}>{g.first_name} {g.last_name} ({g.relationship})</option>)}
                      </select>
                    </div>

                    {/* Add New Guardian Button */}
                    {!form.guardian_id && (
                      <button type="button" onClick={() => setAddingNewGuardian(!addingNewGuardian)}
                        className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 w-full">
                        {addingNewGuardian ? '✓ Cancel' : '+ Add New Guardian'}
                      </button>
                    )}

                    {/* Guardian Preview (if selected) */}
                    {form.guardian_id && (
                      <div className="border-2 border-indigo-200 bg-indigo-50 p-4 rounded-lg">
                        {guardians.find(g => g.id === form.guardian_id) && (
                          <>
                            <h4 className="font-black text-gray-900 mb-3">Selected Guardian</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div><span className="font-bold text-gray-700">Name:</span> <span className="text-gray-900">{guardians.find(g => g.id === form.guardian_id)?.first_name} {guardians.find(g => g.id === form.guardian_id)?.last_name}</span></div>
                              <div><span className="font-bold text-gray-700">Relation:</span> <span className="text-gray-900">{guardians.find(g => g.id === form.guardian_id)?.relationship}</span></div>
                              <div><span className="font-bold text-gray-700">Phone:</span> <span className="text-gray-900">{guardians.find(g => g.id === form.guardian_id)?.phone || '—'}</span></div>
                              <div><span className="font-bold text-gray-700">Email:</span> <span className="text-gray-900">{guardians.find(g => g.id === form.guardian_id)?.email || '—'}</span></div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* New Guardian Form (if adding) */}
                    {addingNewGuardian && (
                      <>
                        <div className="border-t-2 border-gray-200 pt-5 mt-5">
                          <h4 className="font-black text-gray-900 mb-4 bg-indigo-100 px-4 py-2 rounded-lg">GUARDIAN BASIC INFO</h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Guardian First Name */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">First Name *</label>
                              <input type="text" placeholder="e.g. John" value={newGuardian.first_name} onChange={(e) => setNewGuardian({...newGuardian, first_name: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Guardian Last Name */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Last Name *</label>
                              <input type="text" placeholder="e.g. Doe" value={newGuardian.last_name} onChange={(e) => setNewGuardian({...newGuardian, last_name: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Relation to Student */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Relation to Student *</label>
                              <select value={newGuardian.relationship} onChange={(e) => setNewGuardian({...newGuardian, relationship: e.target.value as GuardianRelationship})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none">
                                {GUARDIAN_RELATIONSHIPS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                              </select>
                            </div>

                            {/* Guardian Username */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Guardian Username</label>
                              <input type="text" placeholder="e.g. john.doe" value={newGuardian.username} onChange={(e) => setNewGuardian({...newGuardian, username: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-gray-200 pt-5 mt-5">
                          <h4 className="font-black text-gray-900 mb-4 bg-indigo-100 px-4 py-2 rounded-lg">GUARDIAN CONTACT DETAILS</h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Occupation */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Occupation</label>
                              <input type="text" placeholder="e.g. Engineer" value={newGuardian.occupation} onChange={(e) => setNewGuardian({...newGuardian, occupation: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Mobile Number */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Mobile Number</label>
                              <input type="tel" placeholder="0244000000" value={newGuardian.phone} onChange={(e) => setNewGuardian({...newGuardian, phone: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Telephone */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Telephone</label>
                              <input type="tel" placeholder="0244000000" value={newGuardian.alt_phone} onChange={(e) => setNewGuardian({...newGuardian, alt_phone: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Email</label>
                              <input type="email" placeholder="guardian@email.com" value={newGuardian.email} onChange={(e) => setNewGuardian({...newGuardian, email: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-black text-gray-900 mb-2">Address</label>
                              <textarea placeholder="Guardian address" value={newGuardian.address} onChange={(e) => setNewGuardian({...newGuardian, address: e.target.value})} rows={2}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-indigo-500 focus:outline-none" />
                            </div>

                            {/* Guardian Photo */}
                            <div>
                              <label className="block text-sm font-black text-gray-900 mb-2">Guardian Photo</label>
                              <input type="file" accept="image/jpg,image/png"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-medium focus:border-indigo-500 focus:outline-none" />
                              <p className="text-xs text-gray-500 mt-1">JPG or PNG format</p>
                            </div>

                            {/* Guardian Can Receive SMS */}
                            <div className="flex items-center pt-3">
                              <input type="checkbox" id="g-sms" checked={newGuardian.can_receive_sms} onChange={(e) => setNewGuardian({...newGuardian, can_receive_sms: e.target.checked})}
                                className="w-5 h-5 mr-3 rounded border-2 border-gray-300" />
                              <label htmlFor="g-sms" className="font-bold text-gray-900">Guardian Can Receive SMS</label>
                            </div>

                            {/* Guardian Can Receive Email */}
                            <div className="flex items-center pt-3">
                              <input type="checkbox" id="g-email" checked={newGuardian.can_receive_email} onChange={(e) => setNewGuardian({...newGuardian, can_receive_email: e.target.checked})}
                                className="w-5 h-5 mr-3 rounded border-2 border-gray-300" />
                              <label htmlFor="g-email" className="font-bold text-gray-900">Guardian Can Receive Email</label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">{editing ? 'Update Student' : 'Admit Student'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
