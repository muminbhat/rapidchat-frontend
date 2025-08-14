"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import { useSocket } from "@/app/providers";
import { toast } from "sonner";

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
    <div className="p-3 border-t">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); notifyTyping(true); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              doSend();
            }
          }}
          placeholder="Type a message"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button disabled={mutation.isPending} className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">
          {mutation.isPending ? "Sending…" : "Send"}
        </button>
      </form>
      <div className="px-3 py-1 text-xs text-muted-foreground">
        {mutation.isPending ? "Sending…" : text.trim() ? "Press Enter to send" : ""}
      </div>
    </div>
  );
}
