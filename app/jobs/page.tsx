"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type MediaType =
  | "INDEED"
  | "JOB_BOX"
  | "ENGAGE"
  | "OTHER";

type MediaStatus =
  | "NOT_PUBLISHED"
  | "PENDING"
  | "PUBLISHED"
  | "ERROR"
  | "CLOSED";

type JobStatus =
  | "DRAFT"
  | "READY"
  | "PUBLISHED"
  | "CLOSED";

type JobMedia = {
  id: string;
  media: MediaType;
  status: MediaStatus;
};

type JobTag = {
  id: string;
  name: string;
};

type JobTagRelation = {
  tag: JobTag;
};

type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  salary: string;
  status: JobStatus;
  updatedAt: string;
  company: {
    name: string;
  };
  mediaListings: JobMedia[];
  tags?: JobTagRelation[];
};

type SortOption =
  | "UPDATED_DESC"
  | "UPDATED_ASC"
  | "TITLE_ASC"
  | "TITLE_DESC"
  | "COMPANY_ASC"
  | "COMPANY_DESC"
  | "STATUS";

function getJobStatusLabel(status: JobStatus) {
  switch (status) {
    case "DRAFT":
      return "下書き";
    case "READY":
      return "公開準備完了";
    case "PUBLISHED":
      return "公開中";
    case "CLOSED":
      return "終了";
    default:
      return status;
  }
}

function getMediaStatusLabel(status?: MediaStatus) {
  switch (status) {
    case "PUBLISHED":
      return "公開中";
    case "PENDING":
      return "処理中";
    case "ERROR":
      return "エラー";
    case "CLOSED":
      return "終了";
    case "NOT_PUBLISHED":
    default:
      return "未掲載";
  }
}

function getJobStatusClass(status: JobStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "READY":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    case "DRAFT":
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
}

function getMediaStatusClass(status?: MediaStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "PENDING":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
    case "ERROR":
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    case "NOT_PUBLISHED":
    default:
      return "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200";
  }
}

function getMediaStatus(job: Job, media: MediaType) {
  return job.mediaListings.find(
    (listing) => listing.media === media
  )?.status;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function JobsPage() {
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const tableContentRef = useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [tags, setTags] = useState<JobTag[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("ALL");
  const [mediaStatus, setMediaStatus] = useState("ALL");

  const [sortOption, setSortOption] =
    useState<SortOption>("UPDATED_DESC");

  const [selectedTagIds, setSelectedTagIds] =
    useState<string[]>([]);

  const [tagSearch, setTagSearch] = useState("");
  const [isTagPopupOpen, setIsTagPopupOpen] =
    useState(false);

  const [deletingJobId, setDeletingJobId] =
    useState<string | null>(null);

  const [selectedJobIds, setSelectedJobIds] =
    useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [jobsResponse, tagsResponse] =
          await Promise.all([
            fetch("/api/jobs"),
            fetch("/api/tags"),
          ]);

        const jobsData =
          await jobsResponse.json();

        const tagsData =
          await tagsResponse.json();

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.error ||
              "求人の取得に失敗しました"
          );
        }

        if (!tagsResponse.ok) {
          throw new Error(
            tagsData.error ||
              "タグの取得に失敗しました"
          );
        }

        setJobs(jobsData.jobs || []);
        setTags(tagsData.tags || []);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "求人の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTags = useMemo(() => {
    const keyword =
      tagSearch.trim().toLowerCase();

    if (!keyword) {
      return tags;
    }

    return tags.filter((tag) =>
      tag.name
        .toLowerCase()
        .includes(keyword)
    );
  }, [tags, tagSearch]);

  const filteredJobs = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !keyword ||
        job.title
          .toLowerCase()
          .includes(keyword) ||
        job.company.name
          .toLowerCase()
          .includes(keyword) ||
        job.location
          .toLowerCase()
          .includes(keyword);

      const matchesJobStatus =
        jobStatus === "ALL" ||
        job.status === jobStatus;

      const mediaStatuses = [
        getMediaStatus(job, "INDEED"),
        getMediaStatus(job, "JOB_BOX"),
        getMediaStatus(job, "ENGAGE"),
      ];

      const matchesMediaStatus =
        mediaStatus === "ALL" ||
        mediaStatuses.includes(
          mediaStatus as MediaStatus
        );

      const matchesTag =
        selectedTagIds.length === 0 ||
        selectedTagIds.every((selectedTagId) =>
          job.tags?.some(
            (relation) =>
              relation.tag.id ===
              selectedTagId
          )
        );

      return (
        matchesSearch &&
        matchesJobStatus &&
        matchesMediaStatus &&
        matchesTag
      );
    });

    const statusOrder: Record<
      JobStatus,
      number
    > = {
      PUBLISHED: 1,
      READY: 2,
      DRAFT: 3,
      CLOSED: 4,
    };

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "UPDATED_ASC":
          return (
            new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime()
          );

        case "UPDATED_DESC":
          return (
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
          );

        case "TITLE_ASC":
          return a.title.localeCompare(
            b.title,
            "ja"
          );

        case "TITLE_DESC":
          return b.title.localeCompare(
            a.title,
            "ja"
          );

        case "COMPANY_ASC":
          return a.company.name.localeCompare(
            b.company.name,
            "ja"
          );

        case "COMPANY_DESC":
          return b.company.name.localeCompare(
            a.company.name,
            "ja"
          );

        case "STATUS":
          return (
            statusOrder[a.status] -
            statusOrder[b.status]
          );

        default:
          return 0;
      }
    });
  }, [
    jobs,
    search,
    jobStatus,
    mediaStatus,
    selectedTagIds,
    sortOption,
  ]);

  const publishedCount = jobs.filter(
    (job) =>
      job.mediaListings.some(
        (listing) =>
          listing.status === "PUBLISHED"
      )
  ).length;

  const draftCount = jobs.filter(
    (job) => job.status === "DRAFT"
  ).length;

  const readyCount = jobs.filter(
    (job) => job.status === "READY"
  ).length;

  const errorMediaCount = jobs.filter(
    (job) =>
      job.mediaListings.some(
        (listing) =>
          listing.status === "ERROR"
      )
  ).length;

  const toggleJobSelection = (
    jobId: string
  ) => {
    setSelectedJobIds((current) =>
      current.includes(jobId)
        ? current.filter(
            (id) => id !== jobId
          )
        : [...current, jobId]
    );
  };

  const toggleSelectAll = () => {
    const visibleJobIds =
      filteredJobs.map(
        (job) => job.id
      );

    const allSelected =
      visibleJobIds.length > 0 &&
      visibleJobIds.every((id) =>
        selectedJobIds.includes(id)
      );

    if (allSelected) {
      setSelectedJobIds((current) =>
        current.filter(
          (id) =>
            !visibleJobIds.includes(id)
        )
      );
    } else {
      setSelectedJobIds((current) => [
        ...current,
        ...visibleJobIds.filter(
          (id) =>
            !current.includes(id)
        ),
      ]);
    }
  };

  const handleDeleteJob = async (
    jobId: string,
    jobTitle: string
  ) => {
    const confirmed =
      window.confirm(
        `「${jobTitle}」を削除しますか？\n\nこの操作は取り消せません。`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingJobId(jobId);

      const response = await fetch(
        `/api/jobs/${jobId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "求人の削除に失敗しました"
        );
      }

      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) => job.id !== jobId
        )
      );

      setSelectedJobIds((current) =>
        current.filter(
          (id) => id !== jobId
        )
      );
    } catch (error) {
      console.error(
        "求人削除エラー:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "求人の削除に失敗しました"
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  useEffect(() => {
    const tableScroll =
      tableScrollRef.current;

    const bottomScroll =
      bottomScrollRef.current;

    if (
      !tableScroll ||
      !bottomScroll
    ) {
      return;
    }

    const syncFromTable = () => {
      bottomScroll.scrollLeft =
        tableScroll.scrollLeft;
    };

    const syncFromBottom = () => {
      tableScroll.scrollLeft =
        bottomScroll.scrollLeft;
    };

    tableScroll.addEventListener(
      "scroll",
      syncFromTable
    );

    bottomScroll.addEventListener(
      "scroll",
      syncFromBottom
    );

    return () => {
      tableScroll.removeEventListener(
        "scroll",
        syncFromTable
      );

      bottomScroll.removeEventListener(
        "scroll",
        syncFromBottom
      );
    };
  }, [filteredJobs.length]);

  useEffect(() => {
    const updateWidth = () => {
      const table =
        tableScrollRef.current?.querySelector(
          "table"
        );

      if (
        !table ||
        !tableContentRef.current
      ) {
        return;
      }

      tableContentRef.current.style.width =
        `${table.scrollWidth}px`;
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, [filteredJobs.length]);

  const hasFilters =
    search.trim() !== "" ||
    jobStatus !== "ALL" ||
    mediaStatus !== "ALL" ||
    selectedTagIds.length > 0;

  const resetFilters = () => {
    setSearch("");
    setJobStatus("ALL");
    setMediaStatus("ALL");
    setSelectedTagIds([]);
    setTagSearch("");
    setIsTagPopupOpen(false);
    setSortOption("UPDATED_DESC");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              求人管理
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              求人情報と求人媒体への掲載状況を一元管理
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                selectedJobIds.length === 0
              }
              onClick={() => {
                const params =
                  new URLSearchParams({
                    ids: selectedJobIds.join(
                      ","
                    ),
                  });

                window.location.href =
                  `/api/jobs/export?${params.toString()}`;
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedJobIds.length > 0
                ? `CSVエクスポート (${selectedJobIds.length}件)`
                : "CSVエクスポート"}
            </button>

            <Link
              href="/jobs/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              ＋ 新しい求人を作成
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-6">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              求人総数
            </p>

            <p className="mt-2 text-3xl font-bold">
              {jobs.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              登録されている求人の総数
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              掲載中
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {publishedCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              いずれかの媒体で掲載中
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              公開準備完了
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {readyCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              媒体への掲載準備が完了
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              媒体エラー
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {errorMediaCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              掲載処理でエラーが発生
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  求人を検索・絞り込み
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  求人名・会社名・勤務地・ステータス・タグで検索できます
                </p>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  フィルターをリセット
                </button>
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  キーワード
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="求人名・会社名・勤務地"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  求人ステータス
                </label>

                <select
                  value={jobStatus}
                  onChange={(event) =>
                    setJobStatus(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="ALL">
                    すべて
                  </option>
                  <option value="DRAFT">
                    下書き
                  </option>
                  <option value="READY">
                    公開準備完了
                  </option>
                  <option value="PUBLISHED">
                    公開中
                  </option>
                  <option value="CLOSED">
                    終了
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  媒体掲載ステータス
                </label>

                <select
                  value={mediaStatus}
                  onChange={(event) =>
                    setMediaStatus(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="ALL">
                    すべて
                  </option>
                  <option value="PUBLISHED">
                    公開中
                  </option>
                  <option value="NOT_PUBLISHED">
                    未掲載
                  </option>
                  <option value="PENDING">
                    処理中
                  </option>
                  <option value="ERROR">
                    エラー
                  </option>
                  <option value="CLOSED">
                    終了
                  </option>
                </select>
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium">
                  タグ
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setIsTagPopupOpen(
                      (current) => !current
                    )
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-left text-sm transition hover:border-slate-400 focus:border-slate-500"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <span>🔍</span>

                    <span>
                      {selectedTagIds.length ===
                      0
                        ? "タグを選択"
                        : `${selectedTagIds.length}個のタグを選択中`}
                    </span>
                  </span>

                  <span className="text-slate-400">
                    {isTagPopupOpen
                      ? "▲"
                      : "▼"}
                  </span>
                </button>

                {isTagPopupOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          タグを選択
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          複数のタグを選択できます
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setIsTagPopupOpen(
                            false
                          )
                        }
                        className="text-lg text-slate-400 hover:text-slate-700"
                      >
                        ×
                      </button>
                    </div>

                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(event) =>
                        setTagSearch(
                          event.target.value
                        )
                      }
                      placeholder="タグを検索..."
                      autoFocus
                      className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    />

                    <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-2">
                      {filteredTags.length ===
                      0 ? (
                        <div className="px-2 py-6 text-center text-xs text-slate-400">
                          該当するタグがありません
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredTags.map(
                            (tag) => {
                              const checked =
                                selectedTagIds.includes(
                                  tag.id
                                );

                              return (
                                <label
                                  key={tag.id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                                    checked
                                      ? "bg-slate-100"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      checked
                                    }
                                    onChange={() => {
                                      setSelectedTagIds(
                                        (
                                          current
                                        ) =>
                                          current.includes(
                                            tag.id
                                          )
                                            ? current.filter(
                                                (
                                                  id
                                                ) =>
                                                  id !==
                                                  tag.id
                                              )
                                            : [
                                                ...current,
                                                tag.id,
                                              ]
                                      );
                                    }}
                                    className="h-4 w-4 rounded border-slate-300"
                                  />

                                  <span>
                                    {tag.name}
                                  </span>
                                </label>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-xs text-slate-500">
                        {selectedTagIds.length >
                        0
                          ? `${selectedTagIds.length}個選択中`
                          : "タグ未選択"}
                      </span>

                      <div className="flex gap-2">
                        {selectedTagIds.length >
                          0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTagIds(
                                []
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            クリア
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setIsTagPopupOpen(
                              false
                            )
                          }
                          className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          完了
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="text-xs text-slate-500">
                {filteredJobs.length}件の求人を表示
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="job-sort"
                  className="text-sm font-medium"
                >
                  並び替え
                </label>

                <select
                  id="job-sort"
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(
                      event.target
                        .value as SortOption
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="UPDATED_DESC">
                    更新日：新しい順
                  </option>

                  <option value="UPDATED_ASC">
                    更新日：古い順
                  </option>

                  <option value="TITLE_ASC">
                    求人名：昇順
                  </option>

                  <option value="TITLE_DESC">
                    求人名：降順
                  </option>

                  <option value="COMPANY_ASC">
                    会社名：昇順
                  </option>

                  <option value="COMPANY_DESC">
                    会社名：降順
                  </option>

                  <option value="STATUS">
                    ステータス順
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold">
                求人一覧
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {loading
                  ? "読み込み中..."
                  : `${filteredJobs.length}件表示 / ${jobs.length}件`}
              </p>
            </div>

            {selectedJobIds.length > 0 && (
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                {selectedJobIds.length}件選択中
              </div>
            )}
          </div>

          {loading && (
            <div className="p-12 text-center text-sm text-slate-500">
              求人情報を読み込んでいます...
            </div>
          )}

          {error && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            filteredJobs.length === 0 && (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                  🔍
                </div>

                <p className="mt-4 font-medium text-slate-700">
                  求人が見つかりません
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  検索条件を変更するか、新しい求人を作成してください。
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    フィルターをリセット
                  </button>
                )}
              </div>
            )}

          {!loading &&
            !error &&
            filteredJobs.length > 0 && (
              <div className="relative">
                <div
                  ref={tableScrollRef}
                  className="overflow-x-auto pb-3"
                  style={{
                    scrollbarGutter:
                      "stable",
                  }}
                >
                  <table className="w-full min-w-[1450px] text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-left">
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={
                              filteredJobs.length >
                                0 &&
                              filteredJobs.every(
                                (job) =>
                                  selectedJobIds.includes(
                                    job.id
                                  )
                              )
                            }
                            onChange={
                              toggleSelectAll
                            }
                            className="h-4 w-4 rounded border-slate-300"
                            aria-label="すべて選択"
                          />
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          求人
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          タグ
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          勤務地
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          雇用形態
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          給与
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          Indeed
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          JOB BOX
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          engage
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          求人ステータス
                        </th>

                        <th className="px-5 py-3 font-medium text-slate-500">
                          更新日
                        </th>

                        <th className="sticky right-0 z-20 min-w-[150px] border-l border-slate-200 bg-slate-50 px-5 py-3 font-medium text-slate-500">
                          操作
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredJobs.map(
                        (job) => {
                          const indeedStatus =
                            getMediaStatus(
                              job,
                              "INDEED"
                            );

                          const jobBoxStatus =
                            getMediaStatus(
                              job,
                              "JOB_BOX"
                            );

                          const engageStatus =
                            getMediaStatus(
                              job,
                              "ENGAGE"
                            );

                          return (
                            <tr
                              key={job.id}
                              onClick={() => {
                                window.location.href =
                                  `/jobs/${job.id}`;
                              }}
                              className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                            >
                              <td className="w-12 px-4 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedJobIds.includes(
                                    job.id
                                  )}
                                  onChange={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    toggleJobSelection(
                                      job.id
                                    );
                                  }}
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();
                                  }}
                                  className="h-4 w-4 rounded border-slate-300"
                                  aria-label={`${job.title}を選択`}
                                />
                              </td>

                              <td className="px-5 py-4">
                                <div className="max-w-[280px]">
                                  <p className="font-semibold text-slate-900">
                                    {job.title}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {job.company.name}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex max-w-[220px] flex-wrap gap-1.5">
                                  {job.tags &&
                                  job.tags.length >
                                    0 ? (
                                    <>
                                      {job.tags
                                        .slice(
                                          0,
                                          3
                                        )
                                        .map(
                                          (
                                            relation
                                          ) => (
                                            <span
                                              key={
                                                relation
                                                  .tag
                                                  .id
                                              }
                                              className="inline-flex max-w-[100px] truncate whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                                              title={
                                                relation
                                                  .tag
                                                  .name
                                              }
                                            >
                                              {
                                                relation
                                                  .tag
                                                  .name
                                              }
                                            </span>
                                          )
                                        )}

                                      {job.tags
                                        .length >
                                        3 && (
                                        <span
                                          className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500"
                                          title={job.tags
                                            .slice(
                                              3
                                            )
                                            .map(
                                              (
                                                relation
                                              ) =>
                                                relation
                                                  .tag
                                                  .name
                                            )
                                            .join(
                                              ", "
                                            )}
                                        >
                                          +
                                          {job.tags
                                            .length -
                                            3}
                                          件
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      タグなし
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4 text-slate-600">
                                {job.location}
                              </td>

                              <td className="px-5 py-4 text-slate-600">
                                {
                                  job.employmentType
                                }
                              </td>

                              <td className="px-5 py-4 text-slate-600">
                                {job.salary}
                              </td>

                              <td className="px-5 py-4">
                                <Link
                                  href={`/jobs/${job.id}/media/INDEED`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                  }}
                                  className="inline-flex items-center gap-2"
                                >
                                  <span
                                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getMediaStatusClass(
                                      indeedStatus
                                    )}`}
                                  >
                                    {getMediaStatusLabel(
                                      indeedStatus
                                    )}
                                  </span>

                                  <span className="whitespace-nowrap text-xs font-medium text-slate-500 hover:text-slate-900">
                                    原稿編集 →
                                  </span>
                                </Link>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getMediaStatusClass(
                                    jobBoxStatus
                                  )}`}
                                >
                                  {getMediaStatusLabel(
                                    jobBoxStatus
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getMediaStatusClass(
                                    engageStatus
                                  )}`}
                                >
                                  {getMediaStatusLabel(
                                    engageStatus
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getJobStatusClass(
                                    job.status
                                  )}`}
                                >
                                  {getJobStatusLabel(
                                    job.status
                                  )}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                                {formatUpdatedAt(
                                  job.updatedAt
                                )}
                              </td>

                              <td className="sticky right-0 z-10 min-w-[150px] border-l border-slate-200 bg-white px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/jobs/${job.id}/edit`}
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();
                                    }}
                                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
                                  >
                                    編集
                                  </Link>

                                  <button
                                    type="button"
                                    disabled={
                                      deletingJobId ===
                                      job.id
                                    }
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      handleDeleteJob(
                                        job.id,
                                        job.title
                                      );
                                    }}
                                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingJobId ===
                                    job.id
                                      ? "削除中..."
                                      : "削除"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
        <div
          ref={bottomScrollRef}
          className="overflow-x-auto"
        >
          <div
            ref={tableContentRef}
            className="h-4"
          />
        </div>
      </div>
    </div>
  );
}

