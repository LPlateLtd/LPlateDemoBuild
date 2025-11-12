"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Logo from "@/components/ui/Logo";
import { absUrl } from "@/lib/url";

function ForgotPasswordContent() {
  const sb = createSupabaseBrowser();
  const params = useSearchParams();
  const emailParam = params.get("email");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill email from URL parameter
  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [emailParam]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: absUrl("/auth/reset-password"),
      });
      if (error) setErr(error.message);
      else setSent(true);
    } catch {
      setErr("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" variant="horizontal" />
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-8">
          🔑 Reset Password
        </h1>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
            <p className="text-gray-600 text-lg">
              We&apos;ve sent a password reset link to <strong className="text-gray-900">{email}</strong>
            </p>
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <p className="text-gray-500 text-base">
              Click the link in your email to reset your password
            </p>
            
            <button 
              onClick={() => setSent(false)}
              className="text-green-600 text-lg font-medium hover:text-green-700 transition-colors duration-200"
            >
              Try again
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            {/* Email Field */}
            <div>
              <input
                type="email"
                className="w-full border-2 border-gray-300 rounded-xl px-5 py-5 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {err && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-base text-center">{err}</p>
              </div>
            )}

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-5 px-6 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </button>

            {/* Back to Sign In Link */}
            <div className="text-center">
              <a
                href="/sign-in"
                className="text-green-600 text-base font-medium hover:text-green-700 transition-colors"
              >
                Back to sign in
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
