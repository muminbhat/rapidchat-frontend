"use client";

import { motion } from "framer-motion";
import ConversationsList from "@/components/conversations/list";
import ConversationView from "@/components/conversation/view";
import Composer from "@/components/composer";
import GuidePage from "@/components/guide-page";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const activeWaId = useChatStore((s) => s.activeWaId);
  const setActiveWaId = useChatStore((s) => s.setActiveWaId);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  
  useEffect(() => {
    useAuthStore.getState().loadFromStorage();
  }, []);

  // Clear activeWaId when on home page to ensure conversations list shows on mobile
  useEffect(() => {
    if (activeWaId) {
      setActiveWaId(null);
    }
  }, [activeWaId, setActiveWaId]);

  // Force layout recalculation to prevent timing issues
  useLayoutEffect(() => {
    // Trigger a layout recalculation
    const forceLayout = () => {
      document.body.style.height = document.body.style.height;
    };
    
    // Small delay to ensure CSS variables are loaded
    const timer = setTimeout(forceLayout, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // Show guide page if user is not authenticated
  if (!token) {
    return <GuidePage />;
  }

  // Show chat interface if user is authenticated
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
              className="hidden lg:flex modern-card h-full min-h-0 flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button 
                    className="lg:hidden hover:bg-accent/50 transition-colors" 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => useChatStore.getState().setActiveWaId(null)}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <div className="font-medium gradient-text">Chat</div>
                </div>
                
                {/* New Chat Button for Desktop */}
                <Button
                  onClick={() => router.push('/users')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-accent/50"
                >
                  <Plus className="size-4" />
                  <Users className="size-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
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
