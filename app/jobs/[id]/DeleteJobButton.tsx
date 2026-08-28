"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteJobButtonProps = {
  jobId: string;
};

export default function DeleteJobButton({
  jobId,
}: DeleteJobButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "この求人を削除しますか？\n\n削除した求人は元に戻せません。"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "求人の削除に失敗しました。");
      }

      alert("求人を削除しました。");

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error("求人削除エラー:", error);

      alert(
        error instanceof Error
          ? error.message
          : "求人の削除に失敗しました。"
      );

      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "削除中..." : "求人を削除"}
    </button>
  );
}