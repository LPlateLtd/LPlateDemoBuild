"use client";

import { useState } from "react";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface ProfileAvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadComplete?: (newAvatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const buttonSizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export default function ProfileAvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete,
  onUploadError,
  size = "md",
  className = "",
}: ProfileAvatarUploadProps) {
  const sb = createSupabaseBrowser();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file || !userId) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}-${Date.now()}.${ext}`;

      // Upload to Supabase storage
      const { error: upErr } = await sb.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600" });

      if (upErr) {
        throw upErr;
      }

      // Get public URL
      const { data: pub } = sb.storage.from("avatars").getPublicUrl(path);

      // Update the profile in the database
      const { error: updateError } = await (sb.from("profiles") as any)
        .update({ avatar_url: pub.publicUrl })
        .eq("id", userId);

      if (updateError) {
        throw new Error("Photo uploaded but failed to save to profile");
      }

      // Clean up preview URL
      setTimeout(() => {
        URL.revokeObjectURL(localUrl);
        setPreviewUrl(null);
      }, 1000);

      onUploadComplete?.(pub.publicUrl);
    } catch (er: unknown) {
      const errorMessage = er instanceof Error ? er.message : "Upload failed";
      onUploadError?.(errorMessage);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleUpload(file);
      }
    };
    input.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const avatarSize = sizeClasses[size];
  const buttonSize = buttonSizeClasses[size];
  const iconSize = iconSizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <div
          className={`${avatarSize} rounded-full overflow-hidden border-4 border-white shadow-lg`}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Profile"
              width={size === "sm" ? 64 : size === "md" ? 96 : 128}
              height={size === "sm" ? 64 : size === "md" ? 96 : 128}
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
          className={`absolute -bottom-1 -right-1 ${buttonSize} bg-green-500 hover:bg-green-600 text-black rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${
            uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={handleClick}
          disabled={uploading}
          title="Upload profile photo"
          aria-label="Upload profile photo"
        >
          {uploading ? (
            <svg
              className={`${iconSize} animate-spin`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className={iconSize}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          )}
        </button>
      </div>
      {uploading && (
        <p className="text-center text-xs text-gray-500 mt-2">Uploading…</p>
      )}
    </div>
  );
}

