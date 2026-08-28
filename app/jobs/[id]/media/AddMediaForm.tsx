"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
  existingMedia: string[];
};

const mediaOptions = [
  {
    value: "INDEED",
    label: "Indeed",
  },
  {
    value: "JOB_BOX",
    label: "JOB BOX",
  },
  {
    value: "ENGAGE",
    label: "engage",
  },
  {
    value: "OTHER",
    label: "その他",
  },
];

export default function AddMediaForm({
  jobId,
  existingMedia,
}: Props) {
  const router = useRouter();

  const [media, setMedia] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableMedia = mediaOptions.filter(
    (option) => !existingMedia.includes(option.value)
  );

  const handleAdd = async () => {
    if (!media) {
      setError("追加する媒体を選択してください。");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/jobs/${jobId}/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          media,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "媒体の登録に失敗しました"
        );
      }

      setMedia("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "媒体の登録に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  if (availableMedia.length === 0) {
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        登録可能な媒体はありません。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">
            媒体を追加
          </label>

          <select
            value={media}
            onChange={(e) => {
              setMedia(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">
              媒体を選択してください
            </option>

            {availableMedia.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !media}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "追加中..." : "＋ 媒体を追加"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
