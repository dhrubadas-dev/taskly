"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/shadcnui/button";
import { authClient } from "@/lib/auth-client";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message ?? "Failed to log out");
        return;
      }

      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isLoggingOut}
      onClick={handleLogout}>
      {isLoggingOut ?
        <>
          <LogOut className="h-4 w-4 animate-pulse" />
          Logging out...
        </>
      : <>
          <LogOut className="h-4 w-4" />
          Log out
        </>
      }
    </Button>
  );
};

export default LogoutButton;
