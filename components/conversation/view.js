"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { useSocket } from "@/app/providers";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";

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

  if (!conversationId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="text-center space-y-4">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <User className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">Choose a conversation from the list to start chatting</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-start">
            <Skeleton className="h-12 w-64 rounded-2xl" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-48 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-8 w-40 rounded-2xl" />
          </div>
        </div>
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
        <motion.div 
          key={`divider-${dayKey}`} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <span className="inline-block rounded-full bg-secondary/50 px-4 py-2 text-xs text-muted-foreground font-medium">
            {formatDateLabel(d)}
          </span>
        </motion.div>
      );
    }
    const id = m.id || m.messageId;
    const isOutbound = me && m.senderId && String(m.senderId) === String(me.id);
    nodes.push(
      <motion.div 
        key={id} 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isOutbound ? "justify-end" : "justify-start"} mb-3`}
      >
        <div className={`message-bubble ${isOutbound ? "message-bubble-outbound" : "message-bubble-inbound"}`}>
          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {m.text || ""}
          </div>
          <div className="mt-2 text-[10px] opacity-70 flex items-center gap-1 justify-end">
            {new Date(m.createdAt || m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {convInfo?.peerUsername && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 glass border-b border-border/50 px-4 py-3 flex items-center gap-3 flex-shrink-0"
        >
          <button 
            className="lg:hidden -ml-2 mr-2 rounded-lg p-2 hover:bg-accent/50 transition-colors" 
            onClick={() => window.history.back()} 
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <img 
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(convInfo.peerUsername)}`} 
              alt="avatar" 
              className="w-8 h-8 rounded-full" 
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-foreground">{convInfo.peerUsername}</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </div>
        </motion.div>
      )}
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-2 hide-scrollbar">
          <div ref={topRef} />
          <AnimatePresence>
            {nodes}
          </AnimatePresence>
          
          {hasNextPage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-muted-foreground py-4"
            >
              <div className="loading-shimmer rounded-full h-1 w-24 mx-auto mb-2"></div>
              Loading more messages...
            </motion.div>
          )}
          
          {isPeerTyping && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex justify-start mb-3"
            >
              <div className="message-bubble message-bubble-inbound">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
