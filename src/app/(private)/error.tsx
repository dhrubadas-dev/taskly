"use client";

import { Button } from "@/components/shadcnui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
      <span className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
        <AlertTriangle className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={reset}>
        <RotateCcw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
};

export default ErrorPage;
