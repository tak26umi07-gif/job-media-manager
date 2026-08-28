"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};

type AdminLayoutProps = {
  children: ReactNode;
};

function getRoleLabel(role: CurrentUser["role"]) {
  switch (role) {
    case "ADMIN":
      return "管理者";
    case "EDITOR":
      return "編集者";
    case "VIEWER":
      return "閲覧者";
    default:
      return role;
  }
}

function getInitial(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "?";
  }

  return trimmed.charAt(0).toUpperCase();
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (pathname === "/login") {
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        setUser(data.user ?? null);
      } catch (error) {
        console.error(
          "現在のユーザー情報取得エラー:",
          error
        );

        setUser(null);
      }
    };

    fetchCurrentUser();
  }, [pathname]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <div className="min-h-screen pl-16">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              JOB MEDIA MANAGER
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.name ?? "読み込み中..."}
              </p>

              <p className="text-xs text-slate-500">
                {user ? getRoleLabel(user.role) : ""}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user ? getInitial(user.name) : "?"}
            </div>

            <LogoutButton />
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
