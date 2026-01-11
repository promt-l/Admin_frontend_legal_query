import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Paperclip, Search, Send } from "lucide-react";
import { getSocket } from "../../lib/socket";
import api from "@/config/api";
import { useSearchParams } from "react-router-dom";
import { updateQuery } from "@/lib/query.api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const socket = getSocket();

interface Query {
  _id: string;
  subject: string;
  question: string;
  fullName: string;
  age: string;
  gender: string;
  city: string;
  state: string;
  issueCategory: string;
  status: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
}

interface ChatMessage {
  _id: string;
  queryId: string;
  senderId: string;
  senderRole: "Client" | "Admin";
  message: string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
}

const normalizeMessage = (m: any): ChatMessage => ({
  ...m,
  _id: String(m._id),
  queryId: String(m.queryId),
  senderId: String(m.senderId),
});

const SupportQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [activeQuery, setActiveQuery] = useState<Query | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const queryIdFromURL = searchParams.get("queryId");

  useEffect(() => {
    socket.connect();
    socket.emit("connect_user");

    socket.on("receive_message", (raw: any) => {
      const msg = normalizeMessage(raw);
      if (msg.queryId !== activeQuery?._id) return;

      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    });

    socket.on("chat_history", ({ chats }) => {
      setMessages(chats.map(normalizeMessage));
    });

    return () => {
      socket.off("receive_message");
      socket.off("chat_history");
      socket.disconnect();
    };
  }, [activeQuery?._id]);

  useEffect(() => {
    const loadQueries = async () => {
      const res = await api.get("/queries");
      setQueries(res.data);
    };
    loadQueries();
  }, []);

  useEffect(() => {
    if (!queries.length) return;

    if (queryIdFromURL) {
      const matched = queries.find((q) => q._id === queryIdFromURL);
      if (matched) {
        setActiveQuery(matched);
        return;
      }
    }

    if (!activeQuery) {
      setActiveQuery(queries[0]);
    }
  }, [queries, queryIdFromURL]);

  useEffect(() => {
    if (!activeQuery) return;
    socket.emit("fetch_history", { queryId: activeQuery._id });
  }, [activeQuery]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeQuery) return;

    const alreadyAnswered = messages.some(
      (m) => m.senderRole === "Admin"
    );

    const tempMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      queryId: activeQuery._id,
      senderId: "admin",
      senderRole: "Admin",
      message: messageInput,
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("send_message", {
      queryId: activeQuery._id,
      receiverId: activeQuery.userId._id,
      message: messageInput,
    });

    if (
      !alreadyAnswered &&
      activeQuery.status !== "answered" &&
      activeQuery.status !== "closed"
    ) {
      try {
        await updateQuery(activeQuery._id, { status: "answered" });

        setQueries((prev) =>
          prev.map((q) =>
            q._id === activeQuery._id
              ? { ...q, status: "answered" }
              : q
          )
        );

        setActiveQuery((prev) =>
          prev ? { ...prev, status: "answered" } : prev
        );
      } catch (err) {
        console.error(err);
      }
    }

    setMessageInput("");
  };

  const closeQuery = async () => {
    if (!activeQuery || activeQuery.status === "closed") return;

    try {
      await updateQuery(activeQuery._id, { status: "closed" });

      setQueries((prev) =>
        prev.map((q) =>
          q._id === activeQuery._id ? { ...q, status: "closed" } : q
        )
      );

      setActiveQuery((prev) =>
        prev ? { ...prev, status: "closed" } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Support Queries</h1>
        <p className="text-muted-foreground">
          Each conversation represents one legal query
        </p>
      </div>

      <Card className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search queries…" className="pl-10" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {queries.map((q) => (
              <div
                key={q._id}
                onClick={() => setActiveQuery(q)}
                className={`p-4 cursor-pointer border-b ${
                  activeQuery?._id === q._id ? "bg-muted" : ""
                }`}
              >
                <h4 className="font-semibold text-sm">
                  {q.subject.split(" ").slice(0, 3).join(" ")}
                  {q.subject.split(" ").length > 3 && "..."}
                </h4>

                <p className="text-sm text-muted-foreground truncate">
                  {q.fullName} • {q.gender}, {q.age}
                </p>
                <p className="text-xs text-muted-foreground">
                  By: {q.userId.fullName}
                </p>
              </div>
            ))}
          </ScrollArea>
        </div>

        {activeQuery ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between">
                <h3 className="font-semibold">{activeQuery.subject}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={activeQuery.status === "closed"}
                      onClick={closeQuery}
                    >
                      Close query
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`mb-3 flex ${
                    m.senderRole === "Admin"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%] rounded-lg p-3 text-sm bg-muted">
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t">
              {activeQuery.status === "closed" ? (
                <div className="text-center text-sm text-muted-foreground">
                  You have closed this query. Messaging is disabled.
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message…"
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a query to start chatting
          </div>
        )}
      </Card>
    </div>
  );
};

export default SupportQueries;
