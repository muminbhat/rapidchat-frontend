"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/app/providers";
import { ArrowLeft, Search, MessageCircle, Users, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className={cn("h-full flex flex-col", activeWaId && "hidden lg:flex")}>
      <div className="p-4 border-b border-border/50 space-y-3 bg-background/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 modern-input"
            />
          </div>
          {/* New Chat Button */}
          <Button
            onClick={() => router.push('/users')}
            size="icon"
            variant="outline"
            className="flex-shrink-0 hover:bg-accent/50"
            title="New Chat"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      
      {!token && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 text-center space-y-3 flex-shrink-0"
        >
          <MessageCircle className="size-12 text-muted-foreground mx-auto" />
          <div className="text-sm text-muted-foreground">Please login to start chatting</div>
        </motion.div>
      )}
      
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
        <div className="divide-y divide-border/30">
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          
          {token && (!data || data.length === 0) && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-4"
            >
              <MessageCircle className="size-16 text-muted-foreground/50 mx-auto" />
              <div className="text-sm text-muted-foreground">No conversations yet</div>
              <div className="text-xs text-muted-foreground/70 mb-4">Start a new conversation to begin chatting</div>
              <Button
                onClick={() => router.push('/users')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mx-auto"
              >
                <Users className="size-4" />
                <Plus className="size-4" />
                Start New Chat
              </Button>
            </motion.div>
          )}
          
          <AnimatePresence>
            {token && dedupedConversations.map((c, index) => (
              <motion.button
                key={`conv-${c.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => openChat(c.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-accent/30 transition-all duration-200 group",
                  activeWaId === c.id && "bg-accent/40 border-l-4 border-l-primary"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative"
                  >
                    <Avatar className="size-12 ring-2 ring-border/30 group-hover:ring-primary/30 transition-all duration-200">
                      <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(c.peerUsername || c.id)}`} />
                      <AvatarFallback className="text-sm font-medium">
                        {(c.peerUsername?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {c.unreadCount > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium h-5 min-w-5 px-1.5"
                      >
                        {c.unreadCount}
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                        {c.peerUsername || "Conversation"}
                      </div>
                      {c.lastMessageAt && (
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {c.lastMessage || "No messages yet"}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

