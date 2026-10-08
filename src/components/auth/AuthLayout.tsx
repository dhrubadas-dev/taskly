import { ListChecks } from "lucide-react";
import { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <section className="grid min-h-dvh place-items-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <span className="bg-brand text-brand-foreground flex size-12 items-center justify-center rounded-xl">
            <ListChecks className="size-6" />
          </span>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
};

export default AuthLayout;
