import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register - Taskly",
  description: "Create a new Taskly account",
};

const RegisterPage = () => {
  return (
    <section className="grid min-h-dvh place-items-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Create an account</h1>
          <p className="text-muted-foreground text-sm">
            Enter your details to get started.
          </p>
        </div>

        <RegisterForm />

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/"
            className="text-primary font-medium underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
