"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

type Company = {
  id: string;
  name: string;
};

type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  salary: string;

  workingHours?: string | null;
  description?: string | null;
  requirements?: string | null;
  holidays?: string | null;
  benefits?: string | null;
  sourceText?: string | null;

  jobCategory?: string | null;
  position?: string | null;
  recruitmentCount?: number | null;
  locationDetail?: string | null;
  nearestStation?: string | null;
  access?: string | null;
  breakTime?: string | null;
  overtime?: string | null;
  transfer?: string | null;
  businessTrip?: string | null;

  salaryType?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  fixedOvertimePay?: string | null;
  fixedOvertimeHours?: string | null;
  transportation?: string | null;
  bonus?: string | null;
  raise?: string | null;
  incentive?: string | null;

  annualHolidays?: string | null;
  paidLeave?: string | null;
  longVacation?: string | null;
  otherLeave?: string | null;

  socialInsurance?: string | null;
  employmentInsurance?: string | null;
  workersCompensation?: string | null;
  pension?: string | null;

  requiredConditions?: string | null;
  preferredConditions?: string | null;
  qualifications?: string | null;
  experience?: string | null;
  education?: string | null;
  ageCondition?: string | null;
  pcSkills?: string | null;
  driverLicense?: string | null;

  applicationMethod?: string | null;
  selectionProcess?: string | null;
  interviewCount?: string | null;
  interviewLocation?: string | null;
  requiredDocuments?: string | null;

  recruiterName?: string | null;
  recruiterEmail?: string | null;
  recruiterPhone?: string | null;

  status: JobStatus;
  createdAt: string;
  updatedAt: string;

  company: Company;
  tags?: JobTagRelation[];
  mediaListings?: JobMedia[];
};

const mediaTypes: MediaType[] = [
  "INDEED",
  "JOB_BOX",
  "ENGAGE",
  "OTHER",
];

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

function getJobStatusClass(status: JobStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-700";
    case "READY":
      return "bg-blue-100 text-blue-700";
    case "CLOSED":
      return "bg-slate-200 text-slate-600";
    case "DRAFT":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getMediaName(media: MediaType) {
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

function getMediaActionLabel(status: MediaStatus) {
  switch (status) {
    case "PUBLISHED":
      return "掲載停止";
    case "PENDING":
      return "処理中";
    case "ERROR":
      return "再試行";
    case "CLOSED":
      return "再掲載";
    case "NOT_PUBLISHED":
    default:
      return "掲載準備";
  }
}

function getMediaDescription(
  media: MediaType,
  status: MediaStatus
) {
  if (status === "PUBLISHED") {
    return `${getMediaName(media)} に現在掲載されています。`;
  }

  if (status === "PENDING") {
    return `${getMediaName(media)} への掲載処理を実行しています。`;
  }

  if (status === "ERROR") {
    return `${getMediaName(media)} への掲載処理でエラーが発生しています。`;
  }

  if (status === "CLOSED") {
    return `${getMediaName(media)} での掲載は終了しています。`;
  }

  return `${getMediaName(media)} には現在掲載されていません。`;
}

function getMediaActionClass(status: MediaStatus) {
  switch (status) {
    case "PUBLISHED":
      return "border-red-200 bg-white text-red-600 hover:bg-red-50";

    case "ERROR":
      return "bg-slate-900 text-white hover:bg-slate-700";

    case "CLOSED":
      return "bg-slate-900 text-white hover:bg-slate-700";

    case "PENDING":
      return "cursor-not-allowed bg-slate-100 text-slate-400";

    case "NOT_PUBLISHED":
    default:
      return "bg-slate-900 text-white hover:bg-slate-700";
  }
}

function getMediaIcon(media: MediaType) {
  switch (media) {
    case "INDEED":
      return "I";

    case "JOB_BOX":
      return "J";

    case "ENGAGE":
      return "E";

    case "OTHER":
      return "O";

    default:
      return "?";
  }
}
function getMediaStatusClass(status?: MediaStatus) {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-blue-100 text-blue-700";
    case "ERROR":
      return "bg-red-100 text-red-700";
    case "CLOSED":
      return "bg-slate-200 text-slate-600";
    case "NOT_PUBLISHED":
    default:
      return "bg-slate-100 text-slate-500";
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return (
    <div className="grid gap-2 border-b border-slate-100 py-3 last:border-0 md:grid-cols-[180px_1fr]">
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>

      <dd className="whitespace-pre-wrap text-sm text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="px-5 py-2">
        {children}
      </div>
    </section>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/jobs/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "求人情報の取得に失敗しました"
          );
        }

        setJob(data.data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "求人情報の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!job) {
      return;
    }

    const confirmed = window.confirm(
      `「${job.title}」を削除しますか？\n\nこの操作は取り消せません。`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/jobs/${job.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "求人の削除に失敗しました"
        );
      }

      router.push("/jobs");
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "求人の削除に失敗しました"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            求人情報を読み込んでいます...
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/jobs"
            className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-900"
          >
            ← 求人一覧に戻る
          </Link>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error ||
              "求人情報が見つかりませんでした。"}
          </div>
        </div>
      </div>
    );
  }

  const listings = job.mediaListings ?? [];

  const publishedMediaCount =
    listings.filter(
      (item) => item.status === "PUBLISHED"
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div>
            <Link
              href="/jobs"
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              ← 求人一覧
            </Link>

            <h1 className="mt-1 text-xl font-bold">
              求人詳細
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${job.id}/edit`}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              編集
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getJobStatusClass(
                    job.status
                  )}`}
                >
                  {getJobStatusLabel(
                    job.status
                  )}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {job.employmentType}
                </span>

                {job.jobCategory && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {job.jobCategory}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                {job.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {job.company.name}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <span>📍 {job.location}</span>
                <span>💰 {job.salary}</span>
                {job.nearestStation && (
                  <span>
                    🚉 {job.nearestStation}
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-[220px] rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                求人媒体掲載状況
              </p>

              <p className="mt-1 text-2xl font-bold">
                {publishedMediaCount}
                <span className="ml-1 text-sm font-normal text-slate-500">
                  / {mediaTypes.length}媒体
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                現在掲載中の媒体数
              </p>
            </div>
          </div>
        </section>

        <Section title="求人媒体の掲載状況">
          <div className="py-5">

            <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  掲載媒体を管理
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  各求人媒体への掲載状況を確認できます。
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  掲載中
                  <strong className="ml-1 text-green-600">
                    {publishedMediaCount}
                  </strong>
                </span>

                <span className="text-slate-300">
                  /
                </span>

                <span>
                  全{mediaTypes.length}媒体
                </span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">

              {mediaTypes.map((media) => {
                const listing = listings.find(
                  (item) => item.media === media
                );

                const status: MediaStatus =
                  listing?.status ||
                  "NOT_PUBLISHED";

                return (
                  <div
                    key={media}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >

                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                          {getMediaIcon(media)}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {getMediaName(media)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            求人媒体
                          </p>
                        </div>

                      </div>

                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getMediaStatusClass(
                          status
                        )}`}
                      >
                        {getMediaStatusLabel(status)}
                      </span>

                    </div>

                    <div className="p-5">

                      <p className="min-h-[40px] text-sm leading-6 text-slate-600">
                        {getMediaDescription(
                          media,
                          status
                        )}
                      </p>

                      <Link
                        href={`/jobs/${job.id}/media/${media}`}
                        className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        掲載原稿を編集
                        <span className="ml-2 text-slate-400">
                          →
                        </span>
                      </Link>

                      <div className="mt-3 flex items-center justify-between gap-3">

                        <div className="text-xs text-slate-400">
                          {listing
                            ? `掲載情報あり`
                            : "掲載情報なし"}
                        </div>

                        <button
                          type="button"
                          disabled={status === "PENDING"}
                          onClick={() => {
                            window.alert(
                              `${getMediaName(
                                media
                              )} の「${getMediaActionLabel(
                                status
                              )}」機能は次のSTEPでAPI連携します。`
                            );
                          }}
                          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${getMediaActionClass(
                            status
                          )}`}
                        >
                          {getMediaActionLabel(status)}
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">

                <div className="mt-0.5 text-blue-600">
                  ℹ
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    媒体連携について
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    現在は掲載状況の表示のみ対応しています。
                    媒体への掲載・停止・再掲載などの実際の操作は、
                    次のSTEPでAPI連携を実装します。
                  </p>
                </div>

              </div>
            </div>

          </div>
        </Section>

        {job.tags &&
          job.tags.length > 0 && (
            <Section title="タグ">
              <div className="flex flex-wrap gap-2 py-4">
                {job.tags.map((relation) => (
                  <span
                    key={relation.tag.id}
                    className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                  >
                    {relation.tag.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

        <Section title="仕事内容">
          <dl>
            <InfoRow
              label="仕事内容"
              value={job.description}
            />

            <InfoRow
              label="職種"
              value={job.position}
            />

            <InfoRow
              label="募集人数"
              value={job.recruitmentCount}
            />

            <InfoRow
              label="勤務地詳細"
              value={job.locationDetail}
            />

            <InfoRow
              label="最寄駅"
              value={job.nearestStation}
            />

            <InfoRow
              label="アクセス"
              value={job.access}
            />
          </dl>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="勤務条件">
            <dl>
              <InfoRow
                label="勤務時間"
                value={job.workingHours}
              />

              <InfoRow
                label="休憩時間"
                value={job.breakTime}
              />

              <InfoRow
                label="残業"
                value={job.overtime}
              />

              <InfoRow
                label="休日"
                value={job.holidays}
              />

              <InfoRow
                label="年間休日"
                value={job.annualHolidays}
              />

              <InfoRow
                label="有給休暇"
                value={job.paidLeave}
              />

              <InfoRow
                label="長期休暇"
                value={job.longVacation}
              />

              <InfoRow
                label="その他休暇"
                value={job.otherLeave}
              />

              <InfoRow
                label="転勤"
                value={job.transfer}
              />

              <InfoRow
                label="出張"
                value={job.businessTrip}
              />
            </dl>
          </Section>

          <Section title="給与・待遇">
            <dl>
              <InfoRow
                label="給与"
                value={job.salary}
              />

              <InfoRow
                label="給与形態"
                value={job.salaryType}
              />

              <InfoRow
                label="最低給与"
                value={job.minSalary}
              />

              <InfoRow
                label="最高給与"
                value={job.maxSalary}
              />

              <InfoRow
                label="固定残業代"
                value={job.fixedOvertimePay}
              />

              <InfoRow
                label="固定残業時間"
                value={job.fixedOvertimeHours}
              />

              <InfoRow
                label="交通費"
                value={job.transportation}
              />

              <InfoRow
                label="賞与"
                value={job.bonus}
              />

              <InfoRow
                label="昇給"
                value={job.raise}
              />

              <InfoRow
                label="インセンティブ"
                value={job.incentive}
              />
            </dl>
          </Section>
        </div>

        <Section title="福利厚生・保険">
          <dl>
            <InfoRow
              label="福利厚生"
              value={job.benefits}
            />

            <InfoRow
              label="社会保険"
              value={job.socialInsurance}
            />

            <InfoRow
              label="雇用保険"
              value={job.employmentInsurance}
            />

            <InfoRow
              label="労災保険"
              value={job.workersCompensation}
            />

            <InfoRow
              label="厚生年金"
              value={job.pension}
            />
          </dl>
        </Section>

        <Section title="応募条件">
          <dl>
            <InfoRow
              label="必須条件"
              value={job.requiredConditions}
            />

            <InfoRow
              label="歓迎条件"
              value={job.preferredConditions}
            />

            <InfoRow
              label="資格"
              value={job.qualifications}
            />

            <InfoRow
              label="経験"
              value={job.experience}
            />

            <InfoRow
              label="学歴"
              value={job.education}
            />

            <InfoRow
              label="年齢条件"
              value={job.ageCondition}
            />

            <InfoRow
              label="PCスキル"
              value={job.pcSkills}
            />

            <InfoRow
              label="運転免許"
              value={job.driverLicense}
            />

            <InfoRow
              label="応募条件"
              value={job.requirements}
            />
          </dl>
        </Section>

        <Section title="応募・選考">
          <dl>
            <InfoRow
              label="応募方法"
              value={job.applicationMethod}
            />

            <InfoRow
              label="選考フロー"
              value={job.selectionProcess}
            />

            <InfoRow
              label="面接回数"
              value={job.interviewCount}
            />

            <InfoRow
              label="面接場所"
              value={job.interviewLocation}
            />

            <InfoRow
              label="必要書類"
              value={job.requiredDocuments}
            />
          </dl>
        </Section>

        <Section title="採用担当者">
          <dl>
            <InfoRow
              label="担当者名"
              value={job.recruiterName}
            />

            <InfoRow
              label="メールアドレス"
              value={job.recruiterEmail}
            />

            <InfoRow
              label="電話番号"
              value={job.recruiterPhone}
            />
          </dl>
        </Section>

        <Section title="管理情報">
          <dl>
            <InfoRow
              label="求人ID"
              value={job.id}
            />

            <InfoRow
              label="会社"
              value={job.company.name}
            />

            <InfoRow
              label="作成日時"
              value={new Date(
                job.createdAt
              ).toLocaleString("ja-JP")}
            />

            <InfoRow
              label="最終更新"
              value={new Date(
                job.updatedAt
              ).toLocaleString("ja-JP")}
            />

            <InfoRow
              label="原文データ"
              value={job.sourceText}
            />
          </dl>
        </Section>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <Link
            href="/jobs"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← 求人一覧に戻る
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/jobs/${job.id}/edit`}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              この求人を編集
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


