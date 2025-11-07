"use client";

import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

interface Profile {
  name: string | null;
  role: string;
  gender?: string | null;
  profile_picture?: string | null;
}

export default function InstructorDashboard() {
  const sb = createSupabaseBrowser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock earnings data - replace with real data later
  const monthlyEarnings = 0; // £0 earned this month
  const monthlyTarget = 3000; // £3,000 target (matching earnings page)
  const bookedAmount = 0; // £0 booked this month
  
  // Calculate progress percentage for the circle
  const progressPercentage = Math.min((monthlyEarnings / monthlyTarget) * 100, 100);
  
  // Determine which money stack image to use based on earnings
  const getMoneyStackImage = () => {
    const earningsRatio = monthlyEarnings / monthlyTarget;
    if (earningsRatio >= 0.8) return "Money%20x6.png"; // 6 stacks for high earnings
    if (earningsRatio >= 0.4) return "Money%20x4.png"; // 4 stacks for medium earnings
    return "Money%20x2.png"; // 2 stacks for low earnings
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await sb.auth.getUser();
        console.log("[DASHBOARD] User:", user);
        console.log("[DASHBOARD] User error:", userError);
        
        if (user) {
          const { data: prof, error } = await sb
            .from("profiles")
            .select("name, role")
            .eq("id", user.id)
            .maybeSingle();
          
          console.log("[DASHBOARD] Profile query result:", { prof, error });
          
          if (error) {
            // PGRST116 is expected when profile doesn't exist yet (new users)
            if (error.code !== 'PGRST116') {
              console.error("[DASHBOARD] Unexpected profile error:", error);
            } else {
              console.log("[DASHBOARD] Profile not found (expected for new users)");
            }
            setProfile(null);
          } else {
            console.log("[DASHBOARD] Profile loaded successfully:", prof);
            if (prof) {
              const profileData = prof as Profile;
              console.log("[DASHBOARD] Profile name:", profileData.name);
              console.log("[DASHBOARD] Profile name type:", typeof profileData.name);
              console.log("[DASHBOARD] Profile name trimmed:", profileData.name?.trim());
              console.log("[DASHBOARD] First name extracted:", profileData.name?.trim().split(' ')[0]);
            }
            setProfile(prof);
          }
        } else {
          console.log("[DASHBOARD] No user found");
        }
      } catch (error) {
        console.error("[DASHBOARD] Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Debug: Log profile state at render time
  console.log("[DASHBOARD] Render - profile state:", profile);
  console.log("[DASHBOARD] Render - profile?.name:", profile?.name);

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Dashboard</h1>
        
        {/* Header */}
        <div className="mb-1 py-1 px-6 text-center">
          <h1 className="text-lg font-normal text-gray-900 mb-1">
            Hi {profile?.name ? (profile.name.trim().split(' ')[0] || "Instructor") : "Instructor"}! 👋
          </h1>
        </div>
        
        {/* Month Recap */}
        <div className="space-y-4 mb-1">
          {/* Detailed Earnings Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              {/* Left: Title and Legend (33%) */}
              <div className="flex-[1] flex flex-col">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Monthly Earnings</h2>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-700 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                </div>
              </div>
              
              {/* Right: Circular Progress with Money Icon and Amount (66%) */}
              <div className="flex-[2] flex flex-col items-end">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <svg className="w-[89.6px] h-[89.6px] transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      {/* Progress circle (earnings progress) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="100, 100"
                        strokeDashoffset={100 - progressPercentage}
                      />
                    </svg>
                    {/* Center content - Money icon only */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <img 
                        src={`https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/${getMoneyStackImage()}`}
                        alt="Money stack" 
                        className="w-[30px] h-[30px] object-contain"
                      />
                    </div>
                  </div>
                  {/* Amount below circle */}
                  <div className="text-base font-bold text-gray-900 mt-2">£{monthlyEarnings}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    <span className="font-bold">0</span>
                  </div>
                </div>
                <div className="text-sm font-normal text-gray-600">Lessons this month</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    <span className="font-bold">0</span>
                  </div>
                </div>
                <div className="text-sm font-normal text-gray-600">Active Students</div>
              </div>
            </div>
          </div>

        </div>

        {/* Manage Your Business */}
        <div className="mb-1 py-2 text-center">
          <p className="text-gray-600">
            Manage your business
          </p>
        </div>

               {/* Quick Actions Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 {/* Profile Card */}
                 <Link
                   href="/instructor/profile"
                   className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                 >
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors overflow-hidden">
                       <img 
                         src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Profile.png"
                         alt="Profile" 
                         className="w-full h-full object-contain"
                       />
                     </div>
                     <h3 className="text-base font-medium text-gray-900 ml-3">Profile</h3>
                   </div>
                 </Link>

                 {/* Earnings Card */}
                 <Link
                   href="/instructor/earnings"
                   className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                 >
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                       <img 
                         src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Earnings.png"
                         alt="Earnings" 
                         className="w-full h-full object-contain"
                       />
                     </div>
                     <h3 className="text-base font-medium text-gray-900 ml-3">Earnings</h3>
                   </div>
                 </Link>

                 {/* Bookings Card */}
                 <Link
                   href="/instructor/bookings"
                   className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                 >
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                       <img 
                         src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Bookings.png"
                         alt="Bookings" 
                         className="w-full h-full object-contain"
                       />
                     </div>
                     <h3 className="text-base font-medium text-gray-900 ml-3">Bookings</h3>
                   </div>
                 </Link>

                 {/* Working Hours Card */}
                 <Link
                   href="/instructor/availability"
                   className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                 >
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                       <img 
                         src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/WorkingHours.png"
                         alt="Working Hours" 
                         className="w-full h-full object-contain"
                       />
                     </div>
                     <h3 className="text-base font-medium text-gray-900 ml-3">Working Hours</h3>
                   </div>
                 </Link>
               </div>
      </div>
    </main>
  );
}
