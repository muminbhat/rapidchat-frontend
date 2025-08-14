"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { useSocket } from "@/app/providers";
import { Skeleton } from "@/components/ui/skeleton";

function dedupByMessageId(items) {
  const seen = new Set();
  const out = [];
  for (const m of items) {
    const key = m?.id || m?.messageId;
    if (m && key && !seen.has(key)) {
      seen.add(key);
      out.push(m);
    }
  }
  return out;
}

function formatDateLabel(d) {
  const today = new Date();
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = (todayDate - date) / 86400000;
  if (diff === 0) return "Today";
  if (diff === 86400000 / 86400000) return "Yesterday";
  return d.toLocaleDateString();
}

export default function ConversationView() {
  const conversationId = useChatStore((s) => s.activeWaId);
  const me = useAuthStore((s) => s.user);
  const socket = useSocket();
  const client = useQueryClient();
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      conversationId
        ? api.get(`/chat/messages/${conversationId}?limit=50&order=desc${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`)
        : Promise.resolve({ items: [], nextCursor: null }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
  });

  // Optionally fetch conversation info to display peer name
  const { data: convInfo } = useQuery({
    queryKey: ["conv-info", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      // reuse list call and find; backend has no single endpoint for conv info yet
      const list = await api.get(`/chat/conversations`);
      return (list || []).find((c) => c.id === conversationId) || null;
    },
    staleTime: 3000,
  });

  const allDesc = useMemo(() => dedupByMessageId((data?.pages || []).flatMap((p) => p.items || [])), [data]);
  const allAsc = useMemo(() => [...allDesc].reverse(), [allDesc]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("join", { conversationId });

    const onCreated = (msg) => {
      if (msg.conversationId !== conversationId) return;
      client.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        const pages = old.pages ? [...old.pages] : [];
        if (pages.length === 0) return old;
        const last = pages[0];
        const updated = { ...last, items: dedupByMessageId([msg, ...(last.items || [])]) };
        pages[0] = updated;
        return { ...old, pages };
      });
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const onStatus = () => {
      // For chat conversations, simply invalidate the query to refresh
      client.invalidateQueries({ queryKey: ["messages", conversationId] });
    };

    const onTyping = (payload) => {
      if (!payload || payload.conversationId !== conversationId) return;
      // If the event is from the other user, flip typing indicator
      const meId = (useAuthStore.getState().user || {}).id;
      const fromPeer = payload.userId && String(payload.userId) !== String(meId);
      if (!fromPeer) return;
      if (payload.typing) {
        setIsPeerTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsPeerTyping(false), 2000);
      } else {
        setIsPeerTyping(false);
      }
    };

    socket.on("chat:messageCreated", onCreated);
    socket.on("chat:conversationUpdated", onStatus);
    socket.on("chat:typing", onTyping);
    return () => {
      socket.emit("leave", { conversationId });
      socket.off("chat:messageCreated", onCreated);
      socket.off("chat:conversationUpdated", onStatus);
      socket.off("chat:typing", onTyping);
    };
  }, [socket, conversationId, client]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationId, allAsc.length]);

  useEffect(() => {
    if (!topRef.current) return;
    const el = topRef.current;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const mark = () => api.post("/chat/mark-read", { conversationId }).catch(() => {});
    mark();
    const onFocus = () => mark();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [conversationId]);

  if (!conversationId) return <div className="flex-1 p-4 text-sm text-muted-foreground">Select a conversation to start</div>;

  if (status === "loading") {
    return (
      <div className="flex-1 p-4 space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-10 w-1/2 ml-auto" />
      </div>
    );
  }

  // Build with date dividers
  const nodes = [];
  let currentDay = "";
  for (const m of allAsc) {
    const d = new Date(m.createdAt || m.timestamp);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (dayKey !== currentDay) {
      currentDay = dayKey;
      nodes.push(
        <div key={`divider-${dayKey}`} className="text-center py-2 text-xs text-muted-foreground">
          <span className="inline-block rounded-full bg-secondary px-2 py-1">{formatDateLabel(d)}</span>
        </div>
      );
    }
    const id = m.id || m.messageId;
    const isOutbound = me && m.senderId && String(m.senderId) === String(me.id);
    nodes.push(
      <div key={id} className={isOutbound ? "text-right" : "text-left"}>
        <div className={`inline-block rounded-lg px-3 py-2 ${isOutbound ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
          <div className="text-sm whitespace-pre-wrap break-words">{m.text || ""}</div>
          <div className="mt-1 text-[10px] opacity-70 flex items-center gap-1 justify-end">
            {new Date(m.createdAt || m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      {convInfo?.peerUsername && (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2 flex items-center gap-3">
          <button className="lg:hidden -ml-2 mr-2 rounded p-1 hover:bg-accent" onClick={() => window.history.back()} aria-label="Back">←</button>
          <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(convInfo.peerUsername)}`} alt="avatar" className="w-8 h-8 rounded-full" />
          <div className="font-medium text-sm truncate">{convInfo.peerUsername}</div>
        </div>
      )}
      <div className="p-4 pt-2 space-y-2">
        <div ref={topRef} />
        {nodes}
        {hasNextPage && (
          <div className="text-center text-xs text-muted-foreground py-2">Loading more…</div>
        )}
        {isPeerTyping && (
          <div className="text-left py-1 text-xs italic text-muted-foreground">typing…</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
