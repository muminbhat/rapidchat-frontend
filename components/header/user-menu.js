"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn, UserPlus } from "lucide-react";

export default function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  
  return (
    <div className="flex items-center gap-3">
      {token ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/30 border border-border/30">
            <User className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{user?.username}</span>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <LogOut className="size-4 mr-1" />
            Logout
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Link href="/login">
              <LogIn className="size-4 mr-1" />
              Login
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="btn-primary"
          >
            <Link href="/signup">
              <UserPlus className="size-4 mr-1" />
              Signup
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}


