import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">SiquiTour Admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in with your admin account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
