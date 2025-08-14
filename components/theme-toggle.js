"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid SSR/client mismatch: derive on client only
  const isDark = typeof window === "undefined" ? false : (theme !== "light");

  return (
    <button
      aria-label="Toggle theme"
      className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onDoubleClick={() => {
        const current = localStorage.getItem("rq-operator-name") || "";
        const name = prompt("Set your operator display name", current || "") || "";
        localStorage.setItem("rq-operator-name", name.trim());
        toast.success("Operator name saved");
      }}
      title="Click to toggle theme. Double-click to set operator name"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="ml-2 hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
