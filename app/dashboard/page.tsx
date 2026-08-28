"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type JobMedia = {
  id: string;
  media: "INDEED" | "JOB_BOX" | "ENGAGE" | "OTHER";
  status:
    | "NOT_PUBLISHED"
    | "PENDING"
    | "PUBLISHED"
    | "ERROR"
    | "CLOSED";
};

type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  salary: string;
  status: "DRAFT" | "READY" | "PUBLISHED" | "CLOSED";
  updatedAt: string;
  company: {
    name: string;
  };
  mediaListings: JobMedia[];
};

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/jobs", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "求人情報の取得に失敗しました。"
          );
        }

        setJobs(data.jobs || []);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "求人情報の取得に失敗しました。"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const stats = useMemo(() => {
    const published = jobs.filter((job) =>
      job.mediaListings?.some(
        (media) => media.status === "PUBLISHED"
      )
    ).length;

    const errors = jobs.filter((job) =>
      job.mediaListings?.some(
        (media) => media.status === "ERROR"
      )
    ).length;

    return {
      total: jobs.length,
      published,
      errors,
      applicants: 0,
    };
  }, [jobs]);

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [jobs]);

  const getJobStatus = (status: Job["status"]) => {
    switch (status) {
      case "DRAFT":
        return "下書き";
      case "READY":
        return "掲載準備完了";
      case "PUBLISHED":
        return "掲載中";
      case "CLOSED":
        return "掲載終了";
      default:
        return status;
    }
  };

  const getJobStatusClass = (status: Job["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-700";
      case "READY":
        return "bg-blue-100 text-blue-700";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-700";
      case "CLOSED":
        return "bg-slate-200 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="p-6">
        <section className="mb-6">
          <h2 className="text-2xl font-bold">
            求人・媒体管理
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            求人の作成・管理と、各求人媒体への掲載状況を一元管理します。
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="登録求人"
            value={loading ? "-" : String(stats.total)}
            unit="件"
          />

          <Stat
            label="掲載中"
            value={loading ? "-" : String(stats.published)}
            unit="件"
          />

          <Stat
            label="応募者"
            value={String(stats.applicants)}
            unit="人"
          />

          <Stat
            label="掲載エラー"
            value={loading ? "-" : String(stats.errors)}
            unit="件"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-semibold">
                  最近の求人
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  最近更新された求人を表示しています。
                </p>
              </div>

              <Link
                href="/jobs"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                すべて見る →
              </Link>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                求人情報を読み込んでいます...
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center p-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    📋
                  </div>

                  <p className="mt-4 font-semibold">
                    まだ求人がありません
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    最初の求人を登録しましょう。
                  </p>

                  <Link
                    href="/jobs/new"
                    className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    求人を登録する
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {job.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {job.company.name}
                        {" ・ "}
                        {job.location}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getJobStatusClass(
                        job.status
                      )}`}
                    >
                      {getJobStatus(job.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold">
                媒体掲載状況
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                現在の求人媒体への掲載状況です。
              </p>
            </div>

            <div className="space-y-3 p-5">
              <MediaStatus
                name="Indeed"
                jobs={jobs}
                media="INDEED"
              />

              <MediaStatus
                name="JOB BOX"
                jobs={jobs}
                media="JOB_BOX"
              />

              <MediaStatus
                name="engage"
                jobs={jobs}
                media="ENGAGE"
              />

              <Link
                href="/jobs"
                className="mt-2 block w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium hover:bg-slate-50"
              >
                媒体を管理する
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold">
            自動化機能
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            求人作成から各媒体への掲載までを効率化します。
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium">
              AI求人生成
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium">
              Indeed自動掲載
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium">
              複数媒体管理
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium">
              応募者管理
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold">
          {value}
        </span>

        <span className="mb-1 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MediaStatus({
  name,
  jobs,
  media,
}: {
  name: string;
  jobs: Job[];
  media: JobMedia["media"];
}) {
  const listings = jobs.flatMap((job) =>
    (job.mediaListings ?? []).filter(
      (listing) => listing.media === media
    )
  );

  const published = listings.filter(
    (listing) => listing.status === "PUBLISHED"
  ).length;

  const errors = listings.filter(
    (listing) => listing.status === "ERROR"
  ).length;

  let status = "未掲載";
  let statusClass = "text-slate-500";

  if (errors > 0) {
    status = `エラー ${errors}件`;
    statusClass = "text-red-600";
  } else if (published > 0) {
    status = `掲載中 ${published}件`;
    statusClass = "text-green-600";
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            errors > 0
              ? "bg-red-500"
              : published > 0
                ? "bg-green-500"
                : "bg-slate-300"
          }`}
        />

        <span className="text-sm font-medium">
          {name}
        </span>
      </div>

      <span
        className={`text-xs font-medium ${statusClass}`}
      >
        {status}
      </span>
    </div>
  );
}
