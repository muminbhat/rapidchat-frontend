"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, use, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

export const SocketContext = createContext(null);

export function AppProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const token = useAuthStore((s) => s.token);
  const socket = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";
    const opts = { transports: ["websocket"], autoConnect: true };
    // attach token in query for simple auth
    if (typeof window !== "undefined") {
      const t = token || localStorage.getItem("rq-token");
      if (t) opts.query = { token: t };
    }
    return io(url, opts);
  }, [token]);

  useEffect(() => {
    // Load current user profile when token changes
    (async () => {
      try {
        const t = token || (typeof window !== "undefined" ? localStorage.getItem("rq-token") : null);
        if (t) {
          const me = await api.get("/auth/me");
          useAuthStore.getState().setUser(me);
        } else {
          useAuthStore.getState().setUser(null);
        }
      } catch {
        // invalid token
        useAuthStore.getState().logout();
      }
    })();
  }, [token]);

  useEffect(() => {
    // On connect, join a per-user room so server can push list updates
    try {
      if (socket) {
        // Use token subject as userRoom; we don't decode here, server doesn't validate value
        const t = token || localStorage.getItem("rq-token");
        if (t) socket.emit("join", { userRoom: "self" });
      }
    } catch {}
    return () => {
      if (socket) socket.close();
    };
  }, [socket]);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketContext.Provider value={socket}>
        {children}
        <Toaster richColors position="top-right" />
      </SocketContext.Provider>
    </QueryClientProvider>
  );
}

export function useSocket() {
  return use(SocketContext);
}
