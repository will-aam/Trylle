import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-4">
          <Suspense fallback={<p>Carregando formulário...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
