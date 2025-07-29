"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import socket from "./socket"
import {
  addMessage,
  setOnlineUsers,
  setTyping,
  updateMessageStatus,
  incrementUnread,
  clearUnread,
  fetchUnreadCounts,
} from "./slices/chatSlice"
import { addNotification } from "./slices/notificationsSlice"
import { notify } from "../components/AppNotifications"

const useChatSocket = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const { currentChatUser } = useSelector((state) => state.chat)

  useEffect(() => {
    if (!user?.userId) return

    socket.connect()
    socket.emit("register", user.userId)

    socket.on("online_users", (userIds) => {
      dispatch(setOnlineUsers(userIds || []))
    })

    socket.on("message_sent", (data) => {
      if (data.messageId) {
        dispatch(updateMessageStatus({
          messageId: data.messageId,
          status: "sent",
          userId: data.userId,
        }));
      } else {
        dispatch(addMessage(data)); // Full message object
      }
    });

   socket.on("receive_message", (message) => {
  if (message.to._id === user.userId && message.from._id !== user.userId) { // Strict receiver check
    dispatch(addMessage(message));
    if (message.from._id !== currentChatUser?._id) {
      dispatch(incrementUnread(message.from._id));
      notify.info({
        message: `New message from ${message.from.fullName || message.from.username}`,
        description: message.content,
        placement: "topRight",
      });
    } else {
      socket.emit("read_message", { messageId: message._id, userId: user.userId });
      dispatch(clearUnread(message.from._id));
    }
  }
    });

    socket.on("user_typing", (data) => {
      dispatch(setTyping({ userId: data.from, typing: data.typing }))
    })

    socket.on("message_delivered", (data) => {
      dispatch(
        updateMessageStatus({
          messageId: data.messageId,
          status: "delivered",
          userId: data.userId,
        }),
      )
    })

    socket.on("message_read", (data) => {
      dispatch(
        updateMessageStatus({
          messageId: data.messageId,
          status: "read",
          userId: data.userId,
        }),
      )
      dispatch(clearUnread(data.userId))
    })

    socket.on("notification", (notification) => {
      if (notification.to === user.userId) {
        dispatch(addNotification(notification))
        
        // Show notification popup
        let message = notification.message;
        if (notification.type === 'post_like' || notification.type === 'post_comment') {
          message = `${notification.message} - View Post`;
        }
        
        notify.open({
          message: "Notification",
          description: message,
          placement: "topRight",
        })
      }
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
      dispatch(fetchUnreadCounts())
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    })

    return () => {
      socket.off("online_users")
      socket.off("receive_message")
      socket.off("message_sent")
      socket.off("user_typing")
      socket.off("message_delivered")
      socket.off("message_read")
      socket.off("notification") // ✅ ADDED: Clean up notification listener
      socket.off("connect")
      socket.off("connect_error") // ✅ ADDED: Clean up error listener
      socket.disconnect()
    }
  }, [user, dispatch, currentChatUser])

  return null
}

export default useChatSocket