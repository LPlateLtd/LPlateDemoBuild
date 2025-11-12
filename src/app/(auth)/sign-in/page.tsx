"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { absUrl } from "@/lib/url";

function SignInContent() {
  const sb = createSupabaseBrowser();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState<"learner" | "instructor">("learner");
  const [rememberMe, setRememberMe] = useState(true);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check for error messages from URL params
  useEffect(() => {
    const error = params.get("error");
    const message = params.get("message");
    if (error && message) {
      setErr(decodeURIComponent(message));
      // Clear URL params after showing error
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [params]);

  // Start countdown when email is sent
  useEffect(() => {
    if (sent) {
      setCountdown(60);
    }
  }, [sent]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    try {
      const { error } = await sb.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setErr(error.message);
      else {
        // Redirect to dashboard or home page
        window.location.href = "/";
      }
    } catch {
      setErr("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    try {
      // Use /auth/verify for magic link signups - dedicated verification page
      const redirectUrl = absUrl(`/auth/verify?role=${role}${mobileNumber ? `&phone=${encodeURIComponent(mobileNumber)}` : ''}`);
      console.log('[SIGNUP] Generated redirect URL:', redirectUrl);
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: redirectUrl
        }
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
    <div className="min-h-screen bg-white flex items-start justify-center px-6 pt-4">
      <div className="w-full max-w-sm">
        {/* Log In / Sign Up Toggle */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative bg-gray-200 rounded-full p-1 flex w-full max-w-xs">
            {/* Sliding Background */}
            <div 
              className={`absolute top-1 bottom-1 w-1/2 bg-green-600 rounded-full transition-transform duration-300 ease-in-out ${
                mode === "signup" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            
            {/* Log In Button */}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setSent(false);
                setErr(null);
              }}
              className={`relative z-10 flex-1 py-4 px-6 rounded-full text-xl font-semibold transition-colors duration-300 ${
                mode === "login"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Log In
            </button>
            
            {/* Sign Up Button */}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setSent(false);
                setErr(null);
              }}
              className={`relative z-10 flex-1 py-4 px-6 rounded-full text-xl font-semibold transition-colors duration-300 ${
                mode === "signup"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Welcome Message - Hide on signup email confirmation */}
        {!(mode === "signup" && sent) && (
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-4">
            {mode === "login" ? "Welcome back! 🚘" : "🎊 Join L Plate! 🎊"}
          </h1>
        )}

        {mode === "signup" && sent ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Check your email</h2>
            <p className="text-gray-600 text-lg -mt-1">
              We&apos;ve sent link to <strong className="text-gray-900">{email}</strong>
            </p>
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <button 
                onClick={() => {
                  if (countdown === 0) {
                    setSent(false);
                    setCountdown(0);
                  }
                }}
                disabled={countdown > 0}
                className={`text-lg font-medium transition-colors duration-200 ${
                  countdown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                {countdown > 0 ? `Try again (${countdown}s)` : "Try again"}
              </button>
            </div>
            <p className="text-gray-500 text-base">
              Emails may take a few minutes, when it arrives click the link to verify your account.
            </p>
          </div>
        ) : (
          <form onSubmit={mode === "login" ? submitLogin : (e) => e.preventDefault()} className="space-y-3">
            {/* Email Field */}
            <div>
              <input
                type="email"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mobile Number Field - Only for Sign Up */}
            {mode === "signup" && (
              <div>
                <input
                  type="tel"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Role Selection Prompt - Only for Sign Up */}
            {mode === "signup" && (
              <div className="text-center py-0">
                <p className="text-lg font-medium text-gray-900">Are you a...</p>
              </div>
            )}

            {/* Password Field - Only for Login */}
            {mode === "login" && (
              <div>
                <input
                  type="password"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Role Selection Buttons - Only for Sign Up */}
            {mode === "signup" && (
              <div className="space-y-2">
                {/* Learner Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setRole("learner");
                    setErr(null);
                    setLoading(true);
                    try {
                      const redirectUrl = absUrl(`/auth/verify?role=learner${mobileNumber ? `&phone=${encodeURIComponent(mobileNumber)}` : ''}`);
                      const { error } = await sb.auth.signInWithOtp({
                        email,
                        options: { 
                          emailRedirectTo: redirectUrl
                        }
                      });
                      if (error) setErr(error.message);
                      else setSent(true);
                    } catch {
                      setErr("An unexpected error occurred");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !email}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading && role === "learner" ? "Creating account..." : "Learner >"}
                </button>
                
                {/* Or Divider */}
                <div className="text-center py-0">
                  <p className="text-lg font-medium text-gray-600">or</p>
                </div>
                
                {/* Instructor Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setRole("instructor");
                    setErr(null);
                    setLoading(true);
                    try {
                      const redirectUrl = absUrl(`/auth/verify?role=instructor${mobileNumber ? `&phone=${encodeURIComponent(mobileNumber)}` : ''}`);
                      const { error } = await sb.auth.signInWithOtp({
                        email,
                        options: { 
                          emailRedirectTo: redirectUrl
                        }
                      });
                      if (error) setErr(error.message);
                      else setSent(true);
                    } catch {
                      setErr("An unexpected error occurred");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !email}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading && role === "instructor" ? "Creating account..." : "Instructor >"}
                </button>
              </div>
            )}

            {/* Remember Me Toggle - Only for Login */}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-base font-medium text-gray-900">Remember me</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-base text-center">{err}</p>
              </div>
            )}

            {/* Submit Button - Only for Login */}
            {mode === "login" && (
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            )}

            {/* Forgot Password Link - Only for Login */}
            {mode === "login" && (
              <div className="text-center">
                <a
                  href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="text-green-600 text-lg font-medium hover:text-green-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}
          </form>
        )}

          {/* Need Help Button */}
          <div className="mt-3 text-center">
            <a
              href="mailto:Staff@lplateapp.com"
              className="text-green-600 text-lg font-medium hover:text-green-700 transition-colors"
            >
              Need Support?
            </a>
          </div>

          {/* Dynamic Car Image for Sign Up - Moved to bottom */}
          {mode === "signup" && (
            <div className="flex justify-center mt-6">
              <Image 
                src={role === "learner" ? "/CarSprout.png" : "/CarPro.png"} 
                alt={role === "learner" ? "Learner car with graduation cap" : "Instructor car"} 
                width={128} 
                height={128} 
                className="w-32 h-32 object-contain transition-all duration-300" 
              />
            </div>
          )}
        </div>
      </div>
    );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
