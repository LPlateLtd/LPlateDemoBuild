"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { absUrl } from "@/lib/url";

// Prevent prerender errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const sb = createSupabaseBrowser();

  useEffect(() => {
    (async () => {
      try {
        console.log('[AUTH] Starting callback processing...');
        
        // Wait for Supabase to process the URL hash tokens
        // This is important for email verification links
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session first to ensure tokens are processed
        const { data: { session }, error: sessionError } = await sb.auth.getSession();
        
        if (sessionError) {
          console.error('[AUTH] Session error:', sessionError);
          router.replace("/sign-in?error=auth_failed");
          return;
        }

        if (!session) {
          console.error('[AUTH] No session found');
          // Wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await sb.auth.getSession();
          if (!retrySession) {
            console.error('[AUTH] Still no session after retry');
            router.replace("/sign-in?error=no_session");
            return;
          }
        }

        // Now get the user
        const { data: { user }, error: userError } = await sb.auth.getUser();

        if (userError) {
          console.error('[AUTH] Auth error:', userError);
          router.replace("/sign-in?error=auth_failed");
          return;
        }

        if (!user?.id || !user.email) {
          console.error('[AUTH] No user or missing user data:', { user });
          router.replace("/sign-in?error=no_user");
          return;
        }

        // Check if user already has a profile
        const { data: existingProfile, error: profileError } = await sb
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        console.log('[AUTH] User authenticated:', { 
          id: user.id, 
          email: user.email, 
          emailVerified: user.email_confirmed_at,
          roleParam,
          hasProfile: !!existingProfile
        });

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[AUTH] Profile error:', profileError);
          router.replace("/sign-in?error=profile_failed");
          return;
        }

        // If user has an existing profile, redirect to their dashboard
        if (existingProfile) {
          console.log('[AUTH] Profile exists, redirecting to dashboard');
          // Redirect based on role
          const profileRole = (existingProfile as { role: string }).role;
          if (profileRole === "instructor") {
            router.replace("/instructor");
          } else {
            router.replace("/dashboard");
          }
          return;
        }

        // If no existing profile, this is a new user signup
        // For magic link signups, we need to redirect to password setup
        // Check if this is a magic link signup (no password set yet)
        const needsPassword = !user.user_metadata?.has_password;
        
        if (needsPassword || roleParam) {
          // New user - redirect to password setup with role
          console.log('[AUTH] New user signup, redirecting to password setup');
          const passwordSetupUrl = `/auth/reset-password?role=${roleParam || "learner"}`;
          router.replace(passwordSetupUrl);
          return;
        }

        // Fallback: create profile and redirect to profile setup
        console.log('[AUTH] Creating new profile for user:', user.id);
        const { error: insertError } = await (sb.from("profiles") as any).insert({
          id: user.id,
          role: (roleParam || "learner") as "learner" | "instructor",
          name: user.email.split("@")[0],
          email: user.email,
        });

        if (insertError) {
          console.error('[AUTH] Insert profile error:', insertError);
          router.replace("/sign-in?error=profile_creation_failed");
          return;
        }
        console.log('[AUTH] Profile created successfully');
        
        // Small delay to ensure profile creation is complete before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect new users to profile setup
        if (roleParam === "instructor") {
          console.log('[AUTH] Redirecting to instructor profile');
          router.replace("/instructor/profile");
        } else {
          console.log('[AUTH] Redirecting to learner profile');
          router.replace("/learner/profile");
        }
      } catch (error) {
        console.error('[AUTH] Unexpected error in auth callback:', error);
        router.replace("/sign-in?error=unexpected");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Verifying your email...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we sign you in</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
