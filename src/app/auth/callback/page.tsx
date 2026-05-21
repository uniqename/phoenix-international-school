"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = params.get("code");
        const state = params.get("state");
        const provider = params.get("provider") || "google";

        if (!code) {
          setError("No authorization code received");
          setLoading(false);
          return;
        }

        // Exchange authorization code for OAuth tokens
        // In production, this would call your backend API to securely exchange the code
        // For now, we'll simulate successful OAuth authentication
        const response = await fetch("/api/auth/oauth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state, provider }),
        }).catch(() => null);

        if (!response?.ok) {
          // Fallback: simulate OAuth success for demo purposes
          // In production, link OAuth identity to existing account
          const oauthEmail = `oauth.${provider}@example.com`;

          // Try to find matching family account or create a new one
          const families = useAppStore.getState().families;
          const matchingFamily = families.find(
            (f) =>
              f.primary_email === oauthEmail ||
              f.secondary_email === oauthEmail
          );

          if (matchingFamily) {
            // Auto-login with the OAuth account
            const { error } = await login(oauthEmail, `oauth_${provider}`);
            if (error) {
              setError(error);
            } else {
              toast.success(`Signed in with ${provider}`);
              router.replace("/parent");
            }
          } else {
            // No matching account, ask user to link
            sessionStorage.setItem("oauth_pending", JSON.stringify({
              provider,
              email: oauthEmail,
            }));
            router.replace("/auth/link");
          }
        } else {
          const data = await response.json();
          if (data.user) {
            toast.success(`Signed in with ${provider}`);
            router.replace(`/${data.user.role}`);
          } else {
            setError("Failed to authenticate");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "OAuth callback failed");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [params, router, login]);

  return (
    <>
      {loading && (
        <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-bold mb-4">🔄 Signing you in…</p>
            <div className="animate-spin inline-block w-8 h-8 border-3 border-purple-400 border-t-gold rounded-full"></div>
          </div>
        </div>
      )}
      {error && (
        <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <p className="text-red-400 font-bold mb-4">❌ {error}</p>
            <button
              onClick={() => router.replace("/login")}
              className="btn-gold px-6 py-2"
            >
              Return to login
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-bg grid-pattern flex items-center justify-center"><p className="text-white">Loading…</p></div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
