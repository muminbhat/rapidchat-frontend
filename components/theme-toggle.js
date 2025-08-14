"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="inline-flex items-center rounded-lg border-2 border-border/50 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm transition-all duration-200 hover:bg-accent/50 hover:border-primary/50 hover:shadow-lg"
      >
        <div className="size-4" />
        <span className="ml-2 hidden sm:inline font-medium">Theme</span>
      </button>
    );
  }

  const isDark = theme !== "light";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      className="inline-flex items-center rounded-lg border-2 border-border/50 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm transition-all duration-200 hover:bg-accent/50 hover:border-primary/50 hover:shadow-lg"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onDoubleClick={() => {
        const current = localStorage.getItem("rq-operator-name") || "";
        const name = prompt("Set your operator display name", current || "") || "";
        localStorage.setItem("rq-operator-name", name.trim());
        toast.success("Operator name saved");
      }}
      title="Click to toggle theme. Double-click to set operator name"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </motion.div>
      <motion.span 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-2 hidden sm:inline font-medium"
      >
        {isDark ? "Light" : "Dark"}
      </motion.span>
    </motion.button>
  );
}
