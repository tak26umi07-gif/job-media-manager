"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type MediaType = "INDEED" | "JOB_BOX" | "ENGAGE";

type JobMedia = {
  id: string;
  media: MediaType;
  status:
    | "NOT_PUBLISHED"
    | "PENDING"
    | "PUBLISHED"
    | "ERROR"
    | "CLOSED";
  externalJobId?: string | null;
  listingUrl?: string | null;
};

type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  salary: string;
  description?: string | null;
  requirements?: string | null;
  workingHours?: string | null;
  holidays?: string | null;
  benefits?: string | null;

  // AI解析用の元案件情報
  sourceText?: string | null;

  company: {
    id: string;
    name: string;
  };

  mediaListings?: JobMedia[];
};

type MediaContent = {
  title: string;
  category: string;
  catchCopy: string;
  companyName: string;

  postalCode: string;
  location: string;
  address: string;
  access: string;

  employmentType: string;

  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  salaryDescription: string;

  fixedOvertime: string;
  fixedOvertimeAmount: string;

  socialInsurance: string;

  probation: string;
  probationPeriod: string;
  probationCondition: string;

  description: string;
  appeal: string;
  requirements: string;
  workingHours: string;
  holidays: string;
  benefits: string;
  other: string;

  tags: string[];

  applicationMethod: string;
  applicationEmail: string;
  applicationPhone: string;

  // AI解析項目
  recruitmentCount: string;
  locationDetail: string;
  nearestStation: string;
  breakTime: string;
  overtime: string;
  transfer: string;
  businessTrip: string;
  fixedOvertimePay: string;
  fixedOvertimeHours: string;
  transportation: string;
  bonus: string;
  raise: string;
  incentive: string;
  annualHolidays: string;
  paidLeave: string;
  longVacation: string;
  otherLeave: string;
  employmentInsurance: string;
  workersCompensation: string;
  pension: string;
  requiredConditions: string;
  preferredConditions: string;
  qualifications: string;
  experience: string;
  education: string;
  ageCondition: string;
  pcSkills: string;
  driverLicense: string;
  selectionProcess: string;
  interviewCount: string;
  interviewLocation: string;
  requiredDocuments: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
};

const mediaTypes: MediaType[] = [
  "INDEED",
  "JOB_BOX",
  "ENGAGE",
];

function getMediaFieldLabel(
  field: string
): string {
  const labels: Record<string, string> = {
    title: "職種・求人タイトル",
    category: "職種カテゴリ",
    companyName: "会社名",
    location: "勤務地",
    address: "住所",
    access: "アクセス",
    employmentType: "雇用形態",
    salaryType: "給与形態",
    salaryMin: "給与下限",
    salaryMax: "給与上限",
    salaryDescription: "給与",
    fixedOvertime: "固定残業代",
    fixedOvertimeAmount: "固定残業代金額",
    description: "仕事内容",
    requirements: "応募条件",
    workingHours: "勤務時間",
    holidays: "休日",
    benefits: "福利厚生",
    socialInsurance: "社会保険",
    recruitmentCount: "募集人数",
    locationDetail: "勤務地詳細",
    nearestStation: "最寄り駅",
    breakTime: "休憩時間",
    overtime: "残業",
    transfer: "転勤",
    businessTrip: "出張",
    fixedOvertimePay: "固定残業代",
    fixedOvertimeHours: "固定残業時間",
    transportation: "交通費",
    bonus: "賞与",
    raise: "昇給",
    incentive: "インセンティブ",
    annualHolidays: "年間休日",
    paidLeave: "有給休暇",
    longVacation: "長期休暇",
    otherLeave: "その他休暇",
    employmentInsurance: "雇用保険",
    workersCompensation: "労災保険",
    pension: "厚生年金",
    requiredConditions: "必須条件",
    preferredConditions: "歓迎条件",
    qualifications: "資格",
    experience: "経験",
    education: "学歴",
    ageCondition: "年齢条件",
    pcSkills: "PCスキル",
    driverLicense: "運転免許",
    selectionProcess: "選考方法",
    interviewCount: "面接回数",
    interviewLocation: "面接場所",
    requiredDocuments: "必要書類",
    recruiterName: "採用担当者",
    recruiterEmail: "採用担当メール",
    recruiterPhone: "採用担当電話番号",
  };

  return labels[field] || field;
}
function getMediaName(media: string) {
  switch (media) {
    case "INDEED":
      return "Indeed";
    case "JOB_BOX":
      return "JOB BOX";
    case "ENGAGE":
      return "engage";
    default:
      return media;
  }
}

function getStatusLabel(status?: JobMedia["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "公開中";
    case "PENDING":
      return "処理中";
    case "ERROR":
      return "エラー";
    case "CLOSED":
      return "終了";
    default:
      return "未掲載";
  }
}

function getStatusClass(status?: JobMedia["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-blue-100 text-blue-700";
    case "ERROR":
      return "bg-red-100 text-red-700";
    case "CLOSED":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

const defaultTags = [
  "未経験OK",
  "経験者歓迎",
  "交通費支給",
  "社会保険完備",
  "残業なし",
  "駅近5分以内",
  "正社員登用あり",
  "研修あり",
  "昇給あり",
  "賞与あり",
];

export default function MediaEditPage() {
  const params = useParams();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const media = Array.isArray(params.media)
    ? params.media[0]
    : params.media;

  const [job, setJob] = useState<Job | null>(null);
  const [content, setContent] =
    useState<MediaContent | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

// AI解析結果を一時保存
const [aiContent, setAiContent] =
  useState<Partial<MediaContent> | null>(null);

// AI結果を反映する項目
const [selectedAiFields, setSelectedAiFields] =
  useState<string[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id || !media) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/jobs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "求人情報の取得に失敗しました"
          );
        }

        const loadedJob: Job =
          data.data ?? data.job;

        if (!loadedJob) {
          throw new Error(
            "求人情報が見つかりませんでした"
          );
        }

        setJob(loadedJob);

        setContent({
          title: loadedJob.title || "",
          category: "",
          catchCopy: "",
          companyName:
            loadedJob.company?.name || "",

          postalCode: "",
          location: loadedJob.location || "",
          address: "",
          access: "",

          employmentType:
            loadedJob.employmentType || "",

          salaryType: "月給",
          salaryMin: "",
          salaryMax: "",
          salaryDescription:
            loadedJob.salary || "",

          fixedOvertime: "なし",
          fixedOvertimeAmount: "",

          socialInsurance: "",

          probation: "なし",
          probationPeriod: "",
          probationCondition: "",

          description:
            loadedJob.description || "",
          appeal: "",
          requirements:
            loadedJob.requirements || "",
          workingHours:
            loadedJob.workingHours || "",
          holidays:
            loadedJob.holidays || "",
          benefits:
            loadedJob.benefits || "",
          other: "",

          tags: [],

          applicationMethod:
            "Indeedカンタン応募",
          applicationEmail: "",
          applicationPhone: "",

          recruitmentCount: "",
          locationDetail: "",
          nearestStation: "",
          breakTime: "",
          overtime: "",
          transfer: "",
          businessTrip: "",
          fixedOvertimePay: "",
          fixedOvertimeHours: "",
          transportation: "",
          bonus: "",
          raise: "",
          incentive: "",
          annualHolidays: "",
          paidLeave: "",
          longVacation: "",
          otherLeave: "",
          employmentInsurance: "",
          workersCompensation: "",
          pension: "",
          requiredConditions: "",
          preferredConditions: "",
          qualifications: "",
          experience: "",
          education: "",
          ageCondition: "",
          pcSkills: "",
          driverLicense: "",
          selectionProcess: "",
          interviewCount: "",
          interviewLocation: "",
          requiredDocuments: "",
          recruiterName: "",
          recruiterEmail: "",
          recruiterPhone: "",
        });
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "求人情報の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, media]);

  const currentListing = useMemo(() => {
    return (
      job?.mediaListings?.find(
        (item) => item.media === media
      ) ?? null
    );
  }, [job, media]);

  const updateField = <
    K extends keyof MediaContent
  >(
    field: K,
    value: MediaContent[K]
  ) => {
    setContent((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });

    setSaved(false);
  };

  const toggleTag = (tag: string) => {
    setContent((current) => {
      if (!current) return current;

      const exists = current.tags.includes(tag);

      return {
        ...current,
        tags: exists
          ? current.tags.filter(
              (item) => item !== tag
            )
          : [...current.tags, tag],
      };
    });

    setSaved(false);
  };

  const handleAiGenerate = async () => {
    if (!job || !content) return;

    try {
      setAiGenerating(true);
      setError("");
      setSaved(false);

      const jobWithSource = job as Job & {
        sourceText?: string | null;
      };

      const sourceText =
        jobWithSource.sourceText?.trim() ||
        [
          `会社名：${job.company?.name || ""}`,
          `職種：${job.title || ""}`,
          `勤務地：${job.location || ""}`,
          `雇用形態：${job.employmentType || ""}`,
          `給与：${job.salary || ""}`,
          `勤務時間：${job.workingHours || ""}`,
          `休日：${job.holidays || ""}`,
          `仕事内容：${job.description || ""}`,
          `応募条件：${job.requirements || ""}`,
          `待遇：${job.benefits || ""}`,
        ]
          .filter((line) => !line.endsWith("："))
          .join("\n");

      if (!sourceText.trim()) {
        throw new Error(
          "AI解析する求人情報がありません。"
        );
      }

      console.log("=== MEDIA AI GENERATE ===");
      console.log(
        "sourceText length:",
        sourceText.length
      );

      const response = await fetch(
        "/api/jobs/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AIによる原稿生成に失敗しました。"
        );
      }

      const ai = data?.data;

      if (!ai) {
        throw new Error(
          "AI解析結果を取得できませんでした。"
        );
      }

      const stringValue = (
        value: unknown
      ): string => {
        if (
          value === null ||
          value === undefined
        ) {
          return "";
        }

        return String(value);
      };

      const generated: Partial<MediaContent> = {
        title: stringValue(ai.title),
        category: stringValue(ai.jobCategory),
        companyName: stringValue(ai.companyName),
        location: stringValue(ai.location),
        address: stringValue(ai.locationDetail),
        access: [
          stringValue(ai.nearestStation),
          stringValue(ai.access),
        ]
          .filter(Boolean)
          .join(" / "),
        employmentType: stringValue(ai.employmentType),
        salaryType: stringValue(ai.salaryType),
        salaryMin: stringValue(ai.minSalary),
        salaryMax: stringValue(ai.maxSalary),
        salaryDescription: stringValue(ai.salary),

        fixedOvertime: stringValue(ai.fixedOvertimePay)
          ? "あり"
          : "",

        fixedOvertimeAmount:
          stringValue(ai.fixedOvertimePay),

        description: stringValue(ai.description),
        requirements: stringValue(ai.requirements),
        workingHours: stringValue(ai.workingHours),
        holidays: stringValue(ai.holidays),
        benefits: stringValue(ai.benefits),
        socialInsurance:
          stringValue(ai.socialInsurance),

        recruitmentCount:
          stringValue(ai.recruitmentCount),

        locationDetail:
          stringValue(ai.locationDetail),

        nearestStation:
          stringValue(ai.nearestStation),

        breakTime:
          stringValue(ai.breakTime),

        overtime:
          stringValue(ai.overtime),

        transfer:
          stringValue(ai.transfer),

        businessTrip:
          stringValue(ai.businessTrip),

        fixedOvertimePay:
          stringValue(ai.fixedOvertimePay),

        fixedOvertimeHours:
          stringValue(ai.fixedOvertimeHours),

        transportation:
          stringValue(ai.transportation),

        bonus:
          stringValue(ai.bonus),

        raise:
          stringValue(ai.raise),

        incentive:
          stringValue(ai.incentive),

        annualHolidays:
          stringValue(ai.annualHolidays),

        paidLeave:
          stringValue(ai.paidLeave),

        longVacation:
          stringValue(ai.longVacation),

        otherLeave:
          stringValue(ai.otherLeave),

        employmentInsurance:
          stringValue(ai.employmentInsurance),

        workersCompensation:
          stringValue(ai.workersCompensation),

        pension:
          stringValue(ai.pension),

        requiredConditions:
          stringValue(ai.requiredConditions),

        preferredConditions:
          stringValue(ai.preferredConditions),

        qualifications:
          stringValue(ai.qualifications),

        experience:
          stringValue(ai.experience),

        education:
          stringValue(ai.education),

        ageCondition:
          stringValue(ai.ageCondition),

        pcSkills:
          stringValue(ai.pcSkills),

        driverLicense:
          stringValue(ai.driverLicense),

        selectionProcess:
          stringValue(ai.selectionProcess),

        interviewCount:
          stringValue(ai.interviewCount),

        interviewLocation:
          stringValue(ai.interviewLocation),

        requiredDocuments:
          stringValue(ai.requiredDocuments),

        recruiterName:
          stringValue(ai.recruiterName),

        recruiterEmail:
          stringValue(ai.recruiterEmail),

        recruiterPhone:
          stringValue(ai.recruiterPhone),
      };

      // 空欄のAI結果は比較対象から除外
      const validEntries = Object.entries(generated)
        .filter(([, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }

          return String(value ?? "").trim() !== "";
        });

      setAiContent(
        Object.fromEntries(validEntries)
      );

      // 初期状態では何も反映しない
      setSelectedAiFields([]);
      console.log(
        "AI原稿生成完了"
      );
    } catch (err) {
      console.error(
        "AI原稿生成エラー:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "AIによる原稿生成に失敗しました。"
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!id || !media || !content) return;

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const response = await fetch(
        `/api/jobs/${id}/media/${media}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(content),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "掲載原稿の保存に失敗しました"
        );
      }

      setSaved(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "掲載原稿の保存に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Indeed掲載原稿を読み込んでいます...
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] p-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/jobs/${id}`}
            className="mb-4 inline-flex text-sm text-slate-500 hover:text-slate-900"
          >
            ← 求人詳細に戻る
          </Link>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!job || !content) {
    return null;
  }

  const mediaName = getMediaName(media || "");

  const salaryPreview =
    content.salaryMin || content.salaryMax
      ? `${content.salaryType} ${content.salaryMin || "0"}円〜${
          content.salaryMax
            ? `${content.salaryMax}円`
            : ""
        }`
      : content.salaryDescription;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[68px] max-w-[1700px] items-center justify-between gap-5 px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/jobs/${job.id}`}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              ← 求人詳細
            </Link>

            <div className="h-7 w-px bg-slate-200" />

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold">
                  Indeed 求人原稿
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    currentListing?.status
                  )}`}
                >
                  {getStatusLabel(
                    currentListing?.status
                  )}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-slate-400">
                求人情報を編集・確認
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiGenerating || saving}
              className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiGenerating
                ? "AI解析中..."
                : "✨ AIで原稿生成"}
            </button>

            {saved && (
              <span className="text-sm font-medium text-green-600">
                ✓ 保存しました
              </span>
            )}

            <Link
              href={`/jobs/${job.id}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#2557a7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1f4b91] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "保存中..."
                : "原稿を保存"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1700px] gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_560px]">
        {aiContent && (
          <section className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  AI ANALYSIS
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  AI解析結果を確認
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  現在の原稿とAI解析結果を比較しています。
                  反映したい項目だけチェックしてください。
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const fields = Object.keys(aiContent);

                  setContent((current) => {
                    if (!current) return current;

                    const updated = {
                      ...current,
                    };

                    for (const field of selectedAiFields) {
                      const value =
                        aiContent[
                          field as keyof MediaContent
                        ];

                      if (
                        value !== undefined &&
                        String(value).trim() !== ""
                      ) {
                        (
                          updated as Record<
                            string,
                            unknown
                          >
                        )[field] = value;
                      }
                    }

                    return updated;
                  });

                  setAiContent(null);
                  setSelectedAiFields([]);
                  setSaved(false);
                }}
                disabled={selectedAiFields.length === 0}
                className="shrink-0 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                選択した項目を反映
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(aiContent).map(
                ([field, aiValue]) => {
                  const currentValue =
                    content?.[
                      field as keyof MediaContent
                    ];

                  const currentText =
                    Array.isArray(currentValue)
                      ? currentValue.join(", ")
                      : String(
                          currentValue ?? ""
                        );

                  const aiText =
                    Array.isArray(aiValue)
                      ? aiValue.join(", ")
                      : String(
                          aiValue ?? ""
                        );

                  if (
                    currentText.trim() ===
                    aiText.trim()
                  ) {
                    return null;
                  }

                  const checked =
                    selectedAiFields.includes(
                      field
                    );

                  return (
                    <label
                      key={field}
                      className={`block cursor-pointer rounded-lg border bg-white p-4 transition ${
                        checked
                          ? "border-violet-400 ring-2 ring-violet-100"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedAiFields(
                              (current) =>
                                current.includes(
                                  field
                                )
                                  ? current.filter(
                                      (item) =>
                                        item !== field
                                    )
                                  : [
                                      ...current,
                                      field,
                                    ]
                            );
                          }}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-semibold text-slate-900">
                              {getMediaFieldLabel(
                                field
                              )}
                            </span>

                            <span className="text-xs font-medium text-violet-600">
                              AI解析結果
                            </span>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-medium text-slate-400">
                                現在の値
                              </p>

                              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap">
                                {currentText ||
                                  "（空欄）"}
                              </div>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-medium text-violet-500">
                                AIの値
                              </p>

                              <div className="rounded-md bg-violet-50 p-3 text-sm font-medium text-slate-800 whitespace-pre-wrap">
                                {aiText}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                }
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-violet-200 pt-4">
              <span className="text-sm text-slate-600">
                {selectedAiFields.length}項目を選択中
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedAiFields(
                    Object.keys(aiContent)
                  );
                }}
                className="text-sm font-medium text-violet-700 hover:underline"
              >
                すべて選択
              </button>
            </div>
          </section>
        )}
        <section className="min-w-0 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2557a7]">
                  Indeed
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  求人情報を編集
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Indeedで求職者に表示される求人情報を設定します。
                </p>
              </div>

              <div className="hidden rounded-lg bg-slate-50 px-4 py-3 text-right sm:block">
                <p className="text-xs text-slate-400">
                  掲載媒体
                </p>
                <p className="mt-1 font-semibold">
                  Indeed
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Section
            number="01"
            title="基本情報"
            description="求職者が求人検索時に最初に確認する情報です。"
          >
            <div className="space-y-5">
              <Field
                label="職種名"
                required
                value={content.title}
                onChange={(value) =>
                  updateField("title", value)
                }
                placeholder="例：法人営業スタッフ"
              />

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="職種カテゴリー"
                  value={content.category}
                  onChange={(value) =>
                    updateField(
                      "category",
                      value
                    )
                  }
                  options={[
                    "",
                    "営業",
                    "事務・オフィスワーク",
                    "販売・接客",
                    "飲食",
                    "IT・エンジニア",
                    "建築・土木",
                    "物流・配送",
                    "医療・介護",
                    "その他",
                  ]}
                />

                <Field
                  label="採用予定人数"
                  value={content.recruitmentCount}
                  onChange={(value) =>
                    updateField(
                      "recruitmentCount",
                      value
                    )
                  }
                  placeholder="例：3名"
                />
              </div>

              <Field
                label="求人キャッチコピー"
                value={content.catchCopy}
                onChange={(value) =>
                  updateField(
                    "catchCopy",
                    value
                  )
                }
                placeholder="例：未経験から始められる営業職！研修充実"
              />

              <Field
                label="会社名"
                required
                value={content.companyName}
                onChange={(value) =>
                  updateField(
                    "companyName",
                    value
                  )
                }
              />
            </div>
          </Section>

          <Section
            number="02"
            title="勤務地・アクセス"
            description="勤務地は住所やアクセス方法まで具体的に入力します。"
          >
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="郵便番号"
                  value={content.postalCode}
                  onChange={(value) =>
                    updateField(
                      "postalCode",
                      value
                    )
                  }
                  placeholder="例：100-0001"
                />

                <Field
                  label="勤務地"
                  required
                  value={content.location}
                  onChange={(value) =>
                    updateField(
                      "location",
                      value
                    )
                  }
                  placeholder="例：大阪府大阪市中央区"
                />
              </div>

              <Field
                label="住所"
                value={content.address}
                onChange={(value) =>
                  updateField(
                    "address",
                    value
                  )
                }
                placeholder="例：○○町1-2-3 ○○ビル5F"
              />

              <TextArea
                label="交通アクセス"
                value={content.access}
                onChange={(value) =>
                  updateField(
                    "access",
                    value
                  )
                }
                rows={3}
                placeholder="例：大阪メトロ御堂筋線「心斎橋駅」から徒歩5分"
              />
            </div>
          </Section>

          <Section
            number="03"
            title="雇用条件・給与"
            description="雇用形態、給与、固定残業代などの労働条件を設定します。"
          >
            <div className="space-y-5">
              <SelectField
                label="雇用形態"
                required
                value={content.employmentType}
                onChange={(value) =>
                  updateField(
                    "employmentType",
                    value
                  )
                }
                options={[
                  "",
                  "正社員",
                  "契約社員",
                  "派遣社員",
                  "アルバイト・パート",
                  "業務委託",
                ]}
              />

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-4 text-sm font-semibold">
                  給与
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <SelectField
                    label="給与形態"
                    value={content.salaryType}
                    onChange={(value) =>
                      updateField(
                        "salaryType",
                        value
                      )
                    }
                    options={[
                      "月給",
                      "週給",
                      "日給",
                      "時給",
                      "年俸",
                    ]}
                  />

                  <Field
                    label="最低額"
                    value={content.salaryMin}
                    onChange={(value) =>
                      updateField(
                        "salaryMin",
                        value
                      )
                    }
                    placeholder="例：250000"
                  />

                  <Field
                    label="最高額"
                    value={content.salaryMax}
                    onChange={(value) =>
                      updateField(
                        "salaryMax",
                        value
                      )
                    }
                    placeholder="例：400000"
                  />
                </div>

                <div className="mt-4">
                  <TextArea
                    label="給与に関する補足"
                    value={
                      content.salaryDescription
                    }
                    onChange={(value) =>
                      updateField(
                        "salaryDescription",
                        value
                      )
                    }
                    rows={4}
                    placeholder="賞与・昇給・手当・交通費・給与支払日など"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="固定残業代"
                  value={content.fixedOvertime}
                  onChange={(value) =>
                    updateField(
                      "fixedOvertime",
                      value
                    )
                  }
                  options={[
                    "なし",
                    "あり",
                  ]}
                />

                {content.fixedOvertime ===
                  "あり" && (
                  <Field
                    label="固定残業代"
                    value={
                      content.fixedOvertimeAmount
                    }
                    onChange={(value) =>
                      updateField(
                        "fixedOvertimeAmount",
                        value
                      )
                    }
                    placeholder="例：50,000円"
                  />
                )}
              </div>

              <TextArea
                label="社会保険"
                value={content.socialInsurance}
                onChange={(value) =>
                  updateField(
                    "socialInsurance",
                    value
                  )
                }
                rows={3}
                placeholder="例：雇用保険、労災保険、健康保険、厚生年金"
              />

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="試用期間"
                    value={content.probation}
                    onChange={(value) =>
                      updateField(
                        "probation",
                        value
                      )
                    }
                    options={[
                      "なし",
                      "あり",
                    ]}
                  />

                  {content.probation ===
                    "あり" && (
                    <Field
                      label="試用期間"
                      value={
                        content.probationPeriod
                      }
                      onChange={(value) =>
                        updateField(
                          "probationPeriod",
                          value
                        )
                      }
                      placeholder="例：3ヶ月"
                    />
                  )}
                </div>

                {content.probation ===
                  "あり" && (
                  <div className="mt-4">
                    <TextArea
                      label="試用期間中の条件"
                      value={
                        content.probationCondition
                      }
                      onChange={(value) =>
                        updateField(
                          "probationCondition",
                          value
                        )
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section
            number="04"
            title="仕事内容・アピールポイント"
            description="求人の中心となる仕事内容と会社の魅力を入力します。"
          >
            <div className="space-y-5">
              <TextArea
                label="仕事内容"
                required
                value={content.description}
                onChange={(value) =>
                  updateField(
                    "description",
                    value
                  )
                }
                rows={12}
                placeholder="具体的な仕事内容、取り扱う商品・サービス、1日の業務の流れなど"
              />

              <TextArea
                label="アピールポイント"
                value={content.appeal}
                onChange={(value) =>
                  updateField(
                    "appeal",
                    value
                  )
                }
                rows={8}
                placeholder="職場の雰囲気、研修制度、会社の特徴、仕事の魅力など"
              />

              <TextArea
                label="求める人材"
                value={content.requirements}
                onChange={(value) =>
                  updateField(
                    "requirements",
                    value
                  )
                }
                rows={8}
                placeholder="経験・スキル・資格・人物像など"
              />
            </div>
          </Section>

          <Section
            number="05"
            title="勤務時間・休日"
            description="勤務時間や休日・休暇について具体的に入力します。"
          >
            <div className="space-y-5">
              <TextArea
                label="勤務時間・曜日"
                value={content.workingHours}
                onChange={(value) =>
                  updateField(
                    "workingHours",
                    value
                  )
                }
                rows={6}
                placeholder="例：9:00〜18:00（実働8時間）&#10;月〜金勤務"
              />

              <TextArea
                label="休日・休暇"
                value={content.holidays}
                onChange={(value) =>
                  updateField(
                    "holidays",
                    value
                  )
                }
                rows={6}
                placeholder="例：完全週休2日制（土日祝）、夏季休暇、年末年始、有給休暇"
              />
            </div>
          </Section>

          <Section
            number="06"
            title="待遇・福利厚生"
            description="社会保険以外の待遇や福利厚生を入力します。"
          >
            <TextArea
              label="待遇・福利厚生"
              value={content.benefits}
              onChange={(value) =>
                updateField(
                  "benefits",
                  value
                )
              }
              rows={9}
              placeholder="例：昇給年1回、賞与年2回、交通費全額支給、社員割引、研修制度など"
            />
          </Section>

          <Section
            number="07"
            title="タグ"
            description="求人の特徴をタグとして設定します。"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {defaultTags.map((tag) => {
                const selected =
                  content.tags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      toggleTag(tag)
                    }
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      selected
                        ? "border-[#2557a7] bg-blue-50 text-[#2557a7]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {selected ? "✓ " : ""}
                    {tag}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section
            number="08"
            title="その他"
            description="上記項目に記載できない補足情報を入力します。"
          >
            <TextArea
              label="その他"
              value={content.other}
              onChange={(value) =>
                updateField(
                  "other",
                  value
                )
              }
              rows={7}
              placeholder="受動喫煙対策、契約期間、就業場所の変更範囲、業務内容の変更範囲など"
            />
          </Section>

          <Section
            number="09"
            title="応募受付設定"
            description="応募方法や問い合わせ先を設定します。"
          >
            <div className="space-y-5">
              <SelectField
                label="応募方法"
                value={
                  content.applicationMethod
                }
                onChange={(value) =>
                  updateField(
                    "applicationMethod",
                    value
                  )
                }
                options={[
                  "Indeedカンタン応募",
                  "Indeed履歴書応募",
                  "メール応募",
                  "電話応募",
                ]}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="応募受付メール"
                  value={
                    content.applicationEmail
                  }
                  onChange={(value) =>
                    updateField(
                      "applicationEmail",
                      value
                    )
                  }
                  placeholder="example@example.com"
                />

                <Field
                  label="電話番号"
                  value={
                    content.applicationPhone
                  }
                  onChange={(value) =>
                    updateField(
                      "applicationPhone",
                      value
                    )
                  }
                  placeholder="06-0000-0000"
                />
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Link
              href={`/jobs/${job.id}`}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#2557a7] px-6 py-3 text-sm font-bold text-white hover:bg-[#1f4b91] disabled:opacity-50"
            >
              {saving
                ? "保存中..."
                : "原稿を保存"}
            </button>
          </div>
        </section>

        <aside className="xl:sticky xl:top-[92px] xl:h-[calc(100vh-110px)]">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-wider text-[#2557a7]">
                    PREVIEW
                  </p>
                  <h2 className="mt-1 text-base font-bold">
                    求職者向け求人プレビュー
                  </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  リアルタイム
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f7f7] p-4 sm:p-5">
              <div className="mx-auto max-w-[510px]">
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>求人</span>
                  <span>›</span>
                  <span>
                    {content.category ||
                      "職種"}
                  </span>
                </div>

                <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          {content.companyName}
                        </p>

                        <h3 className="mt-2 text-xl font-bold leading-8 text-slate-900">
                          {content.title ||
                            "求人タイトル"}
                        </h3>

                        {content.catchCopy && (
                          <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                            {content.catchCopy}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {content.tags.map(
                        (tag) => (
                          <span
                            key={tag}
                            className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>

                    <div className="mt-6 space-y-0">
                      <PreviewItem
                        icon="💼"
                        label="雇用形態"
                        value={
                          content.employmentType
                        }
                      />

                      <PreviewItem
                        icon="💰"
                        label="給与"
                        value={salaryPreview}
                      />

                      <PreviewItem
                        icon="📍"
                        label="勤務地"
                        value={[
                          content.location,
                          content.address,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />

                      <PreviewItem
                        icon="🚃"
                        label="アクセス"
                        value={
                          content.access
                        }
                      />
                    </div>
                  </div>

                  <PreviewSection
                    title="仕事内容"
                    value={
                      content.description
                    }
                  />

                  <PreviewSection
                    title="アピールポイント"
                    value={content.appeal}
                  />

                  <PreviewSection
                    title="求める人材"
                    value={
                      content.requirements
                    }
                  />

                  <PreviewSection
                    title="勤務時間・曜日"
                    value={
                      content.workingHours
                    }
                  />

                  <PreviewSection
                    title="休暇・休日"
                    value={
                      content.holidays
                    }
                  />

                  <PreviewSection
                    title="待遇・福利厚生"
                    value={
                      content.benefits
                    }
                  />

                  {content.socialInsurance && (
                    <PreviewSection
                      title="社会保険"
                      value={
                        content.socialInsurance
                      }
                    />
                  )}

                  {content.other && (
                    <PreviewSection
                      title="その他"
                      value={content.other}
                    />
                  )}

                  <div className="border-t border-slate-200 bg-white p-5">
                    <button
                      type="button"
                      className="w-full rounded-md bg-[#2557a7] px-5 py-3 text-sm font-bold text-white"
                    >
                      {content.applicationMethod ||
                        "応募する"}
                    </button>

                    <p className="mt-3 text-center text-xs text-slate-400">
                      このボタンはプレビューです
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#2557a7]">
            {number}
          </span>

          <div>
            <h2 className="font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option || "選択してください"}
          </option>
        ))}
      </select>
    </label>
  );
}
function TextArea({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-[#2557a7] focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
function PreviewItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <div className="flex gap-3 border-t border-slate-100 py-4 first:border-t-0">
      <span className="mt-0.5 text-base">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function PreviewSection({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  if (!value) return null;

  return (
    <section className="border-t border-slate-200 px-5 py-5 sm:px-6">
      <h4 className="text-base font-bold text-slate-900">
        {title}
      </h4>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {value}
      </p>
    </section>
  );
}








