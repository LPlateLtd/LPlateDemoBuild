"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Logo from "@/components/ui/Logo";

export const dynamic = 'force-dynamic';

function WelcomeContent() {
  const sb = createSupabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const phoneParam = params.get("phone");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if we have a valid session for password setup
    const checkSession = async () => {
      try {
        console.log('[WELCOME] Checking session for password setup...');
        
        // Wait for Supabase to process the URL hash tokens
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session
        const { data: { session }, error: sessionError } = await sb.auth.getSession();
        
        if (sessionError) {
          console.error('[WELCOME] Session error:', sessionError);
          setErr("Invalid or expired link. Please request a new signup.");
          return;
        }
        
        if (session) {
          console.log('[WELCOME] Valid session found:', { user: session.user?.email });
          setIsValidSession(true);
        } else {
          // Wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await sb.auth.getSession();
          if (retrySession) {
            console.log('[WELCOME] Session found on retry:', { user: retrySession.user?.email });
            setIsValidSession(true);
          } else {
            console.log('[WELCOME] No valid session found');
            setErr("Invalid or expired link. Please request a new signup.");
          }
        }
      } catch (error) {
        console.error('[WELCOME] Unexpected error:', error);
        setErr("Invalid or expired link. Please request a new signup.");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [sb.auth]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    setIsSubmitting(true);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setErr("Password must be at least 6 characters long");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { error } = await sb.auth.updateUser({
        password: password
      });
      if (error) {
        setErr(error.message);
        setIsSubmitting(false);
      } else {
        // Password updated successfully
        console.log('[WELCOME] Password updated successfully');
        
        // Create profile for new user
        if (roleParam) {
          console.log('[WELCOME] Creating profile for new user with role:', roleParam);
          
          // Get the current user
          const { data: { user } } = await sb.auth.getUser();
          if (user) {
            // Create profile for new user
            const { error: profileError } = await (sb.from("profiles") as any).insert({
              id: user.id,
              role: roleParam as "learner" | "instructor",
              name: user.email?.split("@")[0] || "User",
              email: user.email,
              phone: phoneParam || null,
            });
            
            if (profileError) {
              console.error('[WELCOME] Profile creation error:', profileError);
              setErr("Password updated but failed to create profile. Please contact support.");
              setIsSubmitting(false);
              return;
            }
            
            console.log('[WELCOME] Profile created successfully, redirecting to profile setup');
            // Redirect to profile setup based on role
            if (roleParam === "instructor") {
              router.push("/instructor/profile");
            } else {
              router.push("/learner/profile");
            }
          } else {
            setErr("Password updated but user not found. Please try signing in.");
            setIsSubmitting(false);
          }
        } else {
          // No role param - default to learner
          console.log('[WELCOME] No role param, defaulting to learner');
          const { data: { user } } = await sb.auth.getUser();
          if (user) {
            const { error: profileError } = await (sb.from("profiles") as any).insert({
              id: user.id,
              role: "learner",
              name: user.email?.split("@")[0] || "User",
              email: user.email,
              phone: phoneParam || null,
            });
            
            if (profileError) {
              console.error('[WELCOME] Profile creation error:', profileError);
              setErr("Password updated but failed to create profile. Please contact support.");
              setIsSubmitting(false);
              return;
            }
            
            router.push("/learner/profile");
          } else {
            setErr("Password updated but user not found. Please try signing in.");
            setIsSubmitting(false);
          }
        }
      }
    } catch {
      setErr("An unexpected error occurred");
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size="lg" variant="horizontal" />
          </div>
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Invalid Link</h2>
            <p className="text-gray-600 text-base">
              {err || "This link is invalid or has expired."}
            </p>
            <a
              href="/sign-in"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen when submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Creating your account...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we redirect you</p>
        </div>
      </div>
    );
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
          🎉 Welcome to L Plate!
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          Set your password to complete your {roleParam || "learner"} account setup.
        </p>

        <form onSubmit={submit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <input
              type="password"
              className="w-full border-2 border-gray-300 rounded-xl px-5 py-5 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <input
              type="password"
              className="w-full border-2 border-gray-300 rounded-xl px-5 py-5 text-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:shadow-lg shadow-md transition-all duration-300 hover:shadow-lg"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Error Message */}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-base text-center">{err}</p>
            </div>
          )}

          {/* Complete Setup Button */}
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-5 px-6 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? "Setting up account..." : "Complete Account Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}

