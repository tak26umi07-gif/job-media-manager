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
  status: MediaStatus;
};

export default function MediaActionButtons({
  jobId,
  mediaId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const updateStatus = async (
    nextStatus: MediaStatus
  ) => {
    if (loading) {
      return;
    }

    setLoading(true);
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
            status: nextStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "媒体情報の更新に失敗しました"
        );
      }

      setMessage(
        nextStatus === "PUBLISHED"
          ? "掲載開始状態に変更しました。"
          : "掲載終了状態に変更しました。"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "媒体情報の更新に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const canPublish =
    status === "NOT_PUBLISHED" ||
    status === "CLOSED" ||
    status === "ERROR";

  const canClose =
    status === "PENDING" ||
    status === "PUBLISHED";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          掲載操作
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          この媒体の掲載状態を操作できます。
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {canPublish && (
          <button
            type="button"
            onClick={() =>
              updateStatus("PUBLISHED")
            }
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "処理中..."
              : status === "CLOSED"
                ? "再掲載する"
                : "掲載開始"}
          </button>
        )}

        {canClose && (
          <button
            type="button"
            onClick={() =>
              updateStatus("CLOSED")
            }
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "処理中..."
              : "掲載を終了"}
          </button>
        )}
      </div>

      {status === "ERROR" && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          現在この媒体はエラー状態です。
          掲載開始を押すと再掲載状態に変更できます。
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
