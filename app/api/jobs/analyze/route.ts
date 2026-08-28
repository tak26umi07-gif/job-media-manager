import { NextResponse } from "next/server";

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const FIELD_NAMES = [
  "title",
  "companyName",
  "location",
  "employmentType",
  "salary",
  "workingHours",
  "description",
  "requirements",
  "holidays",
  "benefits",
  "sourceText",
  "jobCategory",
  "position",
  "recruitmentCount",
  "locationDetail",
  "nearestStation",
  "access",
  "breakTime",
  "overtime",
  "transfer",
  "businessTrip",
  "salaryType",
  "minSalary",
  "maxSalary",
  "fixedOvertimePay",
  "fixedOvertimeHours",
  "transportation",
  "bonus",
  "raise",
  "incentive",
  "annualHolidays",
  "paidLeave",
  "longVacation",
  "otherLeave",
  "socialInsurance",
  "employmentInsurance",
  "workersCompensation",
  "pension",
  "requiredConditions",
  "preferredConditions",
  "qualifications",
  "experience",
  "education",
  "ageCondition",
  "pcSkills",
  "driverLicense",
  "applicationMethod",
  "selectionProcess",
  "interviewCount",
  "interviewLocation",
  "requiredDocuments",
  "recruiterName",
  "recruiterEmail",
  "recruiterPhone",
] as const;

const SYSTEM_PROMPT = `
あなたは求人情報を構造化する採用管理システムのAI解析エンジンです。

入力された案件情報から、求人媒体への掲載に使用できる情報を抽出してください。

最重要ルール:

1. 原文に存在しない情報を推測・創作しない
2. 判断できない項目は空文字 "" にする
3. 原文の情報をできるだけ細かく分解する
4. 同じ情報が複数箇所にある場合は統合する
5. 給与、勤務時間、休日、福利厚生、社会保険などを正確に抽出する
6. 「未経験歓迎」「交通費支給」などは原文にある場合だけ記載する
7. 年齢、性別、資格、経験なども原文に記載されている場合だけ抽出する
8. 原文にない情報を一般論から補完しない
9. sourceTextには入力された案件情報をそのまま入れる
10. 各項目は求人掲載に利用しやすい自然な日本語で整理する

抽出対象:

【基本情報】
title
companyName
jobCategory
position
recruitmentCount

【勤務地】
location
locationDetail
nearestStation
access

【雇用条件】
employmentType
breakTime
overtime
transfer
businessTrip

【給与】
salary
salaryType
minSalary
maxSalary
fixedOvertimePay
fixedOvertimeHours
transportation
bonus
raise
incentive

【勤務・休日】
workingHours
holidays
annualHolidays
paidLeave
longVacation
otherLeave

【社会保険】
socialInsurance
employmentInsurance
workersCompensation
pension

【仕事内容・応募条件】
description
requirements
requiredConditions
preferredConditions
qualifications
experience
education
ageCondition
pcSkills
driverLicense

【その他】
benefits
other

【応募・選考】
applicationMethod
selectionProcess
interviewCount
interviewLocation
requiredDocuments
recruiterName
recruiterEmail
recruiterPhone
`;

function normalizeValue(value: unknown): string | number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
}

function normalizeResult(
  value: Record<string, unknown>,
  sourceText: string
) {
  const result: Record<string, string | number | null> = {};

  for (const field of FIELD_NAMES) {
    result[field] = normalizeValue(value[field]);
  }

  result.sourceText = sourceText;

  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sourceText =
      typeof body.sourceText === "string"
        ? body.sourceText.trim()
        : "";

    if (!sourceText) {
      return NextResponse.json(
        {
          error: "解析する案件情報を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    console.log("=== AI ANALYZE ===");
    console.log("API KEY:", Boolean(apiKey));
    console.log("MODEL:", MODEL);
    console.log("SOURCE LENGTH:", sourceText.length);
    console.log("FIELD COUNT:", FIELD_NAMES.length);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY が設定されていません。",
        },
        {
          status: 500,
        }
      );
    }

    const properties: Record<string, object> = {};

    for (const field of FIELD_NAMES) {
      properties[field] = {
        type: ["string", "number", "null"],
      };
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,

          input: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content:
                `以下の案件情報を解析してください。\n\n--- 案件情報 ---\n${sourceText}`,
            },
          ],

          text: {
            format: {
              type: "json_schema",
              name: "job_master",
              strict: true,
              schema: {
                type: "object",
                properties,
                required: [...FIELD_NAMES],
                additionalProperties: false,
              },
            },
          },
        }),
      }
    );

    console.log(
      "OPENAI STATUS:",
      response.status
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OPENAI ERROR:",
        JSON.stringify(data)
      );

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "AIによる求人情報の解析に失敗しました。",
        },
        {
          status: response.status,
        }
      );
    }

    console.log(
      "OPENAI RESPONSE ID:",
      data?.id
    );

    console.log(
      "OUTPUT COUNT:",
      Array.isArray(data?.output)
        ? data.output.length
        : 0
    );

    const outputText =
      typeof data.output_text === "string"
        ? data.output_text
        : Array.isArray(data.output)
          ? data.output
              .filter(
                (item: unknown): item is {
                  type?: unknown;
                  content?: unknown;
                } =>
                  typeof item === "object" &&
                  item !== null &&
                  (item as { type?: unknown }).type === "message" &&
                  Array.isArray((item as { content?: unknown }).content)
              )
              .flatMap(
                (item: {
                  type?: unknown;
                  content: unknown[];
                }) => item.content
              )
              .filter(
                (content: unknown): content is {
                  type?: unknown;
                  text?: unknown;
                } =>
                  typeof content === "object" &&
                  content !== null &&
                  (content as { type?: unknown }).type === "output_text" &&
                  typeof (content as { text?: unknown }).text === "string"
              )
              .map(
                (content: {
                  type?: unknown;
                  text?: unknown;
                }) => content.text as string
              )
              .join("")
          : "";

    console.log(
      "OUTPUT TEXT LENGTH:",
      outputText.length
    );

    console.log(
      "OUTPUT TEXT LENGTH:",
      outputText.length
    );

    if (!outputText) {
      console.error(
        "NO OUTPUT TEXT:",
        JSON.stringify(data).slice(0, 5000)
      );

      return NextResponse.json(
        {
          error:
            "AIから構造化された解析結果を取得できませんでした。",
        },
        {
          status: 500,
        }
      );
    }

    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(outputText);
    } catch (error) {
      console.error(
        "JSON PARSE ERROR:",
        error
      );

      console.error(
        "OUTPUT TEXT:",
        outputText
      );

      return NextResponse.json(
        {
          error:
            "AIの解析結果をJSONとして読み取れませんでした。",
        },
        {
          status: 500,
        }
      );
    }

    const normalized = normalizeResult(
      parsed,
      sourceText
    );

    console.log(
      "NORMALIZED FIELD COUNT:",
      Object.keys(normalized).length
    );

    return NextResponse.json({
      success: true,
      data: normalized,
      meta: {
        model: MODEL,
        analyzedFields: FIELD_NAMES.length,
      },
    });
  } catch (error) {
    console.error(
      "求人AI解析エラー:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "求人情報の解析に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}



