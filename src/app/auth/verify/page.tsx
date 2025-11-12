"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

// Prevent prerender errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role");
  const phoneParam = params.get("phone");
  const sb = createSupabaseBrowser();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed) {
      console.log('[VERIFY] Already processed, skipping...');
      return;
    }
    
    (async () => {
      setHasProcessed(true);
      try {
        console.log('[VERIFY] Starting email verification processing...');
        console.log('[VERIFY] Current URL:', window.location.href);
        console.log('[VERIFY] URL hash:', window.location.hash);
        
        // Check for errors in the hash first
        const hash = window.location.hash;
        if (hash.includes('error=')) {
          const errorMatch = hash.match(/error=([^&]+)/);
          const errorCodeMatch = hash.match(/error_code=([^&]+)/);
          const errorDescMatch = hash.match(/error_description=([^&]+)/);
          
          const error = errorMatch ? decodeURIComponent(errorMatch[1]) : 'unknown';
          const errorCode = errorCodeMatch ? decodeURIComponent(errorCodeMatch[1]) : '';
          const errorDesc = errorDescMatch ? decodeURIComponent(errorDescMatch[1].replace(/\+/g, ' ')) : '';
          
          console.error('[VERIFY] Error in URL hash:', { error, errorCode, errorDesc });
          
          if (errorCode === 'otp_expired' || error === 'access_denied') {
            router.replace("/sign-in?error=link_expired&message=" + encodeURIComponent("This verification link has expired. Please request a new one."));
            return;
          }
          
          router.replace("/sign-in?error=verification_failed&message=" + encodeURIComponent(errorDesc || "Verification failed. Please try again."));
          return;
        }
        
        // Check if we have hash tokens in the URL
        const hasHashTokens = window.location.hash.includes('access_token') || 
                             window.location.hash.includes('type=recovery') ||
                             window.location.hash.includes('type=signup');
        
        if (hasHashTokens) {
          console.log('[VERIFY] Hash tokens detected, waiting for Supabase to process...');
          // Wait longer for Supabase to process the URL hash tokens
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          // No hash tokens - might be coming from homepage redirect
          console.log('[VERIFY] No hash tokens in URL, checking for existing session...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Get the session first to ensure tokens are processed
        const { data: { session }, error: sessionError } = await sb.auth.getSession();
        
        if (sessionError) {
          console.error('[VERIFY] Session error:', sessionError);
          router.replace("/sign-in?error=auth_failed");
          return;
        }

        if (!session) {
          console.error('[VERIFY] No session found');
          // If we have hash tokens, wait longer and try again
          if (hasHashTokens) {
            console.log('[VERIFY] Retrying with longer wait for hash token processing...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            const { data: { session: retrySession } } = await sb.auth.getSession();
            if (!retrySession) {
              console.error('[VERIFY] Still no session after retry');
              // Try one more time with even longer wait
              await new Promise(resolve => setTimeout(resolve, 2000));
              const { data: { session: finalSession } } = await sb.auth.getSession();
              if (!finalSession) {
                console.error('[VERIFY] No session after multiple retries');
                router.replace("/sign-in?error=no_session");
                return;
              }
            }
          } else {
            console.error('[VERIFY] No hash tokens and no session');
            router.replace("/sign-in?error=no_session");
            return;
          }
        }

        // Now get the user
        const { data: { user }, error: userError } = await sb.auth.getUser();

        if (userError) {
          console.error('[VERIFY] Auth error:', userError);
          router.replace("/sign-in?error=auth_failed");
          return;
        }

        if (!user?.id || !user.email) {
          console.error('[VERIFY] No user or missing user data:', { user });
          router.replace("/sign-in?error=no_user");
          return;
        }

        console.log('[VERIFY] User authenticated:', { 
          id: user.id, 
          email: user.email, 
          emailVerified: user.email_confirmed_at,
          roleParam
        });

        // Check if user already has a profile
        const { data: existingProfile, error: profileError } = await sb
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[VERIFY] Profile error:', profileError);
          router.replace("/sign-in?error=profile_failed");
          return;
        }

        // If user has an existing profile, redirect to their dashboard
        if (existingProfile) {
          console.log('[VERIFY] Profile exists, redirecting to dashboard');
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
        // Redirect to welcome page for password setup
        const finalRole = roleParam || "learner";
        console.log('[VERIFY] New user signup, redirecting to welcome page', { role: finalRole, phone: phoneParam });
        let welcomeUrl = `/welcome?role=${finalRole}`;
        if (phoneParam) {
          welcomeUrl += `&phone=${encodeURIComponent(phoneParam)}`;
        }
        router.replace(welcomeUrl);
      } catch (error) {
        console.error('[VERIFY] Unexpected error in verification:', error);
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

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

