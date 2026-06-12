"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import type { BusRunDirection } from "@/lib/types";

// Phase 15f — driver app. Designed for one-handed use in a moving vehicle:
// big tap targets, only the relevant button visible at each step. Uses the
// browser's Geolocation API when available; falls back to event-only when
// permission is denied.

export default function DriverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' && navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only drivers, admins or principals can open the driver app. Anyone else
  // gets bounced back to login so the public can't start fake bus runs.
  useEffect(() => {
    if (!loading && !user) { router.replace("/login?role=driver"); return; }
    if (!loading && user && !['driver', 'admin', 'principal'].includes(user.role)) {
      router.replace(`/${user.role}`);
    }
  }, [user, loading, router]);

  if (loading || !user || !['driver', 'admin', 'principal'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-purple-950">
        <p className="text-purple-200 text-sm">Loading driver app…</p>
      </div>
    );
  }
  return <DriverPageInner isOnline={isOnline} />;
}

function DriverPageInner({ isOnline }: { isOnline: boolean }) {
  const { logout } = useAuth();
  const router2 = useRouter();
  const pingDriver = useAppStore((s) => s.pingDriver);
  const handleSignOut = async () => {
    await logout();
    router2.replace("/login");
  };
  const routes = useAppStore((s) => s.busRoutes);
  const stops = useAppStore((s) => s.busStops);
  const runs = useAppStore((s) => s.busRuns);
  const startBusRun = useAppStore((s) => s.startBusRun);
  const arriveAtStop = useAppStore((s) => s.arriveAtStop);
  const departStop = useAppStore((s) => s.departStop);
  const completeBusRun = useAppStore((s) => s.completeBusRun);
  const pingBusLocation = useAppStore((s) => s.pingBusLocation);
  const recordBusBoarding = useAppStore((s) => s.recordBusBoarding);
  const students = useAppStore((s) => s.students);
  const attendance = useAppStore((s) => s.attendance);

  const [search, setSearch] = useState("");
  const [showRoll, setShowRoll] = useState(false);

  const [routeId, setRouteId] = useState<string>(routes[0]?.id ?? "");
  const route = routes.find((r) => r.id === routeId);

  // Auto-create bus run for today if one doesn't exist
  useEffect(() => {
    if (!route) return;
    const today = new Date().toISOString().slice(0, 10);
    const existingRun = runs.find((r) => r.route_id === route.id && r.date === today);
    if (!existingRun) {
      startBusRun(route.id, "pickup");
    }
  }, [route, runs, startBusRun]);

  const today = new Date().toISOString().slice(0, 10);
  const activeRun = useMemo(
    () => runs.find((r) => r.route_id === routeId && r.date === today && r.status === "in_progress"),
    [runs, routeId, today],
  );

  const orderedStops = useMemo(() => {
    const list = stops.filter((s) => s.route_id === routeId).sort((a, b) => a.order - b.order);
    return activeRun?.direction === "dropoff" ? [...list].reverse() : list;
  }, [stops, routeId, activeRun?.direction]);

  // Track the current stop being approached (the next_stop_id on the run) or
  // the one most recently arrived at (current_stop_id) if waiting at it.
  const [atStop, setAtStop] = useState(false);
  useEffect(() => { setAtStop(false); }, [activeRun?.next_stop_id]);

  const currentStop = orderedStops.find((s) => s.id === (atStop ? activeRun?.current_stop_id : activeRun?.next_stop_id));

  // Background GPS pings every 30s while a run is active.
  useEffect(() => {
    if (!activeRun) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const interval = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => pingBusLocation(activeRun.id, pos.coords.latitude, pos.coords.longitude),
        () => { /* ignore — driver may have denied permission */ },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    }, 30000);
    return () => window.clearInterval(interval);
  }, [activeRun, pingBusLocation]);

  const getLocation = (): Promise<{ lat?: number; lng?: number }> => new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });

  const onStart = async (direction: BusRunDirection) => {
    if (!route) { toast.error("Pick a route first."); return; }
    if (orderedStops.length === 0) { toast.error("This route has no stops yet — ask admin to add some."); return; }
    startBusRun(route.id, direction);
    toast.success(`${direction === "pickup" ? "🌅 Morning pickup" : "🌇 Afternoon drop-off"} started.`);
  };

  const onArrive = async () => {
    if (!activeRun || !currentStop) return;
    const loc = await getLocation();
    arriveAtStop(activeRun.id, currentStop.id, loc.lat, loc.lng);
    setAtStop(true);
    toast.success(`Arrived at ${currentStop.name}`);
  };

  const onDepart = async () => {
    if (!activeRun || !currentStop) return;
    const loc = await getLocation();
    departStop(activeRun.id, currentStop.id, loc.lat, loc.lng);
    setAtStop(false);
    toast.success(`Departed ${currentStop.name}`);
  };

  const onComplete = async () => {
    if (!activeRun) return;
    if (!window.confirm("Mark this run as completed?")) return;
    const loc = await getLocation();
    completeBusRun(activeRun.id, loc.lat, loc.lng);
    toast.success("Run completed. Drive safe 🙏");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-950 to-black text-white p-6 safe-top safe-bottom">
      <div className="max-w-md mx-auto space-y-4">
        <header className="flex items-center justify-between pt-4">
          <Link href="/" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">← Home</Link>
          <div className="text-center">
            <h1 className="text-2xl font-black">🚌 Driver</h1>
            <p className="text-[10px] text-purple-300">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" })}</p>
          </div>
          <button type="button" onClick={handleSignOut}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300">
            🚪 Sign out
          </button>
        </header>

        <section className="rounded-2xl p-4 bg-white/5">
          <label className="block">
            <span className="block text-xs font-bold text-purple-200 mb-1">Route</span>
            <select className="input"
              aria-label="Route"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}>
              <option value="">— select your route —</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}{r.bus_label ? ` · ${r.bus_label}` : ""}</option>
              ))}
            </select>
          </label>
          {route?.driver_name && (
            <p className="text-[11px] text-purple-300 mt-2">Driver on file: {route.driver_name}</p>
          )}
          {routes.length === 0 && (
            <div className="mt-3 rounded-lg p-3 text-xs bg-amber-500/15 border border-amber-500/40 text-amber-300">
              <p className="font-bold">No routes set up yet.</p>
              <p className="mt-1">Ask your school admin to open <span className="font-mono">/admin/transport</span> and create your route + stops. Once they save, your route will appear here.</p>
            </div>
          )}
        </section>

        {!activeRun ? (
          <section className="rounded-2xl p-4 space-y-2 bg-white/5">
            <p className="text-xs text-purple-200 mb-2">Tap the direction you&apos;re running now:</p>
            <button type="button" onClick={() => onStart("pickup")}
              className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-br from-green-600 to-green-400 text-green-950">
              🌅 Start morning pickup
            </button>
            <button type="button" onClick={() => onStart("dropoff")}
              className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-br from-amber-500 to-yellow-300 text-amber-950">
              🌇 Start afternoon drop-off
            </button>
          </section>
        ) : (
          <>
            {!isOnline && (
              <section className="rounded-2xl p-3 text-center bg-red-500/15 border border-red-500/40">
                <p className="text-xs text-red-300">📴 No internet connection — recording events only</p>
              </section>
            )}

            <section className="rounded-2xl p-4 text-center bg-emerald-500/15 border border-emerald-500/40">
              <p className="text-xs text-emerald-200 mb-1">🟢 LIVE — {activeRun.direction === "pickup" ? "Morning pickup" : "Afternoon drop-off"}</p>
              {currentStop ? (
                <>
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider">{atStop ? "Currently at" : "Heading to"}</p>
                  <p className="text-2xl font-black">{currentStop.name}</p>
                  {(atStop ? currentStop.scheduled_pickup : currentStop.scheduled_pickup) && activeRun.direction === "pickup" && (
                    <p className="text-[11px] text-emerald-300 mt-1">Scheduled: {currentStop.scheduled_pickup}</p>
                  )}
                  {!atStop && currentStop && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(currentStop.name ?? "next stop")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="block text-[10px] text-blue-300 font-bold mt-2 hover:underline">
                      🗺️ Open in Maps
                    </a>
                  )}
                </>
              ) : (
                <p className="text-lg font-bold">All stops done — finish the run.</p>
              )}
            </section>

            {currentStop && (
              <section className="space-y-2">
                {!atStop ? (
                  <button type="button" onClick={onArrive}
                    className="w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-br from-blue-500 to-blue-400 text-white">
                    ✋ Arrived at {currentStop.name}
                  </button>
                ) : (
                  <button type="button" onClick={onDepart}
                    className="w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-br from-purple-600 to-purple-400 text-white">
                    ➡️ Departed {currentStop.name}
                  </button>
                )}
              </section>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowRoll((r) => !r)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-yellow-500/15 border border-yellow-500/40 text-yellow-400">
                {showRoll ? "Hide roll call" : "🎒 Mark students on/off bus"}
              </button>
              <button type="button"
                onClick={() => {
                  activeRun && pingDriver(activeRun.route_id ?? "", "Driver", "🆘 EMERGENCY — Driver needs immediate assistance");
                  toast.success("SOS sent to school admin — immediate assistance requested.");
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm animate-pulse bg-red-500/25 border-2 border-red-500 text-red-300">
                🆘 SOS
              </button>
            </div>

            {showRoll && (
              <section className="rounded-2xl p-3 bg-white/5">
                <input value={search}
                  aria-label="Search students"
                  placeholder="Search student name or class…"
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full mb-2 px-3 py-2 rounded-lg text-sm bg-white/5 text-white border border-white/10" />
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {students
                    .filter((s) => {
                      if (!search.trim()) return true;
                      const q = search.toLowerCase();
                      return s.full_name.toLowerCase().includes(q) || s.class_name.toLowerCase().includes(q);
                    })
                    .slice(0, 40)
                    .map((s) => {
                      const today = new Date().toISOString().slice(0, 10);
                      const onBus = attendance.some((a) => a.student_id === s.id && a.date === today && a.context === 'bus');
                      return (
                        <div key={s.id} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg ${onBus ? "bg-emerald-500/10" : "bg-white/3"}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{s.full_name}</p>
                            <p className="text-[10px] text-purple-300">{s.class_name}</p>
                          </div>
                          {onBus ? (
                            <button type="button"
                              onClick={() => activeRun && recordBusBoarding(activeRun.id, s.id, 'off')}
                              className="text-[11px] font-bold px-2 py-1 rounded-md bg-amber-500/15 text-amber-400">
                              Off bus
                            </button>
                          ) : (
                            <button type="button"
                              onClick={() => activeRun && recordBusBoarding(activeRun.id, s.id, 'on')}
                              className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white">
                              ✓ On bus
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
                <p className="text-[10px] mt-2 text-purple-300">Each tick marks the student present today (context: bus) — visible to admins and parents.</p>
              </section>
            )}

            <button type="button" onClick={onComplete}
              className="w-full py-3 rounded-xl font-bold text-sm bg-red-500/15 border border-red-500/40 text-red-300">
              🏁 Finish run
            </button>

            <p className="text-[10px] text-purple-300 text-center">
              GPS pings every 30s · parents see your status live
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        .input { width: 100%; border: 1px solid rgba(255,255,255,0.15); border-radius: 0.5rem; padding: 0.6rem 0.8rem; font-size: 1rem; background: rgba(255,255,255,0.05); color: white; }
        .input:focus { outline: none; border-color: rgb(167,139,250); }
      `}</style>
    </div>
  );
}
