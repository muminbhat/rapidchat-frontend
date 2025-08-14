"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import { useSocket } from "@/app/providers";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Composer() {
  const conversationId = useChatStore((s) => s.activeWaId);
  const [text, setText] = useState("");
  const client = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const socket = useSocket();

  useEffect(() => {}, []);

  const mutation = useMutation({
    mutationFn: (payload) => api.post("/chat/messages", payload),
    onSuccess: (msg) => {
      // Clear input
      setText("");
      // Optimistically add to current conversation cache
      client.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        const pages = old.pages ? [...old.pages] : [];
        if (pages.length === 0) return old;
        const first = pages[0];
        const updated = { ...first, items: [msg, ...(first.items || [])] };
        pages[0] = updated;
        return { ...old, pages };
      });
    },
    onError: (e) => {
      toast.error("Failed to send. Click to retry.", {
        action: { label: "Retry", onClick: () => doSend() },
      });
    },
  });

  function doSend() {
    if (!conversationId || !text.trim()) return;
    mutation.mutate({ conversationId, text });
  }

  function notifyTyping(typing) {
    try {
      if (socket && conversationId) socket.emit("chat_typing", { conversationId, typing: !!typing });
    } catch {}
  }

  if (!conversationId || !token) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSend();
        }}
        className="p-4 space-y-3"
      >
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => { 
                setText(e.target.value); 
                notifyTyping(true); 
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  doSend();
                }
              }}
              placeholder="Type a message..."
              className="w-full resize-none rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[44px] max-h-32"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '128px'
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="size-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Smile className="size-4" />
              </button>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              disabled={mutation.isPending || !text.trim()}
              size="icon"
              className="size-12 rounded-full btn-primary shadow-lg"
            >
              {mutation.isPending ? (
                <div className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: text.trim() ? 1 : 0 }}
          className="px-4 text-xs text-muted-foreground flex items-center justify-between"
        >
          <span>
            {mutation.isPending ? "Sending..." : "Press Enter to send, Shift+Enter for new line"}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {text.length}/1000
          </span>
        </motion.div>
      </form>
    </motion.div>
  );
}
