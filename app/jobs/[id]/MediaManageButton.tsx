"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaListing = {
  id: string;
  media: string;
  status: string;
  externalJobId: string | null;
  listingUrl: string | null;
  publishedAt: string | Date | null;
  closedAt: string | Date | null;
  errorMessage: string | null;
};

type MediaManageButtonProps = {
  jobId: string;
  listing: MediaListing;
};

function getMediaName(media: string) {
  switch (media) {
    case "INDEED":
      return "Indeed";
    case "JOB_BOX":
      return "JOB BOX";
    case "ENGAGE":
      return "engage";
    case "OTHER":
      return "その他";
    default:
      return media;
  }
}

function formatDate(value: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default function MediaManageButton({
  jobId,
  listing,
}: MediaManageButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState(listing.status);
  const [externalJobId, setExternalJobId] = useState(
    listing.externalJobId || ""
  );
  const [listingUrl, setListingUrl] = useState(
    listing.listingUrl || ""
  );
  const [publishedAt, setPublishedAt] = useState(
    formatDate(listing.publishedAt)
  );
  const [closedAt, setClosedAt] = useState(
    formatDate(listing.closedAt)
  );
  const [errorMessage, setErrorMessage] = useState(
    listing.errorMessage || ""
  );

  function handleOpen() {
    setStatus(listing.status);
    setExternalJobId(listing.externalJobId || "");
    setListingUrl(listing.listingUrl || "");
    setPublishedAt(formatDate(listing.publishedAt));
    setClosedAt(formatDate(listing.closedAt));
    setErrorMessage(listing.errorMessage || "");
    setOpen(true);
  }

  async function handleSave() {
    try {
      setSaving(true);

      const response = await fetch(`/api/jobs/${jobId}/media`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaId: listing.id,
          status,
          externalJobId,
          listingUrl,
          publishedAt,
          closedAt,
          errorMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "媒体掲載情報の更新に失敗しました。"
        );
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("媒体掲載情報更新エラー:", error);

      alert(
        error instanceof Error
          ? error.message
          : "媒体掲載情報の更新に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
      >
        管理
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* ヘッダー */}
            <div className="shrink-0 border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold">
                {getMediaName(listing.media)} 媒体管理
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                この媒体への掲載情報を管理します。
              </p>
            </div>

            {/* 入力エリア */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    掲載状態
                  </label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      掲載開始日
                    </label>

                    <input
                      type="date"
                      value={publishedAt}
                      onChange={(event) =>
                        setPublishedAt(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      掲載終了日
                    </label>

                    <input
                      type="date"
                      value={closedAt}
                      onChange={(event) =>
                        setClosedAt(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    エラー内容
                  </label>

                  <textarea
                    value={errorMessage}
                    onChange={(event) =>
                      setErrorMessage(event.target.value)
                    }
                    rows={3}
                    placeholder="掲載エラーがある場合に入力"
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="shrink-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                キャンセル
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
