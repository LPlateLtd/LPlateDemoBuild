"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { absUrl } from "@/lib/url";

export const dynamic = 'force-dynamic';

function ErrorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const msgParam = params.get("msg");
  const roleParam = params.get("role");
  const sb = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  // Start countdown when resend is successful
  useEffect(() => {
    if (resendSuccess) {
      setCountdown(45);
    }
  }, [resendSuccess]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function handleResend() {
    if (!email || countdown > 0) return;
    
    setErr(null);
    setResending(true);
    
    try {
      const redirectUrl = absUrl(`/welcome?role=${roleParam || "learner"}`);
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        setErr(error.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch {
      setErr("An unexpected error occurred");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-red-600 text-3xl">⚠</span>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900">Verification Failed</h2>
        
        <p className="text-gray-600 text-base">
          {msgParam ? decodeURIComponent(msgParam) : "This verification link is invalid or has expired."}
        </p>

        <div className="space-y-4 pt-4">
          <div>
            <input
              type="email"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm text-center">{err}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-600 text-sm text-center">New verification link sent! Check your email.</p>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={!email || countdown > 0 || resending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : countdown > 0 ? `Resend (${countdown}s)` : "Resend verification link"}
          </button>

          <a
            href="/sign-in"
            className="inline-block text-gray-600 text-sm hover:text-gray-900 transition-colors"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

