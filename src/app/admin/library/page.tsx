"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Admin library — catalog management + issue / return tracking.
// Three tabs: 📖 Catalog, 📤 Issue book, 🔁 Active loans.

type Tab = "catalog" | "issue" | "loans";

export default function AdminLibraryPage() {
  const { user } = useAuth();
  const books = useAppStore((s) => s.libraryBooks);
  const loans = useAppStore((s) => s.libraryLoans);
  const students = useAppStore((s) => s.students);
  const addLibraryBook = useAppStore((s) => s.addLibraryBook);
  const updateLibraryBook = useAppStore((s) => s.updateLibraryBook);
  const deleteLibraryBook = useAppStore((s) => s.deleteLibraryBook);
  const issueLibraryBook = useAppStore((s) => s.issueLibraryBook);
  const returnLibraryBook = useAppStore((s) => s.returnLibraryBook);

  const [tab, setTab] = useState<Tab>("catalog");

  // Catalog state
  const [bookForm, setBookForm] = useState({ title: "", author: "", isbn: "", category: "Fiction", copies: "1", cover: "" });
  const handleAddBook = () => {
    if (!bookForm.title.trim()) { toast.error("Book title required"); return; }
    const copies = Math.max(1, parseInt(bookForm.copies, 10) || 1);
    addLibraryBook({
      title: bookForm.title.trim(),
      author: bookForm.author.trim() || undefined,
      isbn: bookForm.isbn.trim() || undefined,
      category: bookForm.category,
      copies_total: copies,
      cover_image_url: bookForm.cover.trim() || undefined,
    });
    toast.success(`📖 "${bookForm.title}" added`);
    setBookForm({ title: "", author: "", isbn: "", category: "Fiction", copies: "1", cover: "" });
  };

  // Issue state
  const [issueBookId, setIssueBookId] = useState("");
  const [issueStudentId, setIssueStudentId] = useState("");
  const [issueDue, setIssueDue] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10);
  });

  const activeLoans = useMemo(() => loans.filter((l) => l.status === "out"), [loans]);

  const copiesAvailable = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return 0;
    const out = activeLoans.filter((l) => l.book_id === bookId).length;
    return book.copies_total - out;
  };

  const handleIssue = () => {
    const book = books.find((b) => b.id === issueBookId);
    const student = students.find((s) => s.id === issueStudentId);
    if (!book || !student) { toast.error("Pick a book and a student"); return; }
    if (copiesAvailable(book.id) <= 0) { toast.error("All copies are checked out"); return; }
    issueLibraryBook({
      book_id: book.id,
      book_title: book.title,
      borrower_student_id: student.id,
      borrower_name: student.full_name,
      borrower_class: student.class_name,
      due_at: issueDue,
      issued_by: user?.full_name,
    });
    toast.success(`📤 "${book.title}" issued to ${student.full_name}`);
    setIssueStudentId("");
  };

  const overdueCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return activeLoans.filter((l) => l.due_at < today).length;
  }, [activeLoans]);

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">📚 Library</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {books.length} title{books.length === 1 ? "" : "s"} · {activeLoans.length} on loan
            {overdueCount > 0 && <> · <span className="text-amber-400 font-bold">{overdueCount} overdue</span></>}
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["catalog", "issue", "loans"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: tab === t ? "#1A0E4D" : "rgba(255,255,255,0.06)",
                color: tab === t ? "white" : "rgba(196,181,253,0.85)",
                border: `1px solid ${tab === t ? "#1A0E4D" : "rgba(255,255,255,0.12)"}`,
              }}>
              {t === "catalog" ? `📖 Catalog (${books.length})` : t === "issue" ? "📤 Issue book" : `🔁 On loan (${activeLoans.length})`}
            </button>
          ))}
        </div>
      </div>

      {tab === "catalog" && (
        <>
          <div className="glass rounded-2xl p-5 mb-4">
            <h3 className="font-black text-white mb-3">➕ Add a book</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-white/80">Title *</span>
                <input value={bookForm.title}
                  aria-label="Book title"
                  placeholder="e.g. The Lion and the Jewel"
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-white/80">Author</span>
                <input value={bookForm.author}
                  aria-label="Author"
                  placeholder="e.g. Wole Soyinka"
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900" />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-white/80">Category</span>
                <select value={bookForm.category} aria-label="Category"
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900">
                  {["Fiction", "Non-Fiction", "Reference", "Science", "Mathematics", "Languages", "History", "Religious", "Children's", "Other"].map((c) =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-white/80">Copies</span>
                <input type="number" min={1} value={bookForm.copies}
                  aria-label="Copies"
                  onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold text-white/80">Cover image URL (optional)</span>
                <input value={bookForm.cover}
                  aria-label="Cover URL"
                  placeholder="https://…"
                  onChange={(e) => setBookForm({ ...bookForm, cover: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900" />
              </label>
            </div>
            <button type="button" onClick={handleAddBook}
              className="mt-3 btn-gold text-sm py-2 px-5">+ Add to catalog</button>
          </div>

          {books.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-sm text-gray-500">
              No books yet — add your first title above.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {books.map((b) => {
                const onLoan = activeLoans.filter((l) => l.book_id === b.id).length;
                const available = b.copies_total - onLoan;
                return (
                  <div key={b.id} className="glass rounded-2xl p-4">
                    {b.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.cover_image_url} alt={b.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                    )}
                    <h4 className="font-bold text-white text-sm">{b.title}</h4>
                    <p className="text-[11px] text-gray-400">{b.author ?? "—"} · {b.category}</p>
                    <p className="text-[11px] mt-1">
                      <span className="font-bold" style={{ color: available > 0 ? "#10b981" : "#ef4444" }}>
                        {available} of {b.copies_total} available
                      </span>
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <button type="button"
                        onClick={() => {
                          const n = parseInt(window.prompt("New total copies:", String(b.copies_total)) ?? "", 10);
                          if (n > 0) updateLibraryBook(b.id, { copies_total: n });
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-800">Edit copies</button>
                      <button type="button"
                        onClick={() => {
                          if (onLoan > 0) { toast.error(`${onLoan} copies still on loan`); return; }
                          if (!window.confirm(`Delete "${b.title}"?`)) return;
                          deleteLibraryBook(b.id);
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded-md bg-red-100 text-red-700">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "issue" && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-black text-white mb-3">📤 Issue a book</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-xs font-bold text-white/80">Book *</span>
              <select value={issueBookId} aria-label="Book"
                onChange={(e) => setIssueBookId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900">
                <option value="">— select —</option>
                {books.map((b) => {
                  const avail = copiesAvailable(b.id);
                  return <option key={b.id} value={b.id} disabled={avail <= 0}>{b.title}{b.author ? ` — ${b.author}` : ""} ({avail} avail)</option>;
                })}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-white/80">Student *</span>
              <select value={issueStudentId} aria-label="Student"
                onChange={(e) => setIssueStudentId(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900">
                <option value="">— select —</option>
                {[...students].sort((a, b) => a.full_name.localeCompare(b.full_name)).map((s) =>
                  <option key={s.id} value={s.id}>{s.full_name} · {s.class_name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-white/80">Due back *</span>
              <input type="date" value={issueDue}
                aria-label="Due date"
                onChange={(e) => setIssueDue(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-gray-900" />
            </label>
          </div>
          <button type="button" onClick={handleIssue} className="btn-gold text-sm py-2 px-6">📤 Issue book</button>
        </div>
      )}

      {tab === "loans" && (
        <>
          {activeLoans.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-sm text-gray-500">
              No books out right now 📚
            </div>
          ) : (
            <div className="grid gap-2">
              {activeLoans.sort((a, b) => a.due_at.localeCompare(b.due_at)).map((l) => {
                const today = new Date().toISOString().slice(0, 10);
                const overdue = l.due_at < today;
                return (
                  <div key={l.id} className="glass rounded-2xl p-3 flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{l.book_title}</p>
                      <p className="text-[11px] text-gray-400">
                        {l.borrower_name}{l.borrower_class ? ` · ${l.borrower_class}` : ""} · issued {new Date(l.issued_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full"
                      style={{
                        background: overdue ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)",
                        color: overdue ? "#fca5a5" : "#fcd34d",
                      }}>
                      Due {l.due_at}{overdue ? " · overdue" : ""}
                    </span>
                    <button type="button"
                      onClick={() => { returnLibraryBook(l.id); toast.success(`✅ "${l.book_title}" returned`); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "#10b981", color: "white" }}>
                      ✅ Mark returned
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
