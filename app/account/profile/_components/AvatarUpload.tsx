"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/api";

export interface AvatarUploadProps {
  initials: string;
  avatarUrl?: string | null;
  onUpdate: (updated: any) => void;
}

/**
 * AvatarUpload — clickable avatar circle that handles file selection,
 * instant preview, and upload to the profile API.
 */
export function AvatarUpload({ initials, avatarUrl, onUpdate }: AvatarUploadProps) {
  const [preview, setPreview]       = useState<string | null>(avatarUrl ?? null);
  const [uploading, setUploading]   = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }

    // Instant preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const updated = await updateProfile({ avatarUrl: base64 } as any);
      onUpdate(updated?.data ?? updated);
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo — please try again");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group shrink-0">
      <label htmlFor="avatar-upload" className="cursor-pointer">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-xl font-bold text-primary">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <Loader2 size={16} className="animate-spin text-white" />
            : <Camera size={16} className="text-white" />}
        </div>
      </label>
      <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={uploading} />
    </div>
  );
}
