"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
  mediaId: string;
  initialStatus: string;
  initialExternalJobId: string | null;
  initialListingUrl: string | null;
  initialPublishedAt: string | null;
  initialClosedAt: string | null;
  initialErrorMessage: string | null;
};

export default function MediaManagementForm({
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

  const [status, setStatus] = useState(initialStatus);
  const [externalJobId, setExternalJobId] = useState(
    initialExternalJobId ?? ""
  );
  const [listingUrl, setListingUrl] = useState(
    initialListingUrl ?? ""
  );
  const [publishedAt, setPublishedAt] = useState(
    initialPublishedAt ?? ""
  );
  const [closedAt, setClosedAt] = useState(
    initialClosedAt ?? ""
  );
  const [errorMessage, setErrorMessage] = useState(
    initialErrorMessage ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/media`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mediaId,
            status,
            externalJobId,
            listingUrl,
            publishedAt: publishedAt || null,
            closedAt: closedAt || null,
            errorMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "保存に失敗しました。"
        );
      }

      setMessage("保存しました。");

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "保存に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          掲載ステータス
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900"
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
          onChange={(event) =>
            setExternalJobId(event.target.value)
          }
          placeholder="例：123456789"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          掲載URL
        </label>

        <input
          type="url"
          value={listingUrl}
          onChange={(event) =>
            setListingUrl(event.target.value)
          }
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            掲載日時
          </label>

          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(event) =>
              setPublishedAt(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            掲載終了日時
          </label>

          <input
            type="datetime-local"
            value={closedAt}
            onChange={(event) =>
              setClosedAt(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          エラーメッセージ
        </label>

        <textarea
          value={errorMessage}
          onChange={(event) =>
            setErrorMessage(event.target.value)
          }
          rows={4}
          placeholder="エラーが発生した場合に入力"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-5">
        <div>
          {message && (
            <p
              className={`text-sm ${
                message === "保存しました。"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "保存中..." : "変更を保存"}
        </button>
      </div>
    </form>
  );
}