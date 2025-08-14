"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Home, Users as UsersIcon, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
    >
      <div className="glass border-t border-border/50 mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-3">
          {items.map((it, index) => {
            const active = pathname === it.href || (it.href === "/" && pathname.startsWith("/chat"));
            return (
              <motion.div
                key={it.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link 
                  href={it.href} 
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-2 text-sm transition-all duration-200 relative group ${
                    active 
                      ? "text-primary font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-t-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <it.Icon className={`w-5 h-5 transition-all duration-200 ${
                      active ? "scale-110" : "group-hover:scale-105"
                    }`} />
                  </div>
                  <span className="relative z-10 text-xs font-medium">
                    {it.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}


