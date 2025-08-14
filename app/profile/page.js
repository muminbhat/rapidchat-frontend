"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  if (!user) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }
  return (
    <div className="min-h-dvh pb-14 lg:pb-0">
      <div className="mx-auto max-w-screen-sm p-6 space-y-4">
        <div className="text-lg font-semibold">Profile</div>
        <div className="flex items-center gap-3">
          <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`} alt="avatar" className="w-12 h-12 rounded-full" />
          <div>
            <div className="font-medium">{user.username}</div>
            <div className="text-sm text-muted-foreground">{user.email || "No email"}</div>
          </div>
        </div>
        <div>
          <button onClick={logout} className="rounded-md border px-3 py-2 text-sm">Logout</button>
        </div>
      </div>
    </div>
  );
}


