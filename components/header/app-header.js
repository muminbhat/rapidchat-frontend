"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/header/user-menu";
import ThemeToggle from "@/components/theme-toggle";
import { motion } from "framer-motion";

export default function AppHeader() {
  const pathname = usePathname();
  const onChatDetail = pathname?.startsWith("/chat/") ?? false;
  const containerClass = onChatDetail ? "hidden lg:block" : "block";
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-30 glass border-b border-border/50 ${containerClass}`}
    >
      <div className="mobile-container mx-auto w-full max-w-screen-2xl py-3 flex items-center justify-between">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="font-bold tracking-tight gradient-text heading-responsive"
        >
          RapidQuest
        </motion.div>
        <div className="flex items-center gap-3">
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}


