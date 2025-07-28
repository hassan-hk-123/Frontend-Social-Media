"use client"
import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useSearchParams, useRouter } from "next/navigation"
import { Input, List, Avatar, Badge, message, Dropdown, Modal } from "antd"
import { SendOutlined, EllipsisOutlined, SmileOutlined } from "@ant-design/icons"
import EmojiPicker from "emoji-picker-react"
import { useTheme } from "next-themes"

import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidenav"
import ProtectedRoute from "../../components/ProtectedRoute"
import socket from "../../store/socket"
import useChatSocket from "../../store/useChatSocket"
import { fetchFriends } from "../../store/slices/friendSlice"
import {
  fetchMessages,
  fetchUnreadCounts,
  sendMessage,
  markAsRead,
  setCurrentChatUser,
  clearUnread,
  addMessage,
  removeMessage,
  deleteAllMessages,
} from "../../store/slices/chatSlice"

import "./page.scss"

const MessageItem = ({ message, currentUser, isLastSent }) => {
  const isSent = message.from._id === currentUser.userId
  const statusIcon = {
    sent: "✓",
    delivered: "✓✓",
    read: <span style={{ color: "#53bdeb" }}>✓✓</span>,
  }

  return (
    <div className={`message-item ${isSent ? "sent" : "received"} ${message.tempId ? "sending" : ""}`}>
      <div className="message-content">
        {message.type === "image" ? (
          <img src={message.mediaUrl || "/placeholder.svg"} alt="sent media" className="message-image" />
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      <div className="message-meta">
        <span className="timestamp">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {isSent && <span className="status">{statusIcon[message.status] || "○"}</span>}
      </div>
      {isSent && isLastSent && (
        <div className="seen-indicator">
          {message.status === "read" ? "Seen" : message.status === "delivered" ? "Delivered" : "Sent"}
        </div>
      )}
    </div>
  )
}

const ChatPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()

  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const user = useSelector((state) => state.auth.user)
  const { friends, loading: friendsLoading } = useSelector((state) => state.friends)
  const { currentChatUser, messages, onlineUsers, typing, loading, unread } = useSelector((state) => state.chat)

  useChatSocket()

  useEffect(() => {
    if (user) {
      dispatch(fetchFriends())
      dispatch(fetchUnreadCounts())
    }
  }, [user, dispatch])

  useEffect(() => {
    const targetUserId = searchParams.get("user")
    if (targetUserId && friends.length > 0 && !friendsLoading) {
      const targetFriend = friends.find((f) => f._id === targetUserId)
      if (targetFriend && (!currentChatUser || currentChatUser._id !== targetUserId)) {
        handleSelectFriend(targetFriend)
      }
    }
  }, [friends, friendsLoading, searchParams, currentChatUser, dispatch])

  useEffect(() => {
    if (!currentChatUser || !user?.userId) return

    // Mark messages as read when viewing chat
    const chatMsgs = messages[currentChatUser._id] || []
    const unreadMessages = chatMsgs.filter((msg) => msg.from._id === currentChatUser._id && msg.status !== "read")

    if (unreadMessages.length > 0) {
      dispatch(markAsRead(currentChatUser._id))
      unreadMessages.forEach((msg) => {
        socket.emit("read_message", { messageId: msg._id, userId: user.userId })
      })
    }
  }, [currentChatUser, messages, user?.userId, dispatch])

  useEffect(() => {
    if (currentChatUser) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, currentChatUser])

  useEffect(() => {
    if (currentChatUser && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentChatUser])

  const handleSelectFriend = async (friend) => {
    if (!friend?._id) {
      console.error("Invalid friend object:", friend)
      return
    }

    dispatch(setCurrentChatUser(friend))

    try {
      await dispatch(fetchMessages(friend._id)).unwrap()
      dispatch(clearUnread(friend._id))
      router.push(`/chat?user=${friend._id}`, { scroll: false })
    } catch (err) {
      console.error("Failed to fetch messages:", err)
      message.error("Could not load chat. Please try again.")
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatUser) return

    const tempId = `temp-${Date.now()}`
    const optimisticMsg = {
      _id: tempId,
      from: { _id: user.userId, username: user.username, fullName: user.fullName },
      to: { _id: currentChatUser._id },
      content: newMessage,
      type: "text",
      createdAt: new Date().toISOString(),
      status: "sending",
      tempId,
    }

    dispatch(addMessage(optimisticMsg))
    setNewMessage("")
    setShowEmojiPicker(false)

    try {
      await dispatch(
        sendMessage({
          to: currentChatUser._id,
          content: newMessage,
          type: "text",
          tempId,
        }),
      ).unwrap()
    } catch (err) {
      message.error("Failed to send message: " + err.message)
      dispatch(removeMessage({ messageId: tempId, userId: currentChatUser._id }))
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (currentChatUser) {
      socket.emit("typing", {
        from: user.userId,
        to: currentChatUser._id,
        typing: e.target.value.length > 0,
      })
    }
  }

  const handleEmojiSelect = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji)
    if (currentChatUser) {
      socket.emit("typing", { from: user.userId, to: currentChatUser._id, typing: true })
    }
  }

  const handleChatMenuClick = ({ key }) => {
    if (key === "view") {
      router.push(`/profile/${currentChatUser._id}`)
    } else if (key === "clear") {
      setClearModalOpen(true)
    }
  }

  const confirmClearChat = async () => {
    try {
      await dispatch(deleteAllMessages(currentChatUser._id)).unwrap()
      message.success("Chat cleared")
    } catch (err) {
      message.error("Failed to clear chat: " + err.message)
    } finally {
      setClearModalOpen(false)
    }
  }

  const chatHeaderMenu = {
    items: [
      { key: "view", label: "View Profile" },
      { key: "clear", label: "Clear Chat" },
    ],
    onClick: handleChatMenuClick,
  }

  const chatMsgs = currentChatUser ? messages[currentChatUser._id] || [] : []
  const lastSentMsgId = (() => {
    const sentMsgs = chatMsgs.filter((m) => m.from._id === user.userId)
    return sentMsgs.length > 0 ? sentMsgs[sentMsgs.length - 1]._id : null
  })()

  const getUnreadCount = (friendId) => {
    return unread[friendId] || 0
  }

  const sortedFriends = [...friends].sort((a, b) => {
    const lastMsgA = messages[a._id]?.length > 0 ? messages[a._id][messages[a._id].length - 1] : null
    const lastMsgB = messages[b._id]?.length > 0 ? messages[b._id][messages[b._id].length - 1] : null

    if (!lastMsgA && !lastMsgB) return 0
    if (!lastMsgA) return 1
    if (!lastMsgB) return -1

    return new Date(lastMsgB.createdAt) - new Date(lastMsgA.createdAt)
  })

  const filteredFriends = searchQuery
    ? sortedFriends.filter(
        (friend) =>
          (friend.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (friend.username || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sortedFriends

  return (
    <ProtectedRoute>
      <div className={`chat-layout theme-${theme}`}>
        <Navbar />
        <div className="chat-container">
          <aside className="sidebar-container" style={{ width: "60px" }}>
            <Sidebar collapsed={true} />
          </aside>
          <div className="chat-main">
            <div className="friends-list-panel">
              <div className="header">
                <h3>Messages</h3>
                <Input.Search
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>
              <List
                dataSource={filteredFriends}
                renderItem={(friend) => (
                  <List.Item
                    onClick={() => handleSelectFriend(friend)}
                    className={`friend-item ${currentChatUser?._id === friend._id ? "selected" : ""}`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={getUnreadCount(friend._id)} size="small" offset={[-4, 32]}>
                          <Avatar src={friend.avatarImg} size={48} />
                        </Badge>
                      }
                      title={<div className="friend-name">{friend.fullName || friend.username || "User"}</div>}
                      description={
                        <div className="last-message">
                          {typing[friend._id]
                            ? "Typing..."
                            : messages[friend._id]?.at(-1)?.content || "No messages yet"}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>

            <div className="chat-content-panel">
              {currentChatUser ? (
                <>
                  <div className="chat-header">
                    <div
                      className="user-info"
                      onClick={() => router.push(`/profile/${currentChatUser._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Avatar src={currentChatUser.avatarImg} size={40} />
                      <div className="user-details">
                        <h3 className="friend-name">
                          {currentChatUser.fullName || currentChatUser.username || "User"}
                        </h3>
                        <span className="status-text">
                          {onlineUsers.includes(currentChatUser._id) ? "Active now" : "Offline"}
                          {typing[currentChatUser._id] && (
                            <span style={{ marginLeft: 8, color: "#53bdeb" }}> Typing...</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <Dropdown menu={chatHeaderMenu} trigger={["click"]}>
                      <EllipsisOutlined className="actions-icon" />
                    </Dropdown>
                  </div>

                  <Modal
                    open={clearModalOpen}
                    onCancel={() => setClearModalOpen(false)}
                    onOk={confirmClearChat}
                    okText="Clear Chat"
                    cancelText="Cancel"
                    title={`Clear chat with ${currentChatUser?.fullName || currentChatUser?.username || "User"}?`}
                  >
                    <p>Are you sure you want to clear this chat? This will only remove messages from your view.</p>
                  </Modal>

                  <div className="messages-area">
                    {chatMsgs.map((msg) => (
                      <MessageItem
                        key={msg._id}
                        message={msg}
                        currentUser={user}
                        isLastSent={msg._id === lastSentMsgId}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-area">
                    {showEmojiPicker && (
                      <div className="emoji-picker-wrapper">
                        <EmojiPicker onEmojiClick={handleEmojiSelect} theme={theme} />
                      </div>
                    )}
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={handleTyping}
                      onPressEnter={handleSendMessage}
                      placeholder="Type a message..."
                      className="message-input"
                      prefix={
                        <SmileOutlined className="input-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                      }
                      suffix={<SendOutlined className="input-icon send-icon" onClick={handleSendMessage} />}
                    />
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  <h3>Select a friend to start chatting</h3>
                  <p>Your conversations will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ChatPage
