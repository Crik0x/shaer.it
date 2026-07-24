import { LoginForm } from "./login-form";

// Server Component: solo il guscio. Il form è la foglia interattiva ('use client').
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Shaer.it
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accedi alla tua dashboard QR
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
