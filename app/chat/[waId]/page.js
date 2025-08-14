"use client";

import { useEffect } from "react";
import ConversationsList from "@/components/conversations/list";
import ConversationView from "@/components/conversation/view";
import Composer from "@/components/composer";
import { useChatStore } from "@/store/chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const setActiveWaId = useChatStore((s) => s.setActiveWaId);

  useEffect(() => {
    const waId = Array.isArray(params.waId) ? params.waId[0] : params.waId;
    if (waId) setActiveWaId(String(waId));
  }, [params, setActiveWaId]);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-screen-2xl px-4 pt-0 pb-20 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 lg:gap-4">
          <aside className="hidden lg:block border rounded-lg bg-card/50 h-[100dvh] lg:h-[80dvh] overflow-hidden">
            <ConversationsList />
          </aside>
          <section className="border rounded-none lg:rounded-lg bg-card/50 min-h-[100dvh] lg:h-[80dvh] flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ConversationView />
              <div className="h-24" />
            </div>
            <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
              <div className="mx-auto max-w-screen-2xl px-4">
                <Composer />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
