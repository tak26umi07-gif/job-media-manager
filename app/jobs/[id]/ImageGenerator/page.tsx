"use client";

import { useRef, useState } from "react";

type JobImage = {
  id: string;
  imageUrl: string;
  isMain: boolean;
  createdAt: string;
  prompt?: string | null;
};

type Props = {
  jobId: string;
  initialImages: JobImage[];
};

export default function ImageGenerator({
  jobId,
  initialImages,
}: Props) {
  const [images, setImages] =
    useState<JobImage[]>(initialImages);

  const [generating, setGenerating] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [mainId, setMainId] =
    useState<string | null>(null);

  const [editInstruction, setEditInstruction] =
    useState("");

  const [editingImageId, setEditingImageId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (generating) {
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/image`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "求人画像の生成に失敗しました。"
        );
      }

      if (data.image) {
        setImages((prev) => [
          data.image,
          ...prev,
        ]);
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "求人画像の生成に失敗しました。"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `/api/jobs/${jobId}/images/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "画像のアップロードに失敗しました。"
        );
      }

      if (data.image) {
        setImages((prev) => [
          data.image,
          ...prev,
        ]);
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました。"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (
    imageId: string
  ) => {
    if (!editInstruction.trim()) {
      setError("AIへの編集指示を入力してください。");
      return;
    }

    setEditingId(imageId);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/image/${imageId}/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instruction:
              editInstruction.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "AI画像編集に失敗しました。"
        );
      }

      if (data.image) {
        setImages((prev) => [
          data.image,
          ...prev,
        ]);
      }

      setEditInstruction("");
      setEditingImageId(null);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "AI画像編集に失敗しました。"
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (
    imageId: string
  ) => {
    const confirmed = window.confirm(
      "この画像を削除しますか？"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(imageId);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/image/${imageId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "画像の削除に失敗しました。"
        );
      }

      setImages((prev) =>
        prev.filter(
          (image) => image.id !== imageId
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "画像の削除に失敗しました。"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetMain = async (
    imageId: string
  ) => {
    setMainId(imageId);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/image/${imageId}/main`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "メイン画像の変更に失敗しました。"
        );
      }

      setImages((prev) =>
        prev.map((image) => ({
          ...image,
          isMain: image.id === imageId,
        }))
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "メイン画像の変更に失敗しました。"
      );
    } finally {
      setMainId(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold">
            求人画像
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            AI生成・AI編集・画像アップロードを管理できます。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? "AI生成中..."
              : "AIで新規生成"}
          </button>

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "アップロード中..."
              : "画像をアップロード"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {generating && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            AIが求人内容を分析して画像を作成しています。
          </p>

          <p className="mt-2 text-xs text-slate-500">
            しばらくお待ちください。
          </p>
        </div>
      )}

      {uploading && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            画像をアップロードしています。
          </p>
        </div>
      )}

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            まだ求人画像がありません。
          </p>

          <p className="mt-2 text-xs text-slate-500">
            AI生成または画像アップロードから追加できます。
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-[3/2] bg-slate-100">
                <img
                  src={image.imageUrl}
                  alt="求人画像"
                  className="h-full w-full object-cover"
                />

                {image.isMain && (
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                    メイン画像
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {new Date(
                      image.createdAt
                    ).toLocaleString("ja-JP")}
                  </p>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {image.prompt?.startsWith(
                      "アップロード"
                    )
                      ? "アップロード"
                      : image.prompt?.startsWith(
                            "AI編集"
                          )
                        ? "AI編集"
                        : "AI生成"}
                  </span>
                </div>

                {editingImageId === image.id && (
                  <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-medium">
                      AIへの編集指示
                    </label>

                    <textarea
                      value={editInstruction}
                      onChange={(e) =>
                        setEditInstruction(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="例：背景を明るいオフィスに変更してください。人物はそのまま残してください。"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImageId(null);
                          setEditInstruction("");
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-white"
                      >
                        キャンセル
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(image.id)
                        }
                        disabled={
                          editingId === image.id
                        }
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        {editingId === image.id
                          ? "AI編集中..."
                          : "この指示で編集"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {!image.isMain && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetMain(image.id)
                      }
                      disabled={mainId === image.id}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      {mainId === image.id
                        ? "変更中..."
                        : "メインに設定"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingImageId(
                        editingImageId === image.id
                          ? null
                          : image.id
                      );
                      setError("");
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                  >
                    AIで編集
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(image.id)
                    }
                    disabled={
                      deletingId === image.id
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === image.id
                      ? "削除中..."
                      : "削除"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
