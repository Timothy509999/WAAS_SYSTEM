import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/messages")({
  component: () => (
    <AppLayout>
      <MessagesPage />
    </AppLayout>
  ),
});

function MessagesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");

  const { data: contacts } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, title")
        .neq("id", user!.id)
        .order("full_name");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: thread } = useQuery({
    queryKey: ["messages", user?.id, active],
    queryFn: async () => {
      if (!active) return [];
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user!.id},recipient_id.eq.${active}),and(sender_id.eq.${active},recipient_id.eq.${user!.id})`,
        )
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!user && !!active,
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        qc.invalidateQueries({ queryKey: ["messages"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  const send = async () => {
    if (!text.trim() || !active) return;
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: user!.id, recipient_id: active, body: text.trim() });
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
    qc.invalidateQueries({ queryKey: ["messages"] });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Direct messaging across your institution.</p>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="grid h-[calc(100vh-220px)] grid-cols-1 md:grid-cols-[280px_1fr]">
          <div className="border-r">
            <div className="border-b p-3">
              <Input placeholder="Search people…" />
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              {contacts?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted ${active === c.id ? "bg-muted" : ""}`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
                      {(c.full_name || "?").slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{c.full_name || "Unnamed"}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {c.title || "Member"}
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          <div className="flex flex-col">
            {active ? (
              <>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-3">
                      {thread?.map((m: any) => {
                        const mine = m.sender_id === user!.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-gradient-primary text-primary-foreground" : "bg-muted"}`}
                            >
                              {m.body}
                              <div
                                className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                              >
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="flex items-center gap-2 border-t p-3">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message…"
                  />
                  <Button onClick={send} className="bg-gradient-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>Pick a contact to start chatting.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
