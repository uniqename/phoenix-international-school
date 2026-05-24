"use client";
import DashboardShell from "@/components/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardShell role={user.role} navItems={[]}>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-black text-white">🔔 Notifications</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(147,51,234,0.95)" }}>
            Stay updated with your latest alerts and announcements.
          </p>
        </header>

        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h2>
            <p className="text-gray-500 mb-6">
              You're all caught up! Check back soon for updates from your school.
            </p>
            <Link href={`/${user.role}`} className="btn-gold text-sm py-2 px-4">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📢 Notification Settings</h3>
          <p className="text-sm text-gray-600 mb-4">
            Notification preferences can be configured in your profile settings. Contact your administrator if you need help.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
