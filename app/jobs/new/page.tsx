"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
};

type InputFieldProps = {
  name: keyof JobForm;
  label: string;
  placeholder?: string;
  type?: string;
  form: JobForm;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

function InputField({
  name,
  label,
  placeholder,
  type = "text",
  form,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

type TextFieldProps = {
  name: keyof JobForm;
  label: string;
  placeholder?: string;
  rows?: number;
  form: JobForm;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

function TextField({
  name,
  label,
  placeholder,
  rows = 4,
  form,
  onChange,
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        value={form[name]}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

export default function NewJobPage() {
  const router = useRouter();

  const [sourceText, setSourceText] = useState("");
  const [form, setForm] = useState<JobForm>(emptyForm);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [analysisMessage, setAnalysisMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnalyze = async () => {
    if (analyzing) {
      return;
    }

    if (!sourceText.trim()) {
      setError("解析する案件情報を入力してください。");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysisMessage("");

    try {
      const response = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "案件情報の解析に失敗しました。"
        );
      }

      setForm((prev) => ({
        ...prev,
        ...data.data,
      }));

      if (Array.isArray(data.tags)) {
        setTags(
          Array.from(
            new Set(
              data.tags
                .filter(
                  (tag: unknown): tag is string =>
                    typeof tag === "string"
                )
                .map((tag: string) => tag.trim())
                .filter(Boolean)
            )
          )
        );
      }

      setAnalysisMessage(
        "AI解析が完了しました。基本情報・詳細情報に自動入力しています。"
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "案件情報の解析に失敗しました。"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const addTag = (tagName: string) => {
    const name = tagName.trim();

    if (!name) {
      return;
    }

    if (name.length > 30) {
      setError("タグは30文字以内で入力してください。");
      return;
    }

    setTags((prev) => {
      if (prev.includes(name)) {
        return prev;
      }

      return [...prev, name];
    });

    setTagInput("");
    setError("");
  };

  const removeTag = (tagName: string) => {
    setTags((prev) =>
      prev.filter((tag) => tag !== tagName)
    );
  };

  const handleTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          sourceText,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "求人の登録に失敗しました。"
        );
      }

      alert("求人を登録しました。");

      router.push(`/jobs/${data.job.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "求人の登録に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            新規求人登録
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            案件情報をAIで解析し、求人情報と詳細情報を自動整理できます。
          </p>
        </div>

        {/* STEP 1 */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              1
            </span>

            <div>
              <h2 className="text-lg font-semibold">
                元の案件情報
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                メール・LINE・PDFなどからコピーした情報をそのまま貼り付けてください。
              </p>
            </div>
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={14}
            placeholder={`案件情報をここに貼り付けてください。

例：
【会社名】株式会社○○
【勤務地】大阪府大阪市
【最寄り駅】大阪駅
【雇用形態】正社員
【給与】月給25万円〜35万円
【勤務時間】9:00〜18:00
【仕事内容】...
【休日】土日祝
【年間休日】120日
【福利厚生】社会保険完備...
【応募条件】未経験歓迎...`}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              貼り付けた原文は登録後も保存されます。
            </p>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                analyzing ||
                loading ||
                !sourceText.trim()
              }
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing
                ? "AI解析中..."
                : "AIで解析する"}
            </button>
          </div>

          {analysisMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {analysisMessage}
            </div>
          )}
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* 基本情報 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="2" title="基本情報" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <InputField
                  name="title"
                  label="求人タイトル *"
                  placeholder="例：携帯ショップ販売スタッフ"
                  form={form}
                  onChange={handleChange}
                />
              </div>

              <InputField
                name="companyName"
                label="会社名 *"
                placeholder="例：株式会社○○"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="jobCategory"
                label="職種カテゴリ"
                placeholder="例：営業・販売"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="position"
                label="ポジション"
                placeholder="例：販売スタッフ"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="recruitmentCount"
                label="募集人数"
                placeholder="例：5名"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="employmentType"
                label="雇用形態 *"
                placeholder="例：正社員"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="salary"
                label="給与 *"
                placeholder="例：月給25万円〜35万円"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="salaryType"
                label="給与形態"
                placeholder="例：月給"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="minSalary"
                label="給与下限"
                placeholder="例：250000"
                type="number"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="maxSalary"
                label="給与上限"
                placeholder="例：350000"
                type="number"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="location"
                label="勤務地 *"
                placeholder="例：大阪府大阪市"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="locationDetail"
                label="勤務地詳細"
                placeholder="住所・建物名など"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="nearestStation"
                label="最寄り駅"
                placeholder="例：大阪駅"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="access"
                label="アクセス"
                placeholder="例：大阪駅徒歩5分"
                form={form}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* 勤務条件 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="3" title="勤務条件" />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                name="workingHours"
                label="勤務時間"
                placeholder="例：9:00〜18:00"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="breakTime"
                label="休憩時間"
                placeholder="例：60分"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="overtime"
                label="残業"
                placeholder="例：月平均10時間"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="transfer"
                label="転勤"
                placeholder="例：なし"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="businessTrip"
                label="出張"
                placeholder="例：あり"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="transportation"
                label="交通費"
                placeholder="例：全額支給"
                form={form}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* 仕事内容 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="4" title="仕事内容・応募条件" />

            <div className="space-y-5">
              <TextField
                name="description"
                label="仕事内容 *"
                placeholder="仕事内容を入力"
                rows={7}
                form={form}
                onChange={handleChange}
              />

              <TextField
                name="requirements"
                label="応募条件"
                placeholder="応募条件・資格・経験など"
                rows={5}
                form={form}
                onChange={handleChange}
              />

              <TextField
                name="requiredConditions"
                label="必須条件"
                placeholder="必須条件"
                form={form}
                onChange={handleChange}
              />

              <TextField
                name="preferredConditions"
                label="歓迎条件"
                placeholder="歓迎条件"
                form={form}
                onChange={handleChange}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  name="qualifications"
                  label="資格"
                  placeholder="例：販売士資格"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="experience"
                  label="経験"
                  placeholder="例：営業経験1年以上"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="education"
                  label="学歴"
                  placeholder="例：高卒以上"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="ageCondition"
                  label="年齢条件"
                  placeholder="例：不問"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="pcSkills"
                  label="PCスキル"
                  placeholder="例：Excel基本操作"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="driverLicense"
                  label="運転免許"
                  placeholder="例：普通自動車免許"
                  form={form}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* 給与 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="5" title="給与・待遇" />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                name="fixedOvertimePay"
                label="固定残業代"
                placeholder="例：3万円"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="fixedOvertimeHours"
                label="固定残業時間"
                placeholder="例：20時間"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="bonus"
                label="賞与"
                placeholder="例：年2回"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="raise"
                label="昇給"
                placeholder="例：年1回"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="incentive"
                label="インセンティブ"
                placeholder="例：あり"
                form={form}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* 休日 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="6" title="休日・休暇" />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                name="holidays"
                label="休日・休暇"
                placeholder="例：土日祝休み"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="annualHolidays"
                label="年間休日"
                placeholder="例：120日"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="paidLeave"
                label="有給休暇"
                placeholder="例：入社半年後10日"
                form={form}
                onChange={handleChange}
              />

              <InputField
                name="longVacation"
                label="長期休暇"
                placeholder="例：夏季・年末年始"
                form={form}
                onChange={handleChange}
              />

              <div className="md:col-span-2">
                <InputField
                  name="otherLeave"
                  label="その他休暇"
                  placeholder="例：慶弔休暇"
                  form={form}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* 福利厚生 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="7" title="福利厚生・保険" />

            <div className="space-y-5">
              <TextField
                name="benefits"
                label="福利厚生・待遇"
                placeholder="福利厚生・待遇"
                rows={5}
                form={form}
                onChange={handleChange}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  name="socialInsurance"
                  label="社会保険"
                  placeholder="例：完備"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="employmentInsurance"
                  label="雇用保険"
                  placeholder="例：加入"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="workersCompensation"
                  label="労災保険"
                  placeholder="例：加入"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="pension"
                  label="年金"
                  placeholder="例：厚生年金"
                  form={form}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* 選考 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle number="8" title="応募・選考情報" />

            <div className="space-y-5">
              <TextField
                name="applicationMethod"
                label="応募方法"
                placeholder="応募方法"
                form={form}
                onChange={handleChange}
              />

              <TextField
                name="selectionProcess"
                label="選考フロー"
                placeholder="例：書類選考→面接→内定"
                form={form}
                onChange={handleChange}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  name="interviewCount"
                  label="面接回数"
                  placeholder="例：2回"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="interviewLocation"
                  label="面接場所"
                  placeholder="例：本社"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="requiredDocuments"
                  label="必要書類"
                  placeholder="例：履歴書・職務経歴書"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="recruiterName"
                  label="採用担当者"
                  placeholder="担当者名"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="recruiterEmail"
                  label="採用担当メール"
                  placeholder="example@example.com"
                  type="email"
                  form={form}
                  onChange={handleChange}
                />

                <InputField
                  name="recruiterPhone"
                  label="採用担当電話番号"
                  placeholder="06-0000-0000"
                  form={form}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* タグ */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  求人タグ
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  AIが求人内容から自動提案したタグです。不要なタグは削除し、必要なタグを追加できます。
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {tags.length}個
              </span>
            </div>

            <div className="mb-5 min-h-12 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-300 hover:bg-white/20 hover:text-white"
                        aria-label={`${tag}を削除`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  まだタグが設定されていません。
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="例：未経験歓迎、駅近、高収入"
                maxLength={30}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              <button
                type="button"
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim()}
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                タグを追加
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Enterキーでも追加できます。1つのタグは30文字以内です。
            </p>
          </section>

          {/* 原文確認 */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">
              登録する元案件情報
            </h2>

            <p className="mb-4 text-xs text-slate-500">
              AI解析前に貼り付けた原文も、この求人に紐づけて保存します。
            </p>

            <div className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {sourceText || "まだ入力されていません。"}
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "登録中..."
                : "求人を登録する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {number}
      </span>

      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>
    </div>
  );
}
