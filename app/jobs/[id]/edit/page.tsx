"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type JobStatus = "DRAFT" | "READY" | "PUBLISHED" | "CLOSED";

type JobForm = {
  title: string;
  companyName: string;
  location: string;
  employmentType: string;
  salary: string;
  workingHours: string;
  description: string;
  requirements: string;
  holidays: string;
  benefits: string;
  sourceText: string;

  jobCategory: string;
  position: string;
  recruitmentCount: string;
  locationDetail: string;
  nearestStation: string;
  access: string;
  breakTime: string;
  overtime: string;
  transfer: string;
  businessTrip: string;

  salaryType: string;
  minSalary: string;
  maxSalary: string;
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

  socialInsurance: string;
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

  applicationMethod: string;
  selectionProcess: string;
  interviewCount: string;
  interviewLocation: string;
  requiredDocuments: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;

  status: JobStatus;
};

const emptyForm: JobForm = {
  title: "",
  companyName: "",
  location: "",
  employmentType: "",
  salary: "",
  workingHours: "",
  description: "",
  requirements: "",
  holidays: "",
  benefits: "",
  sourceText: "",

  jobCategory: "",
  position: "",
  recruitmentCount: "",
  locationDetail: "",
  nearestStation: "",
  access: "",
  breakTime: "",
  overtime: "",
  transfer: "",
  businessTrip: "",

  salaryType: "",
  minSalary: "",
  maxSalary: "",
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

  socialInsurance: "",
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

  applicationMethod: "",
  selectionProcess: "",
  interviewCount: "",
  interviewLocation: "",
  requiredDocuments: "",
  recruiterName: "",
  recruiterEmail: "",
  recruiterPhone: "",

  status: "DRAFT",
};

type TextFieldProps = {
  label: string;
  name: keyof JobForm;
  value: string;
  onChange: (name: keyof JobForm, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
};

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 5,
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        />
      )}
    </div>
  );
}

export default function JobEditPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] = useState<JobForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 求人タグ
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

// AIタグ選定
const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (name: keyof JobForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "求人情報の取得に失敗しました。"
          );
        }

        const job = data.data;

        // 求人タグを取得
        setTags(
          Array.isArray(job.tags)
            ? job.tags
                .map((relation: unknown) => {
                  if (
                    typeof relation !== "object" ||
                    relation === null
                  ) {
                    return undefined;
                  }

                  const tag = (relation as {
                    tag?: {
                      name?: unknown;
                    };
                  }).tag;

                  return typeof tag?.name === "string"
                    ? tag.name
                    : undefined;
                })
                .filter(
                  (name: unknown): name is string =>
                    typeof name === "string" &&
                    name.trim() !== ""
                )
            : []
        );

        setForm({
          title: job.title || "",
          companyName: job.companyName || "",
          location: job.location || "",
          employmentType: job.employmentType || "",
          salary: job.salary || "",
          workingHours: job.workingHours || "",
          description: job.description || "",
          requirements: job.requirements || "",
          holidays: job.holidays || "",
          benefits: job.benefits || "",
          sourceText: job.sourceText || "",

          jobCategory: job.jobCategory || "",
          position: job.position || "",
          recruitmentCount:
            job.recruitmentCount !== null &&
            job.recruitmentCount !== undefined
              ? String(job.recruitmentCount)
              : "",
          locationDetail: job.locationDetail || "",
          nearestStation: job.nearestStation || "",
          access: job.access || "",
          breakTime: job.breakTime || "",
          overtime: job.overtime || "",
          transfer: job.transfer || "",
          businessTrip: job.businessTrip || "",

          salaryType: job.salaryType || "",
          minSalary:
            job.minSalary !== null &&
            job.minSalary !== undefined
              ? String(job.minSalary)
              : "",
          maxSalary:
            job.maxSalary !== null &&
            job.maxSalary !== undefined
              ? String(job.maxSalary)
              : "",
          fixedOvertimePay: job.fixedOvertimePay || "",
          fixedOvertimeHours: job.fixedOvertimeHours || "",
          transportation: job.transportation || "",
          bonus: job.bonus || "",
          raise: job.raise || "",
          incentive: job.incentive || "",

          annualHolidays: job.annualHolidays || "",
          paidLeave: job.paidLeave || "",
          longVacation: job.longVacation || "",
          otherLeave: job.otherLeave || "",

          socialInsurance: job.socialInsurance || "",
          employmentInsurance: job.employmentInsurance || "",
          workersCompensation: job.workersCompensation || "",
          pension: job.pension || "",

          requiredConditions: job.requiredConditions || "",
          preferredConditions: job.preferredConditions || "",
          qualifications: job.qualifications || "",
          experience: job.experience || "",
          education: job.education || "",
          ageCondition: job.ageCondition || "",
          pcSkills: job.pcSkills || "",
          driverLicense: job.driverLicense || "",

          applicationMethod: job.applicationMethod || "",
          selectionProcess: job.selectionProcess || "",
          interviewCount: job.interviewCount || "",
          interviewLocation: job.interviewLocation || "",
          requiredDocuments: job.requiredDocuments || "",
          recruiterName: job.recruiterName || "",
          recruiterEmail: job.recruiterEmail || "",
          recruiterPhone: job.recruiterPhone || "",

          status: job.status || "DRAFT",
        });
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

    fetchJob();
  }, [id]);

  // --------------------------------------------------------
  // タグ追加
  // --------------------------------------------------------

  // --------------------------------------------------------
  // AIによるタグ再選定
  // --------------------------------------------------------

  const handleAiRetag = async () => {
    if (saving) {
      return;
    }

    const confirmed = window.confirm(
      "現在の求人内容をAIが分析して、タグを再選定します。\n\n現在のタグはAIが選定したタグに置き換わります。\n\n実行しますか？"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/jobs/retag",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "AIによるタグ再選定に失敗しました。"
        );
      }

      if (
        !Array.isArray(data.tags)
      ) {
        throw new Error(
          "AIから正しいタグ情報を取得できませんでした。"
        );
      }

      setTags(
        data.tags.filter(
          (tag: unknown): tag is string =>
            typeof tag === "string" &&
            tag.trim() !== ""
        )
      );

      alert(
        `AIによるタグ再選定が完了しました。\n\n${data.tags.join(" / ")}`
      );
    } catch (error) {
      console.error(
        "AIタグ再選定エラー:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "AIによるタグ再選定に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };
  const handleAddTag = () => {
    const newTag = tagInput.trim();

    if (!newTag) {
      return;
    }

    // 同じタグは重複登録しない
    if (tags.includes(newTag)) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, newTag]);
    setTagInput("");
  };

  // --------------------------------------------------------
  // タグ削除
  // --------------------------------------------------------

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) =>
      prev.filter((tag) => tag !== tagToRemove)
    );
  };

  // Enterキーでもタグ追加
  const handleTagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleSuggestTags = async () => {
  try {
    setAiLoading(true);

    const tagsRes = await fetch("/api/tags");
    const tagsData = await tagsRes.json();

    const response = await fetch("/api/jobs/tags/suggest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job: form,
        availableTags: tagsData.tags
          .filter(
            (t: unknown): t is { name: string } =>
              typeof t === "object" &&
              t !== null &&
              typeof (t as { name?: unknown }).name === "string"
          )
          .map((t: { name: string }) => t.name),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AIタグ選定に失敗しました");
    }

    setTags((prev) =>
      Array.from(new Set([...prev, ...data.tags]))
    );
  } catch (error) {
    alert(error instanceof Error ? error.message : "AIタグ選定に失敗しました");
  } finally {
    setAiLoading(false);
  }
};

const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,

          // 求人タグ
          tags: tags,

          recruitmentCount:
            form.recruitmentCount.trim() === ""
              ? null
              : Number(form.recruitmentCount),
          minSalary:
            form.minSalary.trim() === ""
              ? null
              : Number(form.minSalary),
          maxSalary:
            form.maxSalary.trim() === ""
              ? null
              : Number(form.maxSalary),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "求人の更新に失敗しました。"
        );
      }

      router.push(`/jobs/${id}`);
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "求人の更新に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          求人情報を読み込んでいます...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold">
              求人情報を編集
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              基本情報から詳細情報まで編集できます。
            </p>
          </div>

          <Link
            href={`/jobs/${id}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            キャンセル
          </Link>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl space-y-6 p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">
            元求人情報
          </h2>

          <p className="mb-5 text-sm text-slate-500">
            最初に貼り付けた案件情報を確認・編集できます。
          </p>

          <TextField
            label="案件情報・原文"
            name="sourceText"
            value={form.sourceText}
            onChange={handleChange}
            multiline
            rows={12}
            placeholder="元の求人案件情報"
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            基本情報
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextField
                label="求人タイトル"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <TextField
              label="会社名"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
            />

            <TextField
              label="勤務地"
              name="location"
              value={form.location}
              onChange={handleChange}
            />

            <TextField
              label="雇用形態"
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
            />

            <TextField
              label="給与"
              name="salary"
              value={form.salary}
              onChange={handleChange}
            />

            <TextField
              label="勤務時間"
              name="workingHours"
              value={form.workingHours}
              onChange={handleChange}
            />

            <TextField
              label="休日・休暇"
              name="holidays"
              value={form.holidays}
              onChange={handleChange}
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                求人ステータス
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
              >
                <option value="DRAFT">下書き</option>
                <option value="READY">掲載準備完了</option>
                <option value="PUBLISHED">掲載中</option>
                <option value="CLOSED">掲載終了</option>
              </select>
            </div>
          </div>

          {/* 求人タグ */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              求人タグ
            </h3>

            <p className="mb-4 text-xs text-slate-500">
              求人を分類・検索しやすくするためのタグです。
              Enterキーでも追加できます。
            </p>

            {/* AIタグ再選定 */}
            <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    AIでタグを自動選定
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    現在の求人内容をAIが分析して、適切なタグを再選定します。
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAiRetag}
                  disabled={saving}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "AI分析中..."
                    : "🤖 AIでタグを再選定"}
                </button>
              </div>
            </div>
            {/* 現在のタグ */}
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {tag}

                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-slate-300 hover:bg-white/20 hover:text-white"
                      aria-label={`${tag}を削除`}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">
                  タグは設定されていません。
                </p>
              )}
            </div>

            {/* タグ追加 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) =>
                  setTagInput(e.target.value)
                }
                onKeyDown={handleTagKeyDown}
                placeholder="例：未経験OK"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                ＋ タグ追加
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            仕事内容・求人内容
          </h2>

          <div className="space-y-5">
            <TextField
              label="仕事内容"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={10}
            />

            <TextField
              label="応募条件"
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              multiline
              rows={6}
            />

            <TextField
              label="福利厚生・待遇"
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              multiline
              rows={6}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            募集・勤務地詳細
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="職種カテゴリ"
              name="jobCategory"
              value={form.jobCategory}
              onChange={handleChange}
            />

            <TextField
              label="職種・ポジション"
              name="position"
              value={form.position}
              onChange={handleChange}
            />

            <TextField
              label="募集人数"
              name="recruitmentCount"
              value={form.recruitmentCount}
              onChange={handleChange}
              placeholder="例：3"
            />

            <TextField
              label="勤務地詳細"
              name="locationDetail"
              value={form.locationDetail}
              onChange={handleChange}
            />

            <TextField
              label="最寄駅"
              name="nearestStation"
              value={form.nearestStation}
              onChange={handleChange}
            />

            <TextField
              label="アクセス"
              name="access"
              value={form.access}
              onChange={handleChange}
            />

            <TextField
              label="休憩時間"
              name="breakTime"
              value={form.breakTime}
              onChange={handleChange}
            />

            <TextField
              label="残業"
              name="overtime"
              value={form.overtime}
              onChange={handleChange}
            />

            <TextField
              label="転勤"
              name="transfer"
              value={form.transfer}
              onChange={handleChange}
            />

            <TextField
              label="出張"
              name="businessTrip"
              value={form.businessTrip}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            給与詳細
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="給与形態"
              name="salaryType"
              value={form.salaryType}
              onChange={handleChange}
              placeholder="例：月給・時給・日給"
            />

            <TextField
              label="最低給与"
              name="minSalary"
              value={form.minSalary}
              onChange={handleChange}
              placeholder="例：250000"
            />

            <TextField
              label="最高給与"
              name="maxSalary"
              value={form.maxSalary}
              onChange={handleChange}
              placeholder="例：350000"
            />

            <TextField
              label="固定残業代"
              name="fixedOvertimePay"
              value={form.fixedOvertimePay}
              onChange={handleChange}
            />

            <TextField
              label="固定残業時間"
              name="fixedOvertimeHours"
              value={form.fixedOvertimeHours}
              onChange={handleChange}
            />

            <TextField
              label="交通費"
              name="transportation"
              value={form.transportation}
              onChange={handleChange}
            />

            <TextField
              label="賞与"
              name="bonus"
              value={form.bonus}
              onChange={handleChange}
            />

            <TextField
              label="昇給"
              name="raise"
              value={form.raise}
              onChange={handleChange}
            />

            <TextField
              label="インセンティブ"
              name="incentive"
              value={form.incentive}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            休日・休暇詳細
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="年間休日"
              name="annualHolidays"
              value={form.annualHolidays}
              onChange={handleChange}
            />

            <TextField
              label="有給休暇"
              name="paidLeave"
              value={form.paidLeave}
              onChange={handleChange}
            />

            <TextField
              label="長期休暇"
              name="longVacation"
              value={form.longVacation}
              onChange={handleChange}
            />

            <TextField
              label="その他休暇"
              name="otherLeave"
              value={form.otherLeave}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            福利厚生・保険
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="社会保険"
              name="socialInsurance"
              value={form.socialInsurance}
              onChange={handleChange}
            />

            <TextField
              label="雇用保険"
              name="employmentInsurance"
              value={form.employmentInsurance}
              onChange={handleChange}
            />

            <TextField
              label="労災保険"
              name="workersCompensation"
              value={form.workersCompensation}
              onChange={handleChange}
            />

            <TextField
              label="厚生年金"
              name="pension"
              value={form.pension}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            応募条件詳細
          </h2>

          <div className="space-y-5">
            <TextField
              label="必須条件"
              name="requiredConditions"
              value={form.requiredConditions}
              onChange={handleChange}
              multiline
            />

            <TextField
              label="歓迎条件"
              name="preferredConditions"
              value={form.preferredConditions}
              onChange={handleChange}
              multiline
            />

            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="資格"
                name="qualifications"
                value={form.qualifications}
                onChange={handleChange}
              />

              <TextField
                label="経験"
                name="experience"
                value={form.experience}
                onChange={handleChange}
              />

              <TextField
                label="学歴"
                name="education"
                value={form.education}
                onChange={handleChange}
              />

              <TextField
                label="年齢条件"
                name="ageCondition"
                value={form.ageCondition}
                onChange={handleChange}
              />

              <TextField
                label="PCスキル"
                name="pcSkills"
                value={form.pcSkills}
                onChange={handleChange}
              />

              <TextField
                label="運転免許"
                name="driverLicense"
                value={form.driverLicense}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            選考・応募情報
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="応募方法"
              name="applicationMethod"
              value={form.applicationMethod}
              onChange={handleChange}
            />

            <TextField
              label="選考プロセス"
              name="selectionProcess"
              value={form.selectionProcess}
              onChange={handleChange}
              multiline
            />

            <TextField
              label="面接回数"
              name="interviewCount"
              value={form.interviewCount}
              onChange={handleChange}
            />

            <TextField
              label="面接場所"
              name="interviewLocation"
              value={form.interviewLocation}
              onChange={handleChange}
            />

            <TextField
              label="必要書類"
              name="requiredDocuments"
              value={form.requiredDocuments}
              onChange={handleChange}
            />

            <TextField
              label="採用担当者"
              name="recruiterName"
              value={form.recruiterName}
              onChange={handleChange}
            />

            <TextField
              label="採用担当者メール"
              name="recruiterEmail"
              value={form.recruiterEmail}
              onChange={handleChange}
            />

            <TextField
              label="採用担当者電話番号"
              name="recruiterPhone"
              value={form.recruiterPhone}
              onChange={handleChange}
            />
          </div>
        </section>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 py-4 backdrop-blur">
          <Link
            href={`/jobs/${id}`}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium hover:bg-slate-50"
          >
            キャンセル
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "保存中..." : "変更を保存"}
          </button>
        </div>
      </form>
    </main>
  );
}







