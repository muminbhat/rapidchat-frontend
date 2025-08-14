"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Home, Users as UsersIcon, User as UserIcon } from "lucide-react";

export default function MobileTabs() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  if (!user) return null;
  // Hide tabs on chat detail for better UX
  if (pathname && pathname.startsWith("/chat/")) return null;
  const items = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/users", label: "Users", Icon: UsersIcon },
    { href: "/profile", label: "Profile", Icon: UserIcon },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="mx-auto max-w-screen-2xl grid grid-cols-3">
        {items.map((it) => {
          const active = pathname === it.href || (it.href === "/" && pathname.startsWith("/chat"));
          return (
            <Link key={it.href} href={it.href} className={`flex items-center justify-center gap-2 py-3 text-sm ${active ? "font-semibold" : "text-muted-foreground"}`}>
              <it.Icon className="w-4 h-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


