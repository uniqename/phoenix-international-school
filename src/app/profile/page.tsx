"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardShell role={user.role} navItems={[]}>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">👤 My Profile</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(147,51,234,0.95)" }}>
            View and manage your account information.
          </p>
        </header>

        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Full Name</label>
            <div className="mt-2 text-lg font-semibold text-gray-900">{user.full_name}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Email</label>
            <div className="mt-2 text-lg font-semibold text-gray-900">{user.email}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Role</label>
            <div className="mt-2 text-lg font-semibold text-gray-900 capitalize">{user.role}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Account Status</label>
            <div className="mt-2 text-lg font-semibold">
              {user.is_active ? (
                <span className="text-green-600">✓ Active</span>
              ) : (
                <span className="text-red-600">✗ Inactive</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-4">
              To change your password or other settings, contact your administrator.
            </p>
            <Link href={`/${user.role}`} className="btn-gold text-sm py-2 px-4 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
