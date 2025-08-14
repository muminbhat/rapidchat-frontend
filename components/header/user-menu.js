"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

export default function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground">{user.username}</span>
          <button onClick={logout} className="text-sm underline">Logout</button>
        </>
      ) : (
        <>
          <Link href="/login" className="text-sm underline">Login</Link>
          <Link href="/signup" className="text-sm underline">Signup</Link>
        </>
      )}
    </div>
  );
}


