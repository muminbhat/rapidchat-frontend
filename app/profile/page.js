"use client";

import { useEffect, useLayoutEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, User } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  
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
                  <div className="font-medium gradient-text">Profile</div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                <div className="p-6 space-y-6 pb-20 lg:pb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex items-center gap-4 p-4 modern-card"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xl">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-foreground">{user?.username}</div>
                      <div className="text-sm text-muted-foreground">{user?.email || "No email provided"}</div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="text-lg font-medium text-foreground">Account Settings</div>
                    <div className="space-y-3">
                      <div className="p-3 bg-accent/20 rounded-lg">
                        <div className="text-sm font-medium text-foreground">Username</div>
                        <div className="text-sm text-muted-foreground">{user?.username}</div>
                      </div>
                      <div className="p-3 bg-accent/20 rounded-lg">
                        <div className="text-sm font-medium text-foreground">Email</div>
                        <div className="text-sm text-muted-foreground">{user?.email || "Not provided"}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0 mb-20">
                <Button 
                  onClick={logout}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


