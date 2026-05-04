"use client";
export default function OfflinePage() {
  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <div className="text-6xl mb-5 animate-float">🦅</div>
        <h1 className="text-2xl font-black text-white mb-2">You&apos;re Offline</h1>
        <p className="text-blue-300 text-sm mb-7">
          No internet connection. Your data is saved locally and will sync automatically when you reconnect.
        </p>

        <div className="glass rounded-2xl p-5 text-left mb-7">
          <p className="text-xs font-black text-yellow-400 mb-3">✅ Still available offline</p>
          <div className="space-y-1.5">
            {["View grades & homework", "Mark attendance", "Write lesson plans", "Review fee records", "Browse school announcements"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="text-green-400">•</span> {item}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-gold text-sm py-2.5 px-8 w-full">
          Try Again
        </button>
      </div>
    </div>
  );
}
