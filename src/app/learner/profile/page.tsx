"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

const sb = createSupabaseBrowser();

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  postcode: string | null;
  avatar_url: string | null;
  experience_level: string | null;
}

export default function LearnerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await sb
        .from("profiles")
        .select("id, name, email, phone, postcode, avatar_url, experience_level")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Failed to load profile:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await (sb.from("profiles") as any)
            .insert({
              id: user.id,
              name: user.email?.split('@')[0] || 'User',
              email: user.email,
              role: 'learner',
              experience_level: 'beginner'
            })
            .select("id, name, email, phone, postcode, avatar_url, experience_level")
            .single();
          
          if (createError) {
            console.error("Failed to create profile:", createError);
            console.error("Create error details:", JSON.stringify(createError, null, 2));
            setMessage({ type: 'error', text: `Failed to create profile: ${createError.message}` });
          } else {
            setProfile(newProfile);
          }
        } else {
          setMessage({ type: 'error', text: `Failed to load profile: ${error.message}` });
        }
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error("Error loading profile:", e);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!profile) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await (sb.from("profiles") as any)
        .update({
          name: profile.name,
          phone: profile.phone,
          postcode: profile.postcode,
          experience_level: profile.experience_level,
        })
        .eq("id", profile.id);

      if (error) {
        console.error("Failed to save profile:", error);
        setMessage({ type: 'error', text: 'Failed to save profile' });
      } else {
        console.log('[PROFILE] Save successful, redirecting to dashboard...');
        setSaveSuccess(true);
        setMessage({ type: 'success', text: 'Profile saved successfully! Redirecting to dashboard...' });
        // Redirect to learner dashboard after successful save
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (e) {
      console.error("Error saving profile:", e);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (!profile) return;
    
    setUploading(true);
    setMessage(null);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await sb.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage({ type: 'error', text: 'Failed to upload photo' });
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = sb.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await (sb.from("profiles") as any)
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Update error:", updateError);
        setMessage({ type: 'error', text: 'Failed to update profile with photo' });
        return;
      }

      // Update local state
      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });

    } catch (e) {
      console.error("Error uploading photo:", e);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            ← Back
          </Link>
          <Logo size="sm" variant="horizontal" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-0">
          {profile.name ? `Welcome back, ${profile.name.split(' ')[0]}!` : 'Welcome back!'}
        </h1>
        
        {/* Message - Only show errors, not success messages */}
        {message && message.type === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 border border-red-200">
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 pt-0 pb-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1">
          <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
            <div className="space-y-3">
              {/* Profile Photo */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                        <img
                          src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/avatars/Leaf%20circle.png"
                          alt="Profile placeholder"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 hover:bg-green-600 text-black rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setMessage({ type: 'error', text: 'Photo must be smaller than 5MB' });
                            return;
                          }
                          uploadPhoto(file);
                        }
                      };
                      input.click();
                    }}
                    disabled={uploading}
                    title={uploading ? "Uploading..." : "Upload profile photo"}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={profile.email || ""}
                  disabled
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Postcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={profile.postcode || ""}
                  onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
                  placeholder="Used to find instructors near you"
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driving Experience Level
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={profile.experience_level || "beginner"}
                  onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                >
                  <option value="beginner">Beginner - Just getting started</option>
                  <option value="intermediate">Intermediate - Had some lessons</option>
                  <option value="advanced">Advanced - Almost test-ready</option>
                  <option value="qualified">Qualified - I&apos;ve passed my test!</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Helps instructors understand your current level</p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 ${
                  saveSuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white'
                }`}
              >
                {saving ? "Saving..." : saveSuccess ? "✓ Saved!" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your profile information helps instructors understand your needs, contact you and get to the right location.</p>
        </div>
      </div>
    </div>
  );
}
