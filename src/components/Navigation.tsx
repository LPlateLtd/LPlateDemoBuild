"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";

const sb = createSupabaseBrowser();

interface User {
  id: string;
  email?: string;
}

interface Profile {
  role: string;
  name: string | null;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    loadUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      console.log('[NAV] Auth state changed:', event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        loadUser();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  async function loadUser() {
    try {
      console.log('[NAV] Loading user...');
      const { data: { user } } = await sb.auth.getUser();
      setUser(user);
      
      if (user) {
        console.log('[NAV] User found:', user.id);
        const { data: profile, error } = await sb
          .from("profiles")
          .select("role, name")
          .eq("id", user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()
        
        if (error) {
          console.error("Profile fetch error:", error);
          // Don't set profile if it doesn't exist yet - this is normal for new users
          if (error.code !== 'PGRST116') {
            console.error("Unexpected profile error:", error);
          }
        } else {
          console.log('[NAV] Profile loaded:', profile);
          setProfile(profile);
        }
      } else {
        console.log('[NAV] No user found');
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await sb.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Logo size="sm" variant="horizontal" />
            </Link>
            <div className="animate-pulse bg-gray-200 h-10 w-20 rounded-xl"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Logo size="sm" variant="horizontal" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/search"
                className="border border-gray-300 hover:border-green-500 text-gray-600 hover:text-green-500 px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs whitespace-nowrap"
              >
                Find Instructors
              </Link>
              <Link
                href="/sign-in"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isInstructor = profile?.role === "instructor";
  const isLearner = profile?.role === "learner";
  
  console.log('[NAV] Role check:', { 
    profile, 
    role: profile?.role, 
    isInstructor, 
    isLearner 
  });

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" variant="horizontal" />
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/search"
              className={`border border-gray-300 hover:border-green-500 px-2 sm:px-4 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${
                pathname === "/search" 
                  ? "border-green-500 text-green-500" 
                  : "text-gray-600 hover:text-green-500"
              }`}
            >
              Find Instructors
            </Link>
            
            {/* Hamburger Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="border border-gray-300 hover:border-green-500 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center"
                aria-label="Menu"
              >
                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                  <div className={`h-1 bg-gray-600 transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`}></div>
                  <div className={`h-1 bg-gray-600 transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`}></div>
                </div>
              </button>
              
              {/* Mobile Menu Overlay */}
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  
                  {/* Menu Panel */}
                  <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Header with close button */}
                    <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">
                          Hi, {profile?.name ? (profile.name.trim().split(' ')[0] || "User") : "User"}
                        </div>
                        <div className="text-base text-gray-600 capitalize">
                          {profile?.role || "User"}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close menu"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  
                  <div className="py-1">
                    <Link
                      href={isInstructor ? "/instructor" : "/dashboard"}
                      className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <img 
                        src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Dashboard.png"
                        alt="Dashboard" 
                        className="w-7 h-7 mr-3 object-contain"
                      />
                      Dashboard
                    </Link>
                    
                    {isLearner && (
                      <>
                        <Link
                          href="/learner/profile"
                          className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <img 
                            src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Profile.png"
                            alt="Profile" 
                            className="w-7 h-7 mr-3 object-contain"
                          />
                          Profile
                        </Link>
                        <Link
                          href="/bookings"
                          className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <img 
                            src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Bookings.png"
                            alt="Bookings" 
                            className="w-7 h-7 mr-3 object-contain"
                          />
                          My Bookings
                        </Link>
                      </>
                    )}
                    
                    {isInstructor && (
                      <>
                        <Link
                          href="/instructor/profile"
                          className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <img 
                            src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Profile.png"
                            alt="Profile" 
                            className="w-7 h-7 mr-3 object-contain"
                          />
                          Profile
                        </Link>
                        <Link
                          href="/instructor/earnings"
                          className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <img 
                            src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Earnings.png"
                            alt="Earnings" 
                            className="w-7 h-7 mr-3 object-contain"
                          />
                          Earnings
                        </Link>
                        <Link
                          href="/instructor/bookings"
                          className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <img 
                            src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Bookings.png"
                            alt="Bookings" 
                            className="w-7 h-7 mr-3 object-contain"
                          />
                          Bookings
                        </Link>
                        <Link
                          href="/instructor/availability"
                          className="flex items-center px-8 py-5 text-lg font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-4 border-transparent hover:border-green-500"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <img 
                            src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/WorkingHours.png"
                            alt="Working Hours" 
                            className="w-7 h-7 mr-3 object-contain"
                          />
                          Working Hours
                        </Link>
                      </>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center w-full text-left px-8 py-5 text-lg font-medium text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors border-l-4 border-transparent hover:border-orange-500"
                    >
                      <img 
                        src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/LogOut.png"
                        alt="Log Out" 
                        className="w-7 h-7 mr-3 object-contain"
                      />
                      Log Out
                    </button>
                  </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
