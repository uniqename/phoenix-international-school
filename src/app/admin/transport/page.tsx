"use client";
import { useMemo, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV as NAV } from "@/lib/adminNav";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

// Phase 15f — bus tracking admin: manage routes, stops, driver assignment, and
// see today's live run status per route.

export default function TransportPage() {
  const routes = useAppStore((s) => s.busRoutes);
  const stops = useAppStore((s) => s.busStops);
  const runs = useAppStore((s) => s.busRuns);
  const events = useAppStore((s) => s.busEvents);
  const addBusRoute = useAppStore((s) => s.addBusRoute);
  const updateBusRoute = useAppStore((s) => s.updateBusRoute);
  const deleteBusRoute = useAppStore((s) => s.deleteBusRoute);
  const addBusStop = useAppStore((s) => s.addBusStop);
  const updateBusStop = useAppStore((s) => s.updateBusStop);
  const deleteBusStop = useAppStore((s) => s.deleteBusStop);

  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const activeRoute = routes.find((r) => r.id === activeRouteId) ?? routes[0];

  const activeStops = useMemo(
    () => stops.filter((s) => s.route_id === activeRoute?.id).sort((a, b) => a.order - b.order),
    [stops, activeRoute?.id],
  );

  const todaysRun = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return runs.find((r) => r.route_id === activeRoute?.id && r.date === today && r.status === "in_progress");
  }, [runs, activeRoute?.id]);

  const handleAddRoute = () => {
    const name = window.prompt("Route name (e.g. Route A — Tema → Spintex):");
    if (!name?.trim()) return;
    const route = addBusRoute({ name: name.trim() });
    setActiveRouteId(route.id);
    toast.success("Route added");
  };

  const handleAddStop = () => {
    if (!activeRoute) return;
    const name = window.prompt("Stop name:");
    if (!name?.trim()) return;
    addBusStop({
      route_id: activeRoute.id,
      name: name.trim(),
      order: activeStops.length,
    });
  };

  return (
    <DashboardShell role="admin" navItems={NAV}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">🚌 Transport &amp; Bus Tracking</h2>
          <p className="text-xs text-gray-500 mt-0.5">Routes, stops, driver assignments, and today&apos;s live run status.</p>
        </div>
        <button type="button" onClick={handleAddRoute} className="btn-gold text-xs py-2 px-5">+ New Route</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <aside className="glass rounded-2xl p-3 md:col-span-1 max-h-[70vh] overflow-y-auto">
          {routes.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No routes yet — click + New Route.</p>
          ) : routes.map((r) => {
            const isActive = r.id === activeRoute?.id;
            const today = new Date().toISOString().slice(0, 10);
            const live = runs.some((run) => run.route_id === r.id && run.date === today && run.status === "in_progress");
            return (
              <button key={r.id} type="button" onClick={() => setActiveRouteId(r.id)}
                className="w-full text-left p-3 rounded-xl mb-1 transition-all"
                style={{
                  background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm text-white truncate">{r.name}</span>
                  {live && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">🟢 LIVE</span>}
                </div>
                <div className="text-[11px] text-gray-400">{r.bus_label ?? "No bus assigned"} · {r.driver_name ?? "No driver"}</div>
              </button>
            );
          })}
        </aside>

        <section className="md:col-span-2 space-y-4">
          {!activeRoute ? (
            <div className="glass rounded-2xl p-12 text-center text-sm text-gray-500">
              Add a route to get started.
            </div>
          ) : (
            <>
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-white">{activeRoute.name}</h3>
                  <button type="button"
                    onClick={() => {
                      if (window.confirm(`Delete route "${activeRoute.name}" and all its stops?`)) {
                        deleteBusRoute(activeRoute.id);
                        setActiveRouteId(null);
                        toast.success("Route deleted");
                      }
                    }}
                    className="text-[11px] font-bold px-2 py-1 rounded-md bg-red-100 text-red-700">Delete route</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[11px] font-bold text-white/80 mb-1">Bus label / plate</span>
                    <input className="input" value={activeRoute.bus_label ?? ""}
                      onChange={(e) => updateBusRoute(activeRoute.id, { bus_label: e.target.value })}
                      placeholder="Bus #1 · GR 1234-22" />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] font-bold text-white/80 mb-1">Driver name</span>
                    <input className="input" value={activeRoute.driver_name ?? ""}
                      onChange={(e) => updateBusRoute(activeRoute.id, { driver_name: e.target.value })}
                      placeholder="Mr. Kwesi" />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] font-bold text-white/80 mb-1">Driver phone</span>
                    <input className="input" value={activeRoute.driver_phone ?? ""}
                      onChange={(e) => updateBusRoute(activeRoute.id, { driver_phone: e.target.value })}
                      placeholder="0244 …" />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] font-bold text-white/80 mb-1">Conductor (optional)</span>
                    <input className="input" value={activeRoute.conductor_name ?? ""}
                      onChange={(e) => updateBusRoute(activeRoute.id, { conductor_name: e.target.value })}
                      placeholder="Auntie Mansa" />
                  </label>
                </div>
                {todaysRun && (
                  <div className="mt-3 rounded-lg p-3 text-xs"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
                    🟢 <span className="font-bold">Live now:</span> {todaysRun.direction === "pickup" ? "Morning pickup" : "Afternoon drop-off"} — last update {todaysRun.current_ping_at ? new Date(todaysRun.current_ping_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-white">Stops ({activeStops.length})</h3>
                  <button type="button" onClick={handleAddStop} className="btn-gold text-xs py-1.5 px-3">+ Add Stop</button>
                </div>
                {activeStops.length === 0 ? (
                  <p className="text-xs text-gray-500">No stops yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {activeStops.map((s, i) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <span className="text-xs font-bold w-6 text-white/60">{i + 1}.</span>
                        <input className="input flex-1" value={s.name}
                          onChange={(e) => updateBusStop(s.id, { name: e.target.value })}
                          placeholder="Stop name" />
                        <input className="input w-24" type="time" value={s.scheduled_pickup ?? ""}
                          aria-label="Pickup time"
                          onChange={(e) => updateBusStop(s.id, { scheduled_pickup: e.target.value })} />
                        <input className="input w-24" type="time" value={s.scheduled_dropoff ?? ""}
                          aria-label="Dropoff time"
                          onChange={(e) => updateBusStop(s.id, { scheduled_dropoff: e.target.value })} />
                        <button type="button" onClick={() => deleteBusStop(s.id)}
                          className="text-[11px] font-bold px-2 py-1 rounded-md text-red-400" title="Delete stop">🗑️</button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="glass rounded-2xl p-4 text-xs text-gray-400 flex items-center justify-between flex-wrap gap-3">
                <span>
                  Drivers open the driver app on their phone, pick this route, and tap <span className="font-bold text-white">Start run</span>. Parents see live status under <span className="font-mono text-purple-300">/parent#bus</span>.
                </span>
                <a href="/driver" target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ background: "linear-gradient(135deg,#d4af37,#f4d76e)", color: "#1A0E4D" }}>
                  🚌 Open driver app →
                </a>
              </div>

              {/* Recent driver events for this route — boarding log + stop history */}
              {(() => {
                const routeRunIds = runs.filter((r) => r.route_id === activeRoute.id).map((r) => r.id);
                const recent = events.filter((e) => routeRunIds.includes(e.run_id)).slice(0, 30);
                if (recent.length === 0) return null;
                return (
                  <div className="glass rounded-2xl p-4">
                    <h3 className="font-black text-white mb-2">📜 Recent driver events</h3>
                    <ul className="space-y-1.5 max-h-72 overflow-y-auto">
                      {recent.map((e) => (
                        <li key={e.id} className="text-xs flex items-center gap-2 py-1 px-2 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.04)" }}>
                          <span className="text-base">
                            {e.kind === "started" ? "🟢" : e.kind === "completed" ? "🏁" : e.kind === "arrived_stop" ? "🚏" : e.kind === "departed_stop" ? "➡️" : "⚠️"}
                          </span>
                          <span className="flex-1 truncate text-white/80">
                            {e.stop_name ?? e.note ?? e.kind.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {new Date(e.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .input { width: 100%; border: 1px solid rgba(255,255,255,0.12); border-radius: 0.5rem; padding: 0.45rem 0.65rem; font-size: 0.85rem; background: rgba(255,255,255,0.04); color: white; }
        .input:focus { outline: none; border-color: rgba(167,139,250,0.6); }
        .btn-gold { background: linear-gradient(135deg, #d4af37, #f4d76e); color: #1A0E4D; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; }
      `}</style>
    </DashboardShell>
  );
}
