import { AuthForm } from "./_components/auth-form";
import { SigninWithGoogle } from "./_components/oauth_form";
export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Nagare
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          クローズドコミュニティの共有ライブラリ
        </p>
      </div>
      <AuthForm />
    </main>
  );
}
