"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaStatus =
  | "NOT_PUBLISHED"
  | "PENDING"
  | "PUBLISHED"
  | "ERROR"
  | "CLOSED";

type Props = {
  jobId: string;
  mediaId: string;
  initialStatus: MediaStatus;
  initialExternalJobId: string;
  initialListingUrl: string;
  initialPublishedAt: string;
  initialClosedAt: string;
  initialErrorMessage: string;
};

export default function MediaEditForm({
  jobId,
  mediaId,
  initialStatus,
  initialExternalJobId,
  initialListingUrl,
  initialPublishedAt,
  initialClosedAt,
  initialErrorMessage,
}: Props) {
  const router = useRouter();

  const [status, setStatus] =
    useState<MediaStatus>(initialStatus);

  const [externalJobId, setExternalJobId] =
    useState(initialExternalJobId);

  const [listingUrl, setListingUrl] =
    useState(initialListingUrl);

  const [publishedAt, setPublishedAt] =
    useState(initialPublishedAt);

  const [closedAt, setClosedAt] =
    useState(initialClosedAt);

  const [errorMessage, setErrorMessage] =
    useState(initialErrorMessage);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getCurrentDateTimeLocal = () => {
    const now = new Date();

    const offset =
      now.getTimezoneOffset();

    const localDate =
      new Date(
        now.getTime() -
          offset * 60 * 1000
      );

    return localDate
      .toISOString()
      .slice(0, 16);
  };

  const handleStatusChange = (
    nextStatus: MediaStatus
  ) => {
    setStatus(nextStatus);
    setMessage("");
    setError("");

    if (
      nextStatus === "PUBLISHED" &&
      !publishedAt
    ) {
      setPublishedAt(
        getCurrentDateTimeLocal()
      );
    }

    if (
      nextStatus === "CLOSED" &&
      !closedAt
    ) {
      setClosedAt(
        getCurrentDateTimeLocal()
      );
    }

    if (
      nextStatus === "NOT_PUBLISHED"
    ) {
      setClosedAt("");
    }
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/media`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            mediaId,
            status,
            externalJobId,
            listingUrl,
            publishedAt:
              publishedAt || null,
            closedAt:
              closedAt || null,
            errorMessage,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "媒体情報の保存に失敗しました"
        );
      }

      setMessage(
        "媒体情報を保存しました。"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "媒体情報の保存に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          媒体情報を編集
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          掲載状態や外部求人情報を更新できます。
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            掲載ステータス
          </label>

          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value as MediaStatus
              )
            }
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          >
            <option value="NOT_PUBLISHED">
              未掲載
            </option>

            <option value="PENDING">
              掲載処理中
            </option>

            <option value="PUBLISHED">
              掲載中
            </option>

            <option value="ERROR">
              エラー
            </option>

            <option value="CLOSED">
              掲載終了
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            外部求人ID
          </label>

          <input
            type="text"
            value={externalJobId}
            onChange={(e) =>
              setExternalJobId(
                e.target.value
              )
            }
            disabled={saving}
            placeholder="例：123456789"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            掲載URL
          </label>

          <input
            type="url"
            value={listingUrl}
            onChange={(e) =>
              setListingUrl(
                e.target.value
              )
            }
            disabled={saving}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            掲載日時
          </label>

          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) =>
              setPublishedAt(
                e.target.value
              )
            }
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            掲載終了日時
          </label>

          <input
            type="datetime-local"
            value={closedAt}
            onChange={(e) =>
              setClosedAt(
                e.target.value
              )
            }
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            エラーメッセージ
          </label>

          <textarea
            value={errorMessage}
            onChange={(e) =>
              setErrorMessage(
                e.target.value
              )
            }
            disabled={saving}
            rows={4}
            placeholder="掲載エラーがある場合に入力"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
          />
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "保存中..."
            : "媒体情報を保存"}
        </button>
      </div>
    </section>
  );
}
