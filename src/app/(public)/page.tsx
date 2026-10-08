import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in - Taskly",
  description: "Log in to your Taskly account",
};

const LoginPage = () => {
  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back! Enter your credentials to continue.">
      <LoginForm />

      <p className="text-muted-foreground text-center text-sm">
        {"Don't have an account? "}
        <Link
          href="/register"
          className="text-primary font-medium underline-offset-4 hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
