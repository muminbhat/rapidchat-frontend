"use client";

import { motion } from "framer-motion";
import ConversationsList from "@/components/conversations/list";
import ConversationView from "@/components/conversation/view";
import Composer from "@/components/composer";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const activeWaId = useChatStore((s) => s.activeWaId);
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    useAuthStore.getState().loadFromStorage();
  }, []);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-screen-2xl px-4 pt-4 pb-20 lg:py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4"
        >
          <aside className="border rounded-lg bg-card/50 h-[70dvh] lg:h-[80dvh] overflow-hidden">
            <ConversationsList />
          </aside>
          <section className="hidden lg:flex border rounded-lg bg-card/50 h-[70dvh] lg:h-[80dvh] flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <Button className="lg:hidden" size="icon" variant="ghost" onClick={() => useChatStore.getState().setActiveWaId(null)}>
                <ArrowLeft className="size-4" />
              </Button>
              <div className="font-medium">Chat</div>
            </div>
            {token ? (
              <>
                <ConversationView />
                <Composer />
              </>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">Please login to start</div>
            )}
          </section>
        </motion.div>
      </div>
    </div>
  );
}
