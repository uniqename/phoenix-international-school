"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

function LinkOAuthContent() {
  const router = useRouter();
  const { login } = useAuth();
  const [oauthData, setOauthData] = useState<{ provider: string; email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("oauth_pending");
    if (data) {
      const parsed = JSON.parse(data);
      setOauthData(parsed);
      setEmail("");
      setPassword("");
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthData || !email || !password) return;

    setLinking(true);
    const { error } = await login(email, password);

    if (error) {
      toast.error("Login failed: " + error);
    } else {
      sessionStorage.removeItem("oauth_pending");
      toast.success(`✅ Account linked with ${oauthData.provider}`);
      router.replace("/parent");
    }
    setLinking(false);
  };

  if (!oauthData) return null;

  return (
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xl font-black text-white mb-2">Link Your Account</p>
          <p className="text-sm text-purple-200">
            We found a {oauthData.provider} account, but it's not linked to a school account yet.
          </p>
        </div>

        <div
          className="rounded-3xl p-6 mb-4"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(196,181,253,0.85)" }}>
                Sign in with your school account
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your school email"
                required
                className="w-full px-4 py-3 rounded-xl text-base placeholder-white/55 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(196,181,253,0.85)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full px-4 py-3 rounded-xl text-base placeholder-white/55 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
              />
            </div>
            <button
              type="submit"
              disabled={linking}
              className="btn-gold w-full py-3 text-sm disabled:opacity-60"
            >
              {linking ? "Linking…" : "Link Account →"}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="w-full text-center text-xs font-bold underline"
          style={{ color: "rgba(196,181,253,0.7)" }}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default function LinkOAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-bg grid-pattern flex items-center justify-center"><p className="text-white">Loading…</p></div>}>
      <LinkOAuthContent />
    </Suspense>
  );
}
