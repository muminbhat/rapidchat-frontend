"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/app/providers";
import { ArrowLeft } from "lucide-react";

function useDebounced(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ConversationsList() {
  const token = useAuthStore((s) => s.token);
  const activeWaId = useChatStore((s) => s.activeWaId);
  const setActiveWaId = useChatStore((s) => s.setActiveWaId);
  const [q, setQ] = useState("");
  const debounced = useDebounced(q, 300);
  const socket = useSocket();
  const router = useRouter();

  // If not logged in, do not fetch
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["chat-conversations", debounced, token],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get(`/chat/conversations`);
      return Array.isArray(res) ? res : [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const dedupedConversations = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const byPeer = new Map();
    for (const c of list) {
      const key = c.peerUserId || c.id;
      const prev = byPeer.get(key);
      const currentTs = c.lastMessageAt ? new Date(c.lastMessageAt).getTime() : 0;
      const prevTs = prev?.lastMessageAt ? new Date(prev.lastMessageAt).getTime() : 0;
      if (!prev || currentTs > prevTs) byPeer.set(key, c);
    }
    return Array.from(byPeer.values());
  }, [data]);

  useEffect(() => {
    if (!socket) return;
    const onChatUpdated = () => refetch();
    socket.on("chat:messageCreated", onChatUpdated);
    socket.on("chat:conversationUpdated", onChatUpdated);
    return () => {
      socket.off("chat:messageCreated", onChatUpdated);
      socket.off("chat:conversationUpdated", onChatUpdated);
    };
  }, [socket, refetch]);

  function openChat(conversationId) {
    setActiveWaId(conversationId);
    // Use replace to avoid stacking history entries that require manual refresh
    router.push(`/chat/${encodeURIComponent(conversationId)}`);
    // Ensure state is up-to-date on navigation
    setTimeout(() => {
      setActiveWaId(conversationId);
    }, 0);
  }

  return (
    <div className={cn("h-full flex flex-col", activeWaId && "hidden lg:flex")}> {/* hide on mobile when a chat is active */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {!token && (
        <div className="p-3 border-b text-sm text-muted-foreground">Please login to start chatting</div>
      )}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {isLoading && (
            <div className="p-3 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {token && (!data || data.length === 0) && !isLoading && (
            <div className="p-4 text-sm text-muted-foreground">No conversations</div>
          )}
          {token && dedupedConversations.map((c) => (
            <button
              key={`conv-${c.id}`}
              onClick={() => openChat(c.id)}
              className={cn(
                "w-full text-left p-3 hover:bg-accent/50 transition-colors",
                activeWaId === c.id && "bg-accent/40"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(c.peerUsername || c.id)}`} />
                  <AvatarFallback>{(c.peerUsername?.[0] || "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium">{c.peerUsername || "Conversation"}</div>
                    {c.lastMessageAt && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">&nbsp;</div>
                </div>
                {c.unreadCount > 0 && (
                  <div className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] h-5 min-w-5 px-1">
                    {c.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

