"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthResult } from "../actions";
import { SigninWithGoogle } from "./oauth_form";
type Tab = "login" | "signup";

export function AuthForm() {
  const [tab, setTab] = useState<Tab>("login");
  const [loginState, loginAction, loginPending] = useActionState<
    AuthResult | null,
    FormData
  >(login, null);
  const [signupState, signupAction, signupPending] = useActionState<
    AuthResult | null,
    FormData
  >(signup, null);

  return (
    <div className="w-full max-w-sm">
      {/* タブ */}
      <div className="flex border-b border-gray-200 mb-8">
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "login" ? "ログイン" : "新規登録"}
          </button>
        ))}
      </div>

      {tab === "login" ? (
        <form action={loginAction} className="space-y-4">
          <Field label="メールアドレス" name="email" type="email" required />
          <Field label="パスワード" name="password" type="password" required />
          <SigninWithGoogle />
          {loginState && "error" in loginState && (
            <ErrorMessage message={loginState.error} />
          )}
          <SubmitButton pending={loginPending} label="ログイン" />
        </form>
      ) : (
        <form action={signupAction} className="space-y-4">
          <Field label="ユーザー名" name="username" required />
          <Field label="メールアドレス" name="email" type="email" required />
          <Field
            label="パスワード（8文字以上）"
            name="password"
            type="password"
            required
          />
{signupState && "error" in signupState && (
            <ErrorMessage message={signupState.error} />
          )}
          <SubmitButton pending={signupPending} label="登録する" />
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-medium text-gray-500 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
      />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
      {message}
    </p>
  );
}

function SubmitButton({
  pending,
  label,
}: {
  pending: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {pending ? "処理中..." : label}
    </button>
  );
}
