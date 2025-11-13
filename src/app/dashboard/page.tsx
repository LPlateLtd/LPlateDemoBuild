"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { fetchInstructorsByIds } from "@/lib/instructors";
import Link from "next/link";
import Image from "next/image";

const sb = createSupabaseBrowser();

interface User {
  id: string;
  email?: string;
}

interface Profile {
  role: string;
  name: string | null;
}

interface UpcomingLesson {
  id: string;
  start_at: string;
  end_at: string;
  instructor: {
    id: string;
    name: string;
    avatar_url: string | null;
    base_postcode: string | null;
  };
  pick_up_location: string | null; // Learner's postcode
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadUpcomingLessons();
  }, []);

  async function loadUser() {
    try {
      const { data: { user } } = await sb.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await sb
          .from("profiles")
          .select("role, name")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(profile);
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadUpcomingLessons() {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      // Calculate start and end of current week (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      weekEnd.setHours(23, 59, 59, 999);

      // Fetch upcoming bookings for this week
      const { data: bookingsData, error: bookingsError } = await sb
        .from("bookings")
        .select(`
          id,
          start_at,
          end_at,
          instructor_id
        `)
        .eq("learner_id", user.id)
        .in("status", ["pending", "confirmed"])
        .gte("start_at", weekStart.toISOString())
        .lte("start_at", weekEnd.toISOString())
        .order("start_at", { ascending: true })
        .limit(3);

      if (bookingsError) {
        console.error("Bookings query error:", bookingsError);
        return;
      }

      if (!bookingsData || bookingsData.length === 0) {
        setUpcomingLessons([]);
        return;
      }

      // Get learner's postcode for pick-up location
      const { data: learnerProfile } = await sb
        .from("profiles")
        .select("postcode")
        .eq("id", user.id)
        .maybeSingle();

      const learnerPostcode = (learnerProfile as { postcode: string | null } | null)?.postcode || null;

      // Fetch instructor profiles
      const instructorIds = bookingsData.map((b: any) => b.instructor_id);
      const uniqueInstructorIds = [...new Set(instructorIds)];
      const instructorResult = await fetchInstructorsByIds(uniqueInstructorIds);

      // Fetch instructor details (base_postcode from instructors table)
      const { data: instructorDetails } = await sb
        .from("instructors")
        .select("id, base_postcode")
        .in("id", uniqueInstructorIds);

      // Create lookup maps
      const instructorsById = new Map<string, any>();
      instructorResult.instructors.forEach(instructor => {
        instructorsById.set(instructor.id.toLowerCase().trim(), instructor);
      });

      const instructorDetailsById = new Map<string, any>();
      (instructorDetails || []).forEach((detail: any) => {
        instructorDetailsById.set(detail.id.toLowerCase().trim(), detail);
      });

      // Format lessons
      const formattedLessons: UpcomingLesson[] = bookingsData.map((booking: any) => {
        const normalizedId = booking.instructor_id.toLowerCase().trim();
        const instructor = instructorsById.get(normalizedId);
        const instructorDetail = instructorDetailsById.get(normalizedId);

        return {
          id: booking.id,
          start_at: booking.start_at,
          end_at: booking.end_at,
          instructor: {
            id: booking.instructor_id,
            name: instructor?.name || "Instructor",
            avatar_url: instructor?.avatar_url || null,
            base_postcode: instructorDetail?.base_postcode || null,
          },
          pick_up_location: learnerPostcode,
        };
      });

      setUpcomingLessons(formattedLessons);
    } catch (e) {
      console.error("Failed to load upcoming lessons:", e);
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-GB", { 
        weekday: "short",
        day: "numeric",
        month: "short"
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-xl mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/sign-in" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome {profile?.name ? profile.name.split(' ')[0] : "Learner"}! 👋
        </h1>
        
        <div className="space-y-6">
          {/* Upcoming Lessons Card */}
          {upcomingLessons.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming lessons</h2>
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    {/* Instructor Avatar */}
                    <div className="flex-shrink-0">
                      {lesson.instructor.avatar_url ? (
                        <Image
                          src={lesson.instructor.avatar_url}
                          alt={lesson.instructor.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-lg">
                            {lesson.instructor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Lesson Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-gray-900">
                          {lesson.instructor.name}
                        </div>
                        {lesson.pick_up_location && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{lesson.pick_up_location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(lesson.start_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(lesson.start_at)} - {formatTime(lesson.end_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {upcomingLessons.length >= 3 && (
                <Link 
                  href="/bookings" 
                  className="block mt-4 text-center text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  View all bookings →
                </Link>
              )}
            </div>
          )}

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/search" className="btn-primary w-full text-center block">
                Find New Instructors
              </Link>
              <Link href="/bookings" className="btn-secondary w-full text-center block">
                View My Bookings
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">0</div>
                <div className="text-gray-600">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">0</div>
                <div className="text-gray-600">Hours Practiced</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-gray-600 text-center py-8">
              No recent activity yet. Start by finding an instructor!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
