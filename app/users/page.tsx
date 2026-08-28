"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};

function getRoleLabel(role: User["role"]) {
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

function getRoleClass(role: User["role"]) {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-700";

    case "EDITOR":
      return "bg-blue-100 text-blue-700";

    case "VIEWER":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("EDITOR");

  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingUserId, setEditingUserId] =
    useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] =
    useState<User["role"]>("EDITOR");

  const [savingUserId, setSavingUserId] =
    useState<string | null>(null);

  const [deletingUserId, setDeletingUserId] =
    useState<string | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ユーザー一覧の取得に失敗しました。"
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "ユーザー一覧の取得に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();

          setCurrentUser(data.user ?? null);
        }
      } catch (error) {
        console.error(
          "現在のユーザー情報取得エラー:",
          error
        );
      }

      await fetchUsers();
    };

    initialize();
  }, []);

  async function handleCreateUser(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (creating) return;

    setCreating(true);
    setFormError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ユーザーの作成に失敗しました。"
        );
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole("EDITOR");
      setShowForm(false);

      await fetchUsers();
    } catch (error) {
      console.error(error);

      setFormError(
        error instanceof Error
          ? error.message
          : "ユーザーの作成に失敗しました。"
      );
    } finally {
      setCreating(false);
    }
  }

  function startEditingUser(user: User) {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
    setEditRole(user.role);
    setError("");
  }

  function cancelEditingUser() {
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
    setEditRole("EDITOR");
  }

  async function handleUpdateUser(user: User) {
    if (savingUserId) {
      return;
    }

    if (!editName.trim() || !editEmail.trim()) {
      setError("名前とメールアドレスを入力してください。");
      return;
    }

    if (editPassword && editPassword.length < 8) {
      setError("パスワードは8文字以上で設定してください。");
      return;
    }

    const confirmed = window.confirm(
      `ユーザー「${user.name}」の情報を更新しますか？`
    );

    if (!confirmed) {
      return;
    }

    setSavingUserId(user.id);
    setError("");

    try {
      const response = await fetch(
        `/api/users?id=${encodeURIComponent(user.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            password: editPassword,
            role: editRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ユーザーの更新に失敗しました。"
        );
      }

      cancelEditingUser();

      await fetchUsers();

      /*
       * 自分自身を編集した場合はヘッダーの情報も更新
       */
      if (currentUser?.id === user.id) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "ユーザーの更新に失敗しました。"
      );
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleDeleteUser(user: User) {
    if (deletingUserId) {
      return;
    }

    const confirmed = window.confirm(
      `ユーザー「${user.name}」を削除しますか？\n\nこの操作は取り消せません。`
    );

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    setError("");

    try {
      const response = await fetch(
        `/api/users?id=${encodeURIComponent(user.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ユーザーの削除に失敗しました。"
        );
      }

      await fetchUsers();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "ユーザーの削除に失敗しました。"
      );
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <div className="p-6">

      <section className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            ユーザー管理
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            管理画面を利用するユーザーを管理します。
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError("");
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          {showForm
            ? "キャンセル"
            : "＋ ユーザーを追加"}
        </button>
      </section>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">

          <div className="mb-5">
            <h2 className="font-semibold">
              新規ユーザー登録
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              管理画面にログインするユーザーを登録します。
            </p>
          </div>

          {formError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form
            onSubmit={handleCreateUser}
            className="grid gap-5 md:grid-cols-2"
          >

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                名前
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="山田 太郎"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                メールアドレス
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="example@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                パスワード
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="8文字以上"
                minLength={8}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                権限
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value as User["role"]
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="ADMIN">
                  管理者
                </option>

                <option value="EDITOR">
                  編集者
                </option>

                <option value="VIEWER">
                  閲覧者
                </option>
              </select>
            </div>

            <div className="flex justify-end md:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "登録中..."
                  : "ユーザーを登録する"}
              </button>
            </div>

          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">
            登録ユーザー
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {loading
              ? "読み込み中..."
              : `${users.length}人のユーザーが登録されています。`}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            ユーザー情報を読み込んでいます...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            登録されているユーザーがありません。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    名前
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    メールアドレス
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    権限
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    登録日
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                    操作
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {users.map((user) => {
                  const isEditing =
                    editingUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        {isEditing ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(event) =>
                              setEditEmail(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-600">
                            {user.email}
                          </p>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(event) =>
                              setEditRole(
                                event.target.value as User["role"]
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          >
                            <option value="ADMIN">
                              管理者
                            </option>

                            <option value="EDITOR">
                              編集者
                            </option>

                            <option value="VIEWER">
                              閲覧者
                            </option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">

                        {isEditing ? (
                          <div className="space-y-2">

                            <input
                              type="password"
                              value={editPassword}
                              onChange={(event) =>
                                setEditPassword(event.target.value)
                              }
                              placeholder="パスワード変更（任意）"
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            />

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={cancelEditingUser}
                                disabled={savingUserId === user.id}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                キャンセル
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateUser(user)
                                }
                                disabled={
                                  savingUserId === user.id
                                }
                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingUserId === user.id
                                  ? "保存中..."
                                  : "保存"}
                              </button>

                            </div>

                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                startEditingUser(user)
                              }
                              disabled={
                                deletingUserId === user.id ||
                                savingUserId !== null
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              編集
                            </button>

                            {currentUser?.id === user.id ? (
                              <span className="px-3 py-1.5 text-xs text-slate-400">
                                現在のユーザー
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteUser(user)
                                }
                                disabled={
                                  deletingUserId === user.id ||
                                  savingUserId !== null
                                }
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingUserId === user.id
                                  ? "削除中..."
                                  : "削除"}
                              </button>
                            )}

                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}

      </section>
    </div>
  );
}
