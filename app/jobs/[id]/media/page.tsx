import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddMediaForm from "./AddMediaForm";
import MediaEditForm from "./MediaEditForm";
import MediaActionButtons from "./MediaActionButtons";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mediaId?: string;
  }>;
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

function getMediaStatus(status: string) {
  switch (status) {
    case "NOT_PUBLISHED":
      return "未掲載";
    case "PENDING":
      return "掲載処理中";
    case "PUBLISHED":
      return "掲載中";
    case "ERROR":
      return "エラー";
    case "CLOSED":
      return "掲載終了";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "ERROR":
      return "bg-red-100 text-red-700";
    case "CLOSED":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default async function MediaManagementPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { mediaId } = await searchParams;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      company: true,
      mediaListings: true,
    },
  });

  if (!job) {
    notFound();
  }

  const selectedMedia =
    job.mediaListings.find(
      (media) => media.id === mediaId
    ) ?? job.mediaListings[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div>
            <p className="text-xs text-slate-500">
              {job.company.name}
            </p>

            <h1 className="text-xl font-bold">
              媒体管理
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              求人詳細
            </Link>

            <Link
              href="/jobs"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              求人一覧
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium text-slate-500">
            求人
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {job.title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {job.location} / {job.employmentType} / {job.salary}
          </p>
        </section>

        <AddMediaForm
          jobId={job.id}
          existingMedia={job.mediaListings.map(
            (listing) => listing.media
          )}
        />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                掲載媒体
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                この求人を掲載する媒体を管理します。
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {job.mediaListings.length}媒体
            </span>
          </div>

          {job.mediaListings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-medium text-slate-700">
                掲載媒体が登録されていません。
              </p>

              <p className="mt-1 text-sm text-slate-500">
                上の「媒体を追加」から掲載媒体を登録してください。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {job.mediaListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/jobs/${job.id}/media?mediaId=${listing.id}`}
                  className={`rounded-xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm ${
                    selectedMedia?.id === listing.id
                      ? "border-slate-900 ring-1 ring-slate-900"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold">
                        {getMediaName(listing.media)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedMedia?.id === listing.id
                          ? "選択中"
                          : "媒体管理"}
                      </p>
                    </div>

                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        listing.status
                      )}`}
                    >
                      {getMediaStatus(listing.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {selectedMedia && (
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      選択中の媒体
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {getMediaName(selectedMedia.media)}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusClass(
                      selectedMedia.status
                    )}`}
                  >
                    {getMediaStatus(selectedMedia.status)}
                  </span>
                </div>
              </section>

              <MediaActionButtons
                jobId={job.id}
                mediaId={selectedMedia.id}
                status={selectedMedia.status}
              />

              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold">
                    掲載情報
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    外部媒体側の求人情報を確認できます。
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      外部求人ID
                    </p>

                    <p className="mt-1 break-all text-sm font-medium">
                      {selectedMedia.externalJobId || "未設定"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      掲載URL
                    </p>

                    {selectedMedia.listingUrl ? (
                      <a
                        href={selectedMedia.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-sm font-medium text-blue-600 underline"
                      >
                        掲載ページを開く
                      </a>
                    ) : (
                      <p className="mt-1 text-sm">
                        未設定
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      掲載日時
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {selectedMedia.publishedAt
                        ? selectedMedia.publishedAt.toLocaleString("ja-JP")
                        : "未設定"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      掲載終了日時
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {selectedMedia.closedAt
                        ? selectedMedia.closedAt.toLocaleString("ja-JP")
                        : "未設定"}
                    </p>
                  </div>
                </div>
              </section>

              {selectedMedia.errorMessage && (
                <section className="rounded-xl border border-red-200 bg-red-50 p-6">
                  <h2 className="text-sm font-bold text-red-700">
                    エラー内容
                  </h2>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-600">
                    {selectedMedia.errorMessage}
                  </p>
                </section>
              )}
            </div>

            <div>
              <MediaEditForm
                jobId={job.id}
                mediaId={selectedMedia.id}
                initialStatus={selectedMedia.status}
                initialExternalJobId={
                  selectedMedia.externalJobId ?? ""
                }
                initialListingUrl={
                  selectedMedia.listingUrl ?? ""
                }
                initialPublishedAt={
                  selectedMedia.publishedAt
                    ? new Date(selectedMedia.publishedAt)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                initialClosedAt={
                  selectedMedia.closedAt
                    ? new Date(selectedMedia.closedAt)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                initialErrorMessage={
                  selectedMedia.errorMessage ?? ""
                }
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
