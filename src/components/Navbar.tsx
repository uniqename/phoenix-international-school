"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg,#FFD700,#E5B800)" }}>
            🦅
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Phoenix International</div>
            <div className="text-[10px] text-blue-300 leading-tight tracking-widest uppercase">School Ghana</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link href="/login?role=admin"    className="nav-link">Admin</Link>
          <Link href="/login?role=teacher"  className="nav-link">Teacher</Link>
          <Link href="/login?role=parent"   className="nav-link">Parent</Link>
          <Link href="/login?role=student"  className="nav-link">Student</Link>
          <Link href="/bece"                className="nav-link">BECE Prep</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-gold text-sm py-2 px-5">Sign In</Link>
        </div>

        <button type="button" className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>
      {open && (
        <div className="md:hidden glass-dark border-t border-white/10 px-6 py-4 flex flex-col gap-3">
          <Link href="/login?role=admin"   className="nav-link py-2" onClick={() => setOpen(false)}>Admin Portal</Link>
          <Link href="/login?role=teacher" className="nav-link py-2" onClick={() => setOpen(false)}>Teacher Portal</Link>
          <Link href="/login?role=parent"  className="nav-link py-2" onClick={() => setOpen(false)}>Parent Portal</Link>
          <Link href="/login?role=student" className="nav-link py-2" onClick={() => setOpen(false)}>Student Portal</Link>
          <Link href="/bece"               className="nav-link py-2" onClick={() => setOpen(false)}>BECE Prep</Link>
          <Link href="/login"              className="btn-gold text-sm py-2 px-5 text-center" onClick={() => setOpen(false)}>Sign In</Link>
        </div>
      )}
    </nav>
  );
}
