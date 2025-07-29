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
      dispatch(
        updateMessageStatus({
          messageId: data.messageId,
          status: "sent",
          userId: data.userId,
        }),
      )
    })

    socket.on("receive_message", (message) => {
      dispatch(addMessage(message))
      const fromId = message.from._id
      const currentChatId = currentChatUser?._id

      // Only increment unread if message is not from current user and not in active chat
      if (fromId !== user.userId) {
        if (fromId !== currentChatId) {
          dispatch(incrementUnread(fromId))
          notify.info({
            message: `New message from ${message.from.fullName || message.from.username}`,
            description: message.content,
            placement: "topRight",
          })
        } else {
          // If in active chat, mark as read immediately
          socket.emit("read_message", { messageId: message._id, userId: user.userId })
          dispatch(clearUnread(fromId))
        }
      }
    })

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
        notify.open({
          message: notification.message,
          description: `From: ${notification.from.fullName || notification.from.username}`,
          placement: "topRight",
        })
      }
    })

    // Refresh unread counts on reconnection
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
      dispatch(fetchUnreadCounts())
    })

    return () => {
      socket.off("online_users")
      socket.off("receive_message")
      socket.off("message_sent")
      socket.off("user_typing")
      socket.off("message_delivered")
      socket.off("message_read")
      socket.off("notification")
      socket.off("connect")
      socket.disconnect()
    }
  }, [user, dispatch, currentChatUser])

  return null
}

export default useChatSocket
