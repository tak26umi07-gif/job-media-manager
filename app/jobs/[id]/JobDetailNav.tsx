"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "basic-info", label: "基本情報" },
  { id: "work-condition", label: "勤務条件" },
  { id: "salary", label: "給与・報酬" },
  { id: "description", label: "仕事内容" },
  { id: "requirements", label: "応募条件・資格" },
  { id: "holidays", label: "休日・休暇" },
  { id: "benefits", label: "福利厚生・保険" },
  { id: "selection", label: "応募・選考情報" },
  { id: "source", label: "元案件情報" },
  { id: "media", label: "媒体掲載状況" },
];

export default function JobDetailNav() {
  const [activeId, setActiveId] = useState("basic-info");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top
          );

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();

    const element = document.getElementById(id);

    if (!element) return;

    const headerOffset = 90;
    const elementPosition =
      element.getBoundingClientRect().top +
      window.scrollY;

    window.scrollTo({
      top: elementPosition - headerOffset,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="sticky top-6 hidden w-52 shrink-0 self-start lg:block">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          ページ内メニュー
        </p>

        <div className="space-y-1">
          {sections.map((section, index) => {
            const active = activeId === section.id;

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) =>
                  handleClick(event, section.id)
                }
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-slate-900 font-semibold text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    active
                      ? "bg-white text-slate-900"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  }`}
                >
                  {index + 1}
                </span>

                <span className="truncate">
                  {section.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
