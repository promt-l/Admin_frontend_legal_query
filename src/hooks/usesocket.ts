import { Socket } from "socket.io-client";
import { useChatStore } from "@/store/chatStore";
import { User, ChatMessage } from "@/types/sockettypes";

export const useSocket = (socket: Socket) => {
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore(
    (state) => state.updateMessageStatus
  );

  const join = () => {
    socket.emit("join", (history: ChatMessage[], onlineUsers: User[]) => {
      const groupedHistory = history.reduce((acc, msg) => {
        const otherUserId = msg.from === socket.id ? msg.to : msg.from;
        if (otherUserId) {
          if (!acc[otherUserId]) acc[otherUserId] = [];
          acc[otherUserId].push(msg);
        }
        return acc;
      }, {} as Record<string, ChatMessage[]>);

      Object.entries(groupedHistory).forEach(([userId, messages]) => {
        useChatStore.getState().setConversationHistory(userId, messages);
      });

      setOnlineUsers(onlineUsers || []);
    });
  };

  const receiveMessage = () => {
    socket.on(
      "chat",
      (message: {
        from: string;
        text: string;
        messageId: string;
        timestamp: Date;
      }) => {
        const newMessage: ChatMessage = {
          _id: message.messageId,
          from: message.from,
          text: message.text,
          timestamp: message.timestamp,
          status: "received",
        };
        addMessage(message.from, newMessage);
        socket.emit('delivered',{messageId: message.messageId, senderId: message.from})
      }
    );
  };

  const updatestatus = () => {
    socket.on(
      "message_status",
      (data: { messageId: string; status: string; userId: string }) => {
        updateMessageStatus(data.userId, data.messageId, data.status);
      }
    );
  };

  const sendMessage = (to: string, text: string) => {
    const tempMessageId = `temp-${Date.now()}`;

    const tempMessage: ChatMessage = {
      _id: tempMessageId,
      from: socket.id || "",
      to: to,
      text: text,
      timestamp: new Date(),
      status: "sending",
    };

    addMessage(to, tempMessage);

    socket.emit("chat", { to, text, tempId: tempMessageId });
  };

  const cleanup = () => {
    socket.off("chat");
    socket.off("status_update");
  };

  return { join, updatestatus, receiveMessage, sendMessage, cleanup };
};
