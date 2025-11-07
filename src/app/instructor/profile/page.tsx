"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import BackButton from "@/components/ui/BackButton";
import ProfileAvatarUpload from "@/components/ui/ProfileAvatarUpload";
import PrimaryButton from "@/components/ui/PrimaryButton";

type Profile = {
  id: string;
  role: "learner" | "instructor" | "driving_school" | "admin";
  name: string | null;
  email: string | null;
  phone: string | null;
  postcode: string | null;
  avatar_url: string | null;
};

type Instructor = {
  id: string; // equals profile id
  description: string | null;
  gender: "male" | "female" | "other" | null;
  base_postcode: string | null;
  vehicle_type: "manual" | "auto" | "both" | null;
  hourly_rate: number | null;
  adi_badge: boolean | null;
  badge_type: "pdi" | "adi" | "training" | null;
  badge_number: string | null;
  verification_status: "pending" | "approved" | "rejected" | null;
  lat: number | null;
  lng: number | null;
  service_radius_miles: number | null;
  languages: string[] | null;
};

export default function InstructorProfilePage() {
  const sb = createSupabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      setAuthed(true);

      // load profile
      const { data: prof, error: pErr } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!pErr && prof) {
        setProfile(prof as Profile);
      }

      // load instructor (may not exist yet)
      const { data: inst } = await sb
        .from("instructors")
        .select(`
          id,
          description,
          gender,
          base_postcode,
          vehicle_type,
          hourly_rate,
          adi_badge,
          badge_type,
          badge_number,
          verification_status,
          service_radius_miles,
          languages,
          lat,
          lng
        `)
        .eq("id", user.id)
        .maybeSingle();
      if (inst) setInstructor(inst as Instructor);

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    console.log('[PROFILE] Save button clicked');
    if (!profile) {
      console.log('[PROFILE] No profile found, cannot save');
      return;
    }
    console.log('[PROFILE] Starting save process...');
    setSaving(true);
    setMsg(null);

    // 0) Geocode postcode via postcodes.io (UK)
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const pc = (profile.postcode ?? "").trim();
      if (pc) {
        const r = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
        const j = await r.json();
        if (j && j.status === 200 && j.result) {
          lat = j.result.latitude ?? null;
          lng = j.result.longitude ?? null;
        }
      }
    } catch {
      // non-fatal, continue without lat/lng
    }

    // 1) Save profile basics + ensure role
    const { error: pErr } = await (sb.from("profiles") as any)
      .update({
        role: "instructor",
        name: profile.name,
        phone: profile.phone,
        postcode: profile.postcode,
        avatar_url: profile.avatar_url,
      })
      .eq("id", profile.id);

    // 2) Upsert instructor row (store lat/lng if we have them)
    const inst = instructor ?? ({} as Instructor);
    const { error: iErr } = await (sb.from("instructors") as any).upsert({
      id: profile.id,
      description: inst.description ?? "",
      gender: (inst.gender ?? "other") as "male" | "female" | "other",
      base_postcode: inst.base_postcode ?? profile.postcode ?? "",
      vehicle_type: (inst.vehicle_type ?? "manual") as "manual" | "auto" | "both",
      hourly_rate: inst.hourly_rate ?? 30,
      adi_badge: !!inst.adi_badge,
      badge_type: inst.badge_type ?? "pdi",
      badge_number: inst.badge_number ?? null,
      verification_status: (inst.verification_status ?? "pending") as "pending" | "approved" | "rejected",
      lat: lat ?? inst?.lat ?? null,
      lng: lng ?? inst?.lng ?? null,
      service_radius_miles: inst.service_radius_miles ?? 10,
      languages: inst.languages ?? ["English"],
    });

    setSaving(false);
    if (pErr || iErr) {
      console.error('[PROFILE] Save errors - Profile:', pErr, 'Instructor:', iErr);
      setMsg(pErr?.message || iErr?.message || "Save failed");
    } else {
      console.log('[PROFILE] Save successful, redirecting to dashboard...');
      setMsg("Profile saved successfully! Redirecting to dashboard...");
      // Redirect to instructor dashboard after successful save
      setTimeout(() => {
        window.location.href = "/instructor";
      }, 1500);
    }
  }

  if (loading) return <div>Loading…</div>;

  if (!authed)
    return (
      <div className="space-y-3">
        <p>You need to sign in.</p>
        <Link className="underline" href="/sign-in">Go to sign in</Link>
      </div>
    );

  if (!profile) return <div>No profile found.</div>;

  const inst = instructor ?? ({} as Instructor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-0">
          <div className="flex items-center justify-between">
            <BackButton href="/instructor" />
            <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">
              {profile.name ? `${profile.name.split(' ')[0]}'s Profile` : 'Edit Profile'}
            </h1>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 pt-0 pb-6">
          <form onSubmit={save} className="space-y-3">
            {/* Profile Photo */}
            <div className="flex justify-center mb-2 pt-1.5">
              <ProfileAvatarUpload
                userId={profile.id}
                currentAvatarUrl={profile.avatar_url}
                size="lg"
                onUploadComplete={(newAvatarUrl) => {
                  setProfile({ ...profile, avatar_url: newAvatarUrl });
                  setMsg("Photo uploaded successfully");
                }}
                onUploadError={(error) => {
                  setMsg(error);
                }}
              />
            </div>

            {/* Full Name */}
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={profile.name ?? ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

            {/* Email Address */}
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
            value={profile.email ?? ""}
            readOnly
          />
        </div>

            {/* Phone Number and Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your phone number"
                  value={profile.phone ?? ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Gender</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={inst.gender ?? "other"}
                  onChange={(e) => setInstructor({ ...instructor!, gender: e.target.value as "male" | "female" | "other" })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Vehicle Type and Hourly Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={inst.vehicle_type ?? "manual"}
                onChange={(e) => setInstructor({ ...instructor!, vehicle_type: e.target.value as "manual" | "auto" | "both" })}
              >
                <option value="manual">Manual</option>
                <option value="auto">Auto</option>
                <option value="both">Manual & Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Hourly Rate (£)</label>
              <input
                type="number"
                min={10}
                max={100}
                step="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={inst.hourly_rate ?? 30}
                onChange={(e) => setInstructor({ ...instructor!, hourly_rate: Number(e.target.value) })}
              />
            </div>
          </div>

            {/* Postcode and Service Radius */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Postcode</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Used to find instructors near you"
                value={profile.postcode ?? ""}
                onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Service Radius (miles)</label>
              <input
                type="number"
                min={1}
                max={50}
                step="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={inst.service_radius_miles ?? 10}
                onChange={(e) => setInstructor({ ...instructor!, service_radius_miles: Number(e.target.value) })}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">How far you&apos;re willing to travel to meet learners</p>

            {/* Badge Type and Badge Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Badge Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                value={inst.badge_type ?? "pdi"}
                onChange={(e) => setInstructor({ ...instructor!, badge_type: e.target.value as "pdi" | "adi" | "training" })}
              >
                <option value="training">Training Instructor</option>
                <option value="pdi">PDI</option>
                <option value="adi">ADI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Badge Number</label>
              <input
                type="text"
                pattern="[0-9]{6,8}"
                maxLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="6-8 digits"
                value={inst.badge_number ?? ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                  if (value.length <= 8) {
                    setInstructor({ ...instructor!, badge_number: value });
                  }
                }}
              />
            </div>
          </div>

        {/* Bio */}
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-28 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Tell learners about your teaching style and experience..."
            value={inst.description ?? ""}
            onChange={(e) => setInstructor({ ...instructor!, description: e.target.value })}
          />
        </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages (max 3)</label>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <select
                    key={index}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={inst.languages?.[index] || ""}
                    onChange={(e) => {
                      const newLanguages = [...(inst.languages || [])];
                      if (e.target.value) {
                        newLanguages[index] = e.target.value;
                      } else {
                        newLanguages.splice(index, 1);
                      }
                      setInstructor({ ...instructor!, languages: newLanguages });
                    }}
                  >
                    <option value="">Select language...</option>
                <option value="English">English</option>
                <option value="Welsh">Welsh</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Polish">Polish</option>
                <option value="Romanian">Romanian</option>
                <option value="Bulgarian">Bulgarian</option>
                <option value="Lithuanian">Lithuanian</option>
                <option value="Latvian">Latvian</option>
                <option value="Estonian">Estonian</option>
                <option value="Czech">Czech</option>
                <option value="Slovak">Slovak</option>
                <option value="Hungarian">Hungarian</option>
                <option value="Slovenian">Slovenian</option>
                <option value="Croatian">Croatian</option>
                <option value="Serbian">Serbian</option>
                <option value="Bosnian">Bosnian</option>
                <option value="Macedonian">Macedonian</option>
                <option value="Albanian">Albanian</option>
                <option value="Turkish">Turkish</option>
                <option value="Arabic">Arabic</option>
                <option value="Urdu">Urdu</option>
                <option value="Hindi">Hindi</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bengali">Bengali</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Kannada">Kannada</option>
                <option value="Marathi">Marathi</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Russian">Russian</option>
                <option value="Ukrainian">Ukrainian</option>
                <option value="Belarusian">Belarusian</option>
                <option value="Moldovan">Moldovan</option>
                <option value="Georgian">Georgian</option>
                <option value="Armenian">Armenian</option>
                <option value="Azerbaijani">Azerbaijani</option>
                <option value="Kazakh">Kazakh</option>
                <option value="Kyrgyz">Kyrgyz</option>
                <option value="Tajik">Tajik</option>
                <option value="Turkmen">Turkmen</option>
                <option value="Uzbek">Uzbek</option>
                <option value="Mongolian">Mongolian</option>
                <option value="Hebrew">Hebrew</option>
                <option value="Persian">Persian</option>
                <option value="Dari">Dari</option>
                <option value="Pashto">Pashto</option>
                <option value="Kurdish">Kurdish</option>
                <option value="Amharic">Amharic</option>
                <option value="Swahili">Swahili</option>
                <option value="Yoruba">Yoruba</option>
                <option value="Igbo">Igbo</option>
                <option value="Hausa">Hausa</option>
                <option value="Zulu">Zulu</option>
                <option value="Afrikaans">Afrikaans</option>
                <option value="Dutch">Dutch</option>
                <option value="Flemish">Flemish</option>
                <option value="Danish">Danish</option>
                <option value="Norwegian">Norwegian</option>
                <option value="Swedish">Swedish</option>
                <option value="Finnish">Finnish</option>
                <option value="Icelandic">Icelandic</option>
                <option value="Greek">Greek</option>
                <option value="Maltese">Maltese</option>
                <option value="Irish">Irish</option>
                <option value="Scottish Gaelic">Scottish Gaelic</option>
                <option value="Cornish">Cornish</option>
                <option value="Manx">Manx</option>
              </select>
            ))}
          </div>
              <p className="text-xs text-gray-500 mt-1">Select up to 3 languages you can teach in</p>
            </div>

            {/* Save Button */}
            <PrimaryButton
              type="submit"
              disabled={saving}
              loading={saving}
              loadingText="Saving..."
              fullWidth
            >
              Save Changes
            </PrimaryButton>
      </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Your profile information helps learners understand your teaching style, availability and location.</p>
        </div>
      </div>
    </div>
  );
}
