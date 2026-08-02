import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in - Taskly",
  description: "Log in to your Taskly account",
};

const LoginPage = () => {
  return (
    <section className="grid min-h-dvh place-items-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Log in</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Enter your credentials to continue.
          </p>
        </div>

        <LoginForm />

        <p className="text-muted-foreground text-center text-sm">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="text-primary font-medium underline-offset-4 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
