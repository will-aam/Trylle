import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<p>Carregando formulário...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
