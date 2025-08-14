"use client";

import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import ConversationsList from "@/components/conversations/list";
import ConversationView from "@/components/conversation/view";
import Composer from "@/components/composer";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const setActiveWaId = useChatStore((s) => s.setActiveWaId);
  const token = useAuthStore((s) => s.token);

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

  useEffect(() => {
    const waId = Array.isArray(params.waId) ? params.waId[0] : params.waId;
    if (waId) setActiveWaId(String(waId));
  }, [params, setActiveWaId]);

  // Don't render anything if not authenticated
  if (!token) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-full max-w-screen-2xl mx-auto flex min-h-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:gap-6 w-full h-full min-h-0 overflow-hidden"
          >
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="modern-card h-full min-h-0 flex flex-col overflow-hidden"
            >
              <ConversationsList />
            </motion.aside>
            
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="modern-card h-full min-h-0 flex flex-col overflow-hidden"
            >
              {/* Desktop header only - mobile uses ConversationView header */}
              <div className="hidden lg:flex p-4 border-b border-border/50 items-center justify-between bg-background/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="font-medium gradient-text">Chat</div>
                </div>
              </div>
              <ConversationView />
              <Composer />
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
