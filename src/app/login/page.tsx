import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<p>Carregando formulário...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
