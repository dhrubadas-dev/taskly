import Link from "next/link";
import LogoutButton from "../Buttons/LogoutButton";
import ThemeToggleButton from "../Buttons/ThemeToggleButton";

const Header = () => {
  return (
    <header
      className="border-border/50 bg-background/70 fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-xl backdrop-saturate-150"
      aria-label="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href={"/"}>
          <h1
            className="text-2xl font-semibold"
            aria-label="App Name">
            Taskly
          </h1>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href={"/tasks"}>Tasks</Link>
          <Link href={"/projects"}>Projects</Link>
          <Link href={"/tasks/new"}>New Task</Link>

          <span className="bg-border mx-1 h-6 w-px" />

          <ThemeToggleButton />
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
};

export default Header;
