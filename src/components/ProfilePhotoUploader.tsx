"use client";
import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

interface Props {
  studentId: string;
  currentUrl?: string;
  fallbackEmoji?: string;     // shown when there's no photo (e.g. 👧 / 👦)
  size?: number;              // px
  // Caller controls whether the camera/upload button is available.
  canEdit?: boolean;
  rounded?: "full" | "2xl";   // 'full' for hero avatars, '2xl' for cards
}

// Compact reusable profile-photo uploader.
//   - Tap the photo to take a new one with the device camera (capture=user) or
//     pick from gallery.
//   - Image is downscaled in-browser to keep localStorage usage sane.
//   - Persists to Student.photo_url as a data: URL.
export default function ProfilePhotoUploader({
  studentId, currentUrl, fallbackEmoji = "🧑‍🎓", size = 64, canEdit = true, rounded = "2xl",
}: Props) {
  const updateStudent = useAppStore((s) => s.updateStudent);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Pick an image file"); return; }
    setBusy(true);
    try {
      const dataUrl = await downscale(file, 480, 480, 0.8);
      updateStudent(studentId, { photo_url: dataUrl });
      toast.success("📸 Photo updated");
    } catch (e) {
      toast.error("Couldn't read that photo. Try a different one.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = () => {
    if (!window.confirm("Remove this profile photo?")) return;
    updateStudent(studentId, { photo_url: undefined });
    toast.success("Photo removed");
  };

  const radius = rounded === "full" ? "rounded-full" : "rounded-2xl";

  return (
    <div className="relative inline-block flex-shrink-0">
      <div className={`${radius} overflow-hidden flex items-center justify-center`}
        style={{
          width: size, height: size,
          background: currentUrl ? "transparent" : "rgba(255,255,255,0.15)",
        }}>
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: size * 0.55 }}>{fallbackEmoji}</span>
        )}
      </div>

      {canEdit && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label="Choose photo"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Change photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md disabled:opacity-60"
            style={{ background: "#FFD700", color: "#1A0E4D", border: "2px solid white" }}
          >
            {busy ? "…" : "📷"}
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={removePhoto}
              aria-label="Remove photo"
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md"
              style={{ background: "rgba(239,68,68,0.95)", color: "white", border: "1px solid white" }}
            >
              ✕
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Read the file → canvas-downscale → data URL. Keeps storage payload small.
function downscale(file: File, maxW: number, maxH: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("no 2d context")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
