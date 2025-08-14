"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/header/user-menu";
import ThemeToggle from "@/components/theme-toggle";

export default function AppHeader() {
  const pathname = usePathname();
  const onChatDetail = pathname?.startsWith("/chat/") ?? false;
  const containerClass = onChatDetail ? "hidden lg:block" : "block";
  return (
    <header className={`sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${containerClass}`}>
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold tracking-tight">RapidQuest</div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}


