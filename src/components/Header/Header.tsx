"use client";

import { Button } from "@/components/shadcnui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcnui/sheet";
import { cn } from "@/lib/utils";
import { ListChecks, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../Buttons/LogoutButton";
import ThemeToggleButton from "../Buttons/ThemeToggleButton";

const navLinks = [
  { href: "/tasks", label: "Tasks" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks/new", label: "New Task" },
] as const;

const Header = () => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/tasks/new") {
      return pathname === "/tasks/new";
    }
    if (href === "/tasks") {
      return (
        pathname === "/tasks" ||
        (pathname.startsWith("/tasks/") && pathname !== "/tasks/new")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className="border-border/50 bg-background/70 fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-xl backdrop-saturate-150"
      aria-label="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link
          href={"/tasks"}
          className="flex items-center gap-2"
          aria-label="Taskly home">
          <span className="bg-brand text-brand-foreground flex size-8 items-center justify-center rounded-lg">
            <ListChecks className="size-5" />
          </span>
          <span className="text-xl font-semibold">Taskly</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive ?
                    "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}>
                {link.label}
              </Link>
            );
          })}

          <span className="bg-border mx-1 h-6 w-px" />

          <ThemeToggleButton />
          <LogoutButton />
        </nav>

        {/* Mobile menu */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggleButton />
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                />
              }>
              <Menu />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 p-6 pt-2">
                {navLinks.map((link) => {
                  const isActive = isLinkActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive ?
                          "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-2 p-6">
                <span className="bg-border h-px w-full" />
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
