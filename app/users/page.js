"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, MessageCircle, ArrowLeft } from "lucide-react";

export default function UsersPage() {
  const token = useAuthStore((s) => s.token);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const router = useRouter();
  const setActiveWaId = useChatStore((s) => s.setActiveWaId);
  
  useEffect(() => {
    // Load auth state from storage
    useAuthStore.getState().loadFromStorage();
  }, []);

  // Force layout recalculation to prevent timing issues
  useLayoutEffect(() => {
    const forceLayout = () => {
      document.body.style.height = document.body.style.height;
    };
    
    const timer = setTimeout(forceLayout, 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (token === null && typeof window !== "undefined") {
      router.replace("/");
      return;
    }
  }, [token, router]);

  const { data } = useQuery({
    queryKey: ["all-users", q],
    enabled: !!token,
    queryFn: async () => {
      const res = await api.get(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      return Array.isArray(res) ? res : [];
    },
  });

  // Don't render anything if not authenticated
  if (!token) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-full max-w-screen-sm mx-auto flex min-h-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full min-h-0 flex flex-col overflow-hidden"
          >
            <div className="modern-card h-full min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button 
                    className="hover:bg-accent/50 transition-colors" 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => router.push('/')}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div className="font-medium gradient-text">Select User</div>
                </div>
              </div>
              
              <div className="p-4 space-y-4 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-10 modern-input"
                  />
                </div>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                <div className="divide-y divide-border/30">
                  {(data || []).map((u, index) => (
                    <motion.button
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => setSelected(u)}
                      className={`w-full text-left p-4 hover:bg-accent/30 transition-all duration-200 group ${
                        selected?.id === u.id ? "bg-accent/40 border-l-4 border-l-primary" : ""
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {u.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{u.username}</div>
                          {u.email && (
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0 mb-20">
                <Button 
                  disabled={!selected} 
                  onClick={async () => {
                    const msg = await api.post("/chat/messages", { peerUserId: selected.id, text: "." });
                    setActiveWaId(msg.conversationId);
                    router.push(`/chat/${msg.conversationId}`);
                  }}
                  className="w-full btn-primary"
                >
                  <MessageCircle className="size-4 mr-2" />
                  Start Chat with {selected?.username}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


