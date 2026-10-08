import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register - Taskly",
  description: "Create a new Taskly account",
};

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your details to get started.">
      <RegisterForm />

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/"
          className="text-primary font-medium underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
