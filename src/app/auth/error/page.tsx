"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { absUrl } from "@/lib/url";
import Logo from "@/components/ui/Logo";

export const dynamic = 'force-dynamic';

function ErrorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const msgParam = params.get("msg");
  const roleParam = params.get("role");
  const emailParam = params.get("email");
  const phoneParam = params.get("phone");
  const sb = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  // Auto-populate email from URL if available
  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [emailParam]);

  // Auto-populate phone from URL if available
  useEffect(() => {
    if (phoneParam) {
      setMobileNumber(decodeURIComponent(phoneParam));
    }
  }, [phoneParam]);

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

  // Parse error message to provide helpful context
  function getErrorMessage() {
    if (!msgParam) {
      return "This verification link is invalid or has expired.";
    }
    
    const decodedMsg = decodeURIComponent(msgParam);
    
    // Categorize common errors
    if (decodedMsg.includes("code verifier") || decodedMsg.includes("non-empty")) {
      return "This link was opened in a different browser or device. Please request a new verification link in the same browser where you signed up.";
    }
    
    if (decodedMsg.includes("expired") || decodedMsg.includes("invalid")) {
      return "This verification link has expired or is invalid. Please request a new one.";
    }
    
    if (decodedMsg.includes("already been used") || decodedMsg.includes("consumed")) {
      return "This verification link has already been used. Email scanners may have consumed it. Please request a new link.";
    }
    
    return decodedMsg;
  }

  // Get helpful explanation based on error type
  function getHelpText() {
    const decodedMsg = msgParam ? decodeURIComponent(msgParam) : "";
    
    if (decodedMsg.includes("code verifier") || decodedMsg.includes("non-empty")) {
      return "For security, verification links must be opened in the same browser where you requested them. If you're using a different device, please request a new link.";
    }
    
    if (decodedMsg.includes("expired")) {
      return "Verification links expire after a short time for security. Request a new link below.";
    }
    
    if (decodedMsg.includes("already been used") || decodedMsg.includes("consumed")) {
      return "Some email services scan links for security, which can consume verification links. Request a fresh link below.";
    }
    
    return "Don't worry! You can request a new verification link below. Make sure to check your spam folder.";
  }

  async function handleResend() {
    if (!email || countdown > 0) return;
    
    setErr(null);
    setResending(true);
    
    try {
      const redirectUrl = absUrl(`/welcome?role=${roleParam || "learner"}${mobileNumber ? `&phone=${encodeURIComponent(mobileNumber)}` : ''}`);
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
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (error) {
      setErr("An unexpected error occurred. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" variant="horizontal" />
        </div>
        
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-4xl">⚠</span>
          </div>
          
          <h2 className="text-3xl font-semibold text-gray-900">Verification Failed</h2>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
            <p className="text-red-800 text-base font-medium mb-2">
              {getErrorMessage()}
            </p>
            <p className="text-red-700 text-sm">
              {getHelpText()}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            {roleParam && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            )}

            {err && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm text-center font-medium">{err}</p>
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 text-base font-semibold">New verification link sent!</p>
                </div>
                <p className="text-green-700 text-sm">
                  Check your email inbox. The link may take 2-3 minutes to arrive. Don't forget to check your spam folder.
                </p>
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={!email || countdown > 0 || resending}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-5 px-6 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend verification link (${countdown}s)`
              ) : (
                "Resend verification link"
              )}
            </button>

            <div className="pt-4 space-y-2">
              <a
                href="/sign-in"
                className="inline-block text-gray-600 text-base hover:text-gray-900 transition-colors font-medium"
              >
                ← Back to sign in
              </a>
              <div className="text-center">
                <a
                  href="mailto:Staff@lplateapp.com?subject=Verification%20Link%20Issue&body=Hi,%20I'm%20having%20trouble%20with%20my%20verification%20link."
                  className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
                >
                  Need Support?
                </a>
              </div>
            </div>
          </div>
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

