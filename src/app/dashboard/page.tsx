"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

const sb = createSupabaseBrowser();

interface User {
  id: string;
  email?: string;
}

interface Profile {
  role: string;
  name: string | null;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
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
