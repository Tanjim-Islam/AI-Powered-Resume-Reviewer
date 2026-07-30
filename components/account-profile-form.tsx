"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePicker } from "@/components/template-picker";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { prepareResumePhoto } from "@/lib/resume-photo";
import type { ResumeTemplateId } from "@/lib/schemas";

export type ProfileValues = {
  full_name: string;
  profession: string;
  job_preferences: string;
  modification_preferences: string;
  memory_notes: string;
  preferred_template_id: ResumeTemplateId;
  resume_photo_path: string;
  resume_photo_url: string;
};

export function AccountProfileForm({
  initialValues,
}: {
  initialValues: ProfileValues;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const updateValue = (field: keyof ProfileValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.error("Sign in to save preferences.");
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: values.full_name.trim() || null,
        profession: values.profession.trim() || null,
        job_preferences: values.job_preferences.trim() || null,
        modification_preferences:
          values.modification_preferences.trim() || null,
        memory_notes: values.memory_notes.trim() || null,
        preferred_template_id: values.preferred_template_id,
        resume_photo_path: values.resume_photo_path || null,
      },
      { onConflict: "id" }
    );

    if (error) {
      toast.error("Could not save your profile. Please try again.");
    } else {
      toast.success("Profile saved.");
      router.refresh();
    }

    setIsSaving(false);
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file || !user) return;
    setIsUploadingPhoto(true);

    try {
      const prepared = await prepareResumePhoto(file);
      const path = `${user.id}/profile-photo.jpg`;
      const supabase = getSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from("resume-assets")
        .upload(path, prepared, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Could not upload the photo.");
      }

      const nextUrl = URL.createObjectURL(prepared);
      setValues((current) => ({
        ...current,
        resume_photo_path: path,
        resume_photo_url: nextUrl,
      }));
      toast.success("Photo ready. Save changes to keep it.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Photo upload failed."
      );
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handlePhotoRemove = async () => {
    if (!user || !values.resume_photo_path) return;
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage
      .from("resume-assets")
      .remove([values.resume_photo_path]);

    if (error) {
      toast.error("Could not remove the photo.");
      return;
    }

    setValues((current) => ({
      ...current,
      resume_photo_path: "",
      resume_photo_url: "",
    }));
    toast.success("Photo removed. Save changes to update your profile.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">Name</span>
          <Input
            value={values.full_name}
            onChange={(event) => updateValue("full_name", event.target.value)}
            autoComplete="name"
            maxLength={120}
            className="border-gray-200 bg-white"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">Profession</span>
          <Input
            value={values.profession}
            onChange={(event) => updateValue("profession", event.target.value)}
            placeholder="Product designer"
            maxLength={160}
            className="border-gray-200 bg-white"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">
          Job preferences
        </span>
        <Textarea
          value={values.job_preferences}
          onChange={(event) =>
            updateValue("job_preferences", event.target.value)
          }
          placeholder="Roles, industries, seniority, or work style"
          maxLength={2000}
          className="min-h-24 border-gray-200 bg-white"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">
          Editing preferences
        </span>
        <Textarea
          value={values.modification_preferences}
          onChange={(event) =>
            updateValue("modification_preferences", event.target.value)
          }
          placeholder="Tone, length, wording, or details to preserve"
          maxLength={2000}
          className="min-h-24 border-gray-200 bg-white"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700">Memory</span>
        <Textarea
          value={values.memory_notes}
          onChange={(event) => updateValue("memory_notes", event.target.value)}
          placeholder="Details future reviews should remember"
          maxLength={4000}
          className="min-h-24 border-gray-200 bg-white"
        />
      </label>

      <div className="space-y-3 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Default resume template
          </h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Used for future AI rewrites.
          </p>
        </div>
        <TemplatePicker
          value={values.preferred_template_id}
          onChange={(preferred_template_id) =>
            setValues((current) => ({
              ...current,
              preferred_template_id,
            }))
          }
          compact
        />
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Resume portrait
          </h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Optional for templates that support a photo.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4 sm:flex-row sm:items-center">
          {values.resume_photo_url ? (
            <div className="size-20 overflow-hidden rounded-lg border border-white bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={values.resume_photo_url}
                alt="Saved resume portrait"
                crossOrigin="anonymous"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400">
              <ImagePlus className="size-6" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {values.resume_photo_url ? "Portrait added" : "No portrait"}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              JPG, PNG, or WebP, up to 5MB.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {values.resume_photo_url ? "Replace" : "Upload"}
            </Button>
            {values.resume_photo_path && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove portrait"
                onClick={() => void handlePhotoRemove()}
                className="text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) =>
              void handlePhotoUpload(event.target.files?.[0] ?? null)
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}
