"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    label: "メイン",
    items: [
      {
        href: "/dashboard",
        label: "ダッシュボード",
        icon: "⌂",
        exact: true,
      },
    ],
  },
  {
    label: "求人管理",
    items: [
      {
        href: "/jobs",
        label: "求人一覧",
        icon: "▤",
        exact: true,
      },
      {
        href: "/jobs/new",
        label: "求人作成",
        icon: "＋",
        exact: true,
      },
    ],
  },
  {
    label: "システム管理",
    items: [
      {
        href: "/users",
        label: "ユーザー管理",
        icon: "♙",
        exact: true,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (
    href: string,
    exact?: boolean
  ) => {
    if (exact) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };


  return (
    <>
      {/* メニューボタン */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          open
            ? "メニューを閉じる"
            : "メニューを開く"
        }
        aria-expanded={open}
        className={`fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-all duration-200 ${
          open
            ? "border-slate-300 bg-slate-700 text-white"
            : "border-slate-200 bg-white/90 text-slate-500 hover:bg-white hover:text-slate-800"
        }`}
      >
        {open ? (
          <span className="text-xl leading-none">
            ×
          </span>
        ) : (
          <span className="flex w-5 flex-col gap-1">
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
          </span>
        )}
      </button>

      {/* オーバーレイ */}
      {open && (
        <button
          type="button"
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20"
        />
      )}

      {/* サイドメニュー */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* ロゴ */}
        <div className="flex h-20 items-center border-b border-slate-200 px-5 pl-16">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              JOB MEDIA
            </p>

            <h1 className="text-lg font-bold text-slate-900">
              Manager
            </h1>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="h-[calc(100vh-144px)] overflow-y-auto p-3">
          {menuSections.map((section) => (
            <div
              key={section.label}
              className="mb-5"
            >
              <p className="mb-2 px-3 text-xs font-semibold text-slate-400">
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(
                    item.href,
                    item.exact
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
                        {item.icon}
                      </span>

                      <span>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* フッター */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">
            Job Media Manager
          </p>

          <p className="mt-1 text-xs text-slate-500">
            社内求人管理システム
          </p>
        </div>
      </aside>
    </>
  );
}

