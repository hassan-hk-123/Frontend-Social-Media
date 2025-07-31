"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { debounce } from 'lodash'
import socket from "./socket"
import {
  addMessage,
  setOnlineUsers,
  setTyping,
  updateMessageStatus,
  incrementUnread,
  clearUnread,
  fetchUnreadCounts,
  fetchMessages,
} from "./slices/chatSlice"
import { addNotification } from "./slices/notificationsSlice"
import { notify } from "../components/AppNotifications"

const useChatSocket = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const { currentChatUser } = useSelector((state) => state.chat)

  const debouncedFetchUnreadCounts = debounce(() => dispatch(fetchUnreadCounts()), 1000);

  useEffect(() => {
    if (!user?.userId) return;

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("register", user.userId);

    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat", { userId: user.userId });
      }
    }, 30000);

    const pollMessages = () => {
      if (!socket.connected && currentChatUser) {
        dispatch(fetchMessages(currentChatUser._id));
      }
    };
    const pollInterval = setInterval(pollMessages, 10000);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      debouncedFetchUnreadCounts();
      if (currentChatUser) {
        dispatch(fetchMessages(currentChatUser._id));
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket Connect Error:", error.message);
      notify.error({ message: "Connection lost, trying to reconnect..." });
    });

    socket.on("reconnect", (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      debouncedFetchUnreadCounts();
    });

    socket.on("online_users", (userIds) => {
      dispatch(setOnlineUsers(userIds || []));
    });

    socket.on("message_sent", (data) => {
      dispatch(
        updateMessageStatus({
          messageId: data.messageId,
          status: "sent",
          userId: data.userId,
        })
      );
    });

 socket.on("receive_message", (message) => {
  dispatch(addMessage(message));
  const fromId = message.from._id;
  const currentChatId = currentChatUser?._id;

  if (fromId !== user.userId && currentChatId && fromId === currentChatId) {
    socket.emit("read_message", {
      messageId: message._id,
      readerId: user.userId,
      senderId: fromId
    });
    dispatch(clearUnread(fromId));
  } else if (fromId !== user.userId) {
    dispatch(incrementUnread(fromId));
    notify.info({
      message: `New message from ${message.from.fullName || message.from.username}`,
      description: message.content,
      placement: "topRight",
    });
  }
});

    socket.on("user_typing", (data) => {
      dispatch(setTyping({ userId: data.from, typing: data.typing }));
    });

    socket.on("message_delivered", (data) => {
      dispatch(
        updateMessageStatus({
          messageId: data.messageId,
          status: "delivered",
          userId: data.userId,
        })
      );
    });

    // `message_read` event handler ko update kiya gaya
socket.on("message_read", (data) => {
  dispatch(
    updateMessageStatus({
      messageId: data.messageId,
      status: "read",
      userId: data.chatPartnerId,
    })
  );
  if (data.readerId === user.userId) {
    dispatch(clearUnread(data.senderId));
  }
});

    socket.on("notification", (notification) => {
      if (notification.to === user.userId) {
        dispatch(addNotification(notification));
        notify.open({
          message: notification.message,
          description: `From: ${notification.from.fullName || notification.from.username}`,
          placement: "topRight",
        });
      }
    });

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("user_typing");
      socket.off("message_delivered");
      socket.off("message_read");
      socket.off("notification");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("reconnect");
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [user, dispatch, currentChatUser]);

  return null;
};

export default useChatSocket;
