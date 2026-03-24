import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MessageCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Conversation = {
  id: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  sender_type: string;
  created_at: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const AdminChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const newMsg = payload.new as Message;
        // Only refresh if it's a message from user side (not admin's own sends)
        if (newMsg.sender_type !== "admin") {
          if (newMsg.conversation_id === selectedConv) {
            loadMessages(selectedConv);
          }
          fetchConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data as Conversation[]);
  };

  const loadMessages = async (convId: string) => {
    setSelectedConv(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  const sendAdminReply = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    setSending(true);

    // Save admin message
    await supabase.from("chat_messages").insert({
      conversation_id: selectedConv,
      role: "assistant",
      content: input.trim(),
      sender_type: "admin",
    } as any);

    setInput("");
    setSending(false);

    // Reload messages
    loadMessages(selectedConv);
  };

  const sendAIReply = async () => {
    if (!selectedConv || sending) return;
    setSending(true);

    try {
      // Build message history for AI context
      const aiMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: aiMessages, conversationId: selectedConv }),
      });

      if (!resp.ok || !resp.body) throw new Error("AI failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullResponse += content;
          } catch { break; }
        }
      }

      if (fullResponse) {
        await supabase.from("chat_messages").insert({
          conversation_id: selectedConv,
          role: "assistant",
          content: fullResponse,
          sender_type: "bot",
        } as any);
        loadMessages(selectedConv);
      }
    } catch (e) {
      console.error("AI reply error:", e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " " +
      date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversation list */}
      <div className="border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="bg-muted px-4 py-3 border-b border-border">
          <h3 className="font-bold text-sm uppercase tracking-wider font-display flex items-center gap-2">
            <MessageCircle size={16} /> Conversations
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-muted-foreground text-sm p-4 text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadMessages(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition ${
                  selectedConv === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{conv.user_name || "Guest"}</p>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {conv.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.user_email || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(conv.updated_at)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="md:col-span-2 border border-border rounded-lg overflow-hidden flex flex-col">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Bot size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a conversation to view</p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role !== "user" && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      msg.sender_type === "admin" ? "bg-accent/10" : "bg-primary/10"
                    }`}>
                      {msg.sender_type === "admin" ? <User size={14} className="text-accent" /> : <Bot size={14} className="text-primary" />}
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-muted text-foreground rounded-br-md"
                      : msg.sender_type === "admin"
                        ? "bg-accent text-accent-foreground rounded-bl-md"
                        : "bg-primary/10 text-foreground rounded-bl-md"
                  }`}>
                    <div className="prose prose-sm max-w-none [&>p]:m-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <p className="text-[10px] opacity-50 mt-1">
                      {msg.sender_type === "admin" ? "Admin" : msg.sender_type === "bot" ? "AI Bot" : "User"} • {formatTime(msg.created_at)}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Admin input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); sendAdminReply(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type admin reply..."
                  className="flex-1 text-sm"
                  disabled={sending}
                />
                <Button type="submit" size="sm" disabled={sending || !input.trim()} className="bg-accent text-accent-foreground">
                  <Send size={14} className="mr-1" /> Reply
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={sendAIReply} disabled={sending}>
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} className="mr-1" />} AI Reply
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
