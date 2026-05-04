"use client";
import { useState, useEffect } from "react";

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] py-2.5 px-4 text-center text-xs font-bold text-white"
      style={{ background: "rgba(10,22,40,0.97)", borderTop: "1px solid rgba(255,215,0,0.35)" }}>
      📶 You&apos;re offline — data is saved locally and will sync when you reconnect.
    </div>
  );
}
