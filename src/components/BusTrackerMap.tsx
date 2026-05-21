"use client";
import { useState, useEffect } from "react";
import type { BusRun, BusRoute, BusStop } from "@/lib/types";

interface BusTrackerMapProps {
  run: BusRun | null;
  route: BusRoute | null;
  stops: BusStop[];
}

export default function BusTrackerMap({ run, route, stops }: BusTrackerMapProps) {
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setRefreshTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!run || !route) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-xl text-gray-500">
        <div className="text-center">
          <p className="text-2xl mb-2">🚌</p>
          <p className="text-sm">No active bus run</p>
        </div>
      </div>
    );
  }

  const routeStops = stops.filter((s) => s.route_id === route.id);
  const currentStop = routeStops.find((s) => s.id === run.current_stop_id);
  const nextStop = routeStops.find((s) => s.id === run.next_stop_id);
  const isPickup = run.direction === "pickup";

  return (
    <div className="space-y-4">
      {/* Map Placeholder - Can integrate Google Maps / Leaflet here */}
      <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-200 flex items-center justify-center overflow-hidden">
        <div className="text-center z-10">
          <p className="text-4xl mb-2">📍</p>
          <p className="text-sm text-blue-900 font-bold">
            {currentStop?.name || "Tracking..."}
          </p>
          {run.current_lat && run.current_lng && (
            <p className="text-[10px] text-blue-700 mt-1">
              {run.current_lat.toFixed(4)}, {run.current_lng.toFixed(4)}
            </p>
          )}
        </div>
        <div className="absolute inset-0 opacity-5">
          {/* Background grid pattern */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="black"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Bus Info */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-600">Bus</p>
            <p className="font-bold text-gray-900">{route.bus_label || "Bus #1"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Direction</p>
            <p className="font-bold text-gray-900">
              {isPickup ? "🌅 Pickup" : "🌆 Drop-off"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Status</p>
            <p className={`font-bold text-sm ${run.status === 'completed' ? 'text-green-600' : run.status === 'in_progress' ? 'text-blue-600' : 'text-gray-600'}`}>
              {run.status === "in_progress"
                ? "🟢 Live"
                : run.status === "completed"
                ? "✅ Done"
                : "📅 Scheduled"}
            </p>
          </div>
        </div>

        {/* Route Stops */}
        <div className="border-t pt-3">
          <p className="text-xs font-bold text-gray-700 mb-2">
            Route: {routeStops.length} stops
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {routeStops.map((stop, idx) => {
              const isCurrent = stop.id === run.current_stop_id;
              const isNext = stop.id === run.next_stop_id;
              return (
                <div
                  key={stop.id}
                  className={`flex items-center gap-2 p-2 rounded text-xs transition ${
                    isCurrent
                      ? "bg-green-50 border-l-4 border-green-500"
                      : isNext
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "bg-gray-50 border-l-4 border-gray-200"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      isCurrent
                        ? "text-green-600"
                        : isNext
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {isCurrent ? "📍" : isNext ? "🎯" : `${idx + 1}.`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {stop.name}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      {isPickup && stop.scheduled_pickup
                        ? `Pickup: ${stop.scheduled_pickup}`
                        : !isPickup && stop.scheduled_dropoff
                        ? `Drop-off: ${stop.scheduled_dropoff}`
                        : "No scheduled time"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Info */}
        {route.driver_name && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Driver</p>
                <p className="font-bold text-gray-900">{route.driver_name}</p>
              </div>
              {route.driver_phone && (
                <a
                  href={`tel:${route.driver_phone}`}
                  className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full hover:bg-green-200 transition"
                >
                  📞 Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-center pt-2 border-t text-[10px] text-gray-500">
          Last updated: {refreshTime.toLocaleTimeString("en-GB")}
          <p className="text-[9px]">Refreshes every 30 seconds</p>
        </div>
      </div>

      {/* Integration Note */}
      <div className="bg-blue-50 rounded-lg p-3 text-[10px] text-blue-900 border border-blue-200">
        <p className="font-bold mb-1">💡 Map Integration</p>
        <p>
          To add a live map, integrate Google Maps API or Leaflet with the bus
          GPS coordinates (current_lat/lng). The tracking data updates every 30s.
        </p>
      </div>
    </div>
  );
}
