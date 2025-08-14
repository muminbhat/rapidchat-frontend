"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const token = useAuthStore((s) => s.token);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const router = useRouter();
  const setActiveWaId = useChatStore((s) => s.setActiveWaId);
  const { data } = useQuery({
    queryKey: ["all-users", q],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      return Array.isArray(res) ? res : [];
    },
  });

  if (!token) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-dvh pb-14 lg:pb-0">
      <div className="mx-auto max-w-screen-sm p-4 space-y-3">
        <div className="text-lg font-semibold">Users</div>
        <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="divide-y border rounded-md">
          {(data || []).map((u) => (
            <button key={u.id} onClick={() => setSelected(u)} className={`w-full text-left px-3 py-2 hover:bg-accent/50 ${selected?.id === u.id ? "bg-accent/40" : ""}`}>{u.username}{u.email ? ` • ${u.email}` : ""}</button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button disabled={!selected} onClick={async () => {
            const msg = await api.post("/chat/messages", { peerUserId: selected.id, text: "." });
            setActiveWaId(msg.conversationId);
            router.push(`/chat/${msg.conversationId}`);
          }}>Start chat</Button>
        </div>
      </div>
    </div>
  );
}


