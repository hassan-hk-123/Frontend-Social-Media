import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk: fetch unread counts for all friends

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export const fetchUnreadCounts = createAsyncThunk(
  'chat/fetchUnreadCounts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/unread`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch unread counts');
      return data.unreadCounts; // Expecting { userId: count }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: fetch messages with a user
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const res = await fetch(`/api/messages/${userId}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch messages');
      
      // Get current user from auth state
      const state = getState();
      const currentUserId = state.auth.user?.userId;
      
      return { userId, messages: data.messages, currentUserId };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload, { rejectWithValue }) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send message');
      return data.message;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: mark messages as read
export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/messages/read/${userId}`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to mark as read');
      return userId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: edit a message
export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to edit message');
      }

      return data.message;
    } catch (err) {
      return rejectWithValue(err.message || 'Something went wrong');
    }
  }
);

// Async thunk: delete all messages
export const deleteAllMessages = createAsyncThunk(
  'chat/deleteAllMessages',
  async (userId, { rejectWithValue }) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/messages/clear/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to clear messages');
      return userId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    currentChatUser: null,
    messages: {},
    unread: {},
    typing: {},
    onlineUsers: [],
    loading: false,
    error: null,
    currentUserId: null, // Add current user ID to state
  },
  reducers: {
    setCurrentChatUser(state, action) {
      state.currentChatUser = action.payload;
    },
    setCurrentUserId(state, action) {
      state.currentUserId = action.payload;
    },
    addMessage(state, action) {
      const msg = action.payload;
      const currentUserId = state.currentUserId;
      
      // Determine the chat userId (the other person in conversation)
      const chatUserId = msg.from._id === currentUserId ? msg.to._id : msg.from._id;

      if (!state.messages[chatUserId]) {
        state.messages[chatUserId] = [];
      }

      // Check if message already exists (avoid duplicates)
      const existingMessage = state.messages[chatUserId].find(m => m._id === msg._id);
      if (!existingMessage) {
        state.messages[chatUserId].push(msg);
        
        // Only increment unread if message is from other person and not currently in that chat
        if (msg.from._id !== currentUserId && state.currentChatUser?._id !== msg.from._id) {
          state.unread[msg.from._id] = (state.unread[msg.from._id] || 0) + 1;
        }
      }
    },
    setMessages(state, action) {
      const { userId, messages } = action.payload;
      state.messages[userId] = messages;
      
      // Calculate unread count correctly - only messages from the other person that are not read
      const unreadCount = messages.filter(m => 
        m.from._id === userId && // Message is from the other person
        m.status !== 'read' // Message is not read
      ).length;
      
      state.unread[userId] = unreadCount;
    },
    setTyping(state, action) {
      const { userId, typing } = action.payload;
      state.typing[userId] = typing;
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = Array.isArray(action.payload) ? action.payload : [];
    },
    setUnreadCounts(state, action) {
      state.unread = action.payload || {};
    },
    clearUnread(state, action) {
      const userId = action.payload;
      state.unread[userId] = 0;
      
      // Also update message status to read in local state
      if (state.messages[userId]) {
        state.messages[userId].forEach(msg => {
          if (msg.from._id === userId && msg.status !== 'read') {
            msg.status = 'read';
          }
        });
      }
    },
    incrementUnread(state, action) {
      const userId = action.payload;
      // Only increment if not currently chatting with this user
      if (state.currentChatUser?._id !== userId) {
        state.unread[userId] = (state.unread[userId] || 0) + 1;
      }
    },
    updateMessageStatus(state, action) {
      const { messageId, status, userId } = action.payload;
      
      // Find message in all conversations
      Object.keys(state.messages).forEach(chatUserId => {
        const msg = state.messages[chatUserId].find(m => m._id === messageId);
        if (msg) {
          msg.status = status;
          
          // If marking as read, update unread count
          if (status === 'read' && msg.from._id !== state.currentUserId) {
            const currentUnread = state.unread[msg.from._id] || 0;
            state.unread[msg.from._id] = Math.max(0, currentUnread - 1);
          }
        }
      });
    },
    updateMessageContent(state, action) {
      const updated = action.payload;
      const currentUserId = state.currentUserId;
      const chatUserId = updated.from._id === currentUserId ? updated.to._id : updated.from._id;
      
      if (state.messages[chatUserId]) {
        const idx = state.messages[chatUserId].findIndex(m => m._id === updated._id);
        if (idx !== -1) state.messages[chatUserId][idx] = updated;
      }
    },
    removeMessage(state, action) {
      const { messageId, userId } = action.payload;
      if (userId && state.messages[userId]) {
        const messageToRemove = state.messages[userId].find(m => m._id === messageId);
        state.messages[userId] = state.messages[userId].filter(m => m._id !== messageId);
        
        // Update unread count if removing an unread message
        if (messageToRemove && messageToRemove.from._id === userId && messageToRemove.status !== 'read') {
          state.unread[userId] = Math.max(0, (state.unread[userId] || 0) - 1);
        }
      }
    },
    resetChat(state) {
      state.currentChatUser = null;
      state.messages = {};
      state.unread = {};
      state.typing = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.unread = action.payload || {};
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, messages, currentUserId } = action.payload;
        
        // Set current user ID if not already set
        if (!state.currentUserId && currentUserId) {
          state.currentUserId = currentUserId;
        }
        
        state.messages[userId] = messages;
        
        // Calculate unread count correctly
        const unreadCount = messages.filter(m => 
          m.from._id === userId && // Message is from the other person
          m.status !== 'read' // Message is not read
        ).length;
        
        state.unread[userId] = unreadCount;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const currentUserId = state.currentUserId;
        const chatUserId = msg.from._id === currentUserId ? msg.to._id : msg.from._id;
        
        if (!state.messages[chatUserId]) state.messages[chatUserId] = [];
        
        // Remove temp message and add real message
        if (msg.tempId) {
          state.messages[chatUserId] = state.messages[chatUserId].filter(m => m.tempId !== msg.tempId);
        }
        
        // Check if message already exists before adding
        if (!state.messages[chatUserId].some(m => m._id === msg._id)) {
          state.messages[chatUserId].push(msg);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const userId = action.payload;
        state.unread[userId] = 0;
        
        // Update all messages from this user to read status
        if (state.messages[userId]) {
          state.messages[userId].forEach(msg => {
            if (msg.from._id === userId && msg.status !== 'read') {
              msg.status = 'read';
            }
          });
        }
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const updated = action.payload;
        const currentUserId = state.currentUserId;
        const chatUserId = updated.from._id === currentUserId ? updated.to._id : updated.from._id;
        
        if (state.messages[chatUserId]) {
          const idx = state.messages[chatUserId].findIndex(m => m._id === updated._id);
          if (idx !== -1) state.messages[chatUserId][idx] = updated;
        }
      })
      .addCase(deleteAllMessages.fulfilled, (state, action) => {
        const userId = action.payload;
        state.messages[userId] = [];
        state.unread[userId] = 0;
      });
  },
});

export const {
  setCurrentChatUser,
  setCurrentUserId,
  addMessage,
  setMessages,
  setTyping,
  setOnlineUsers,
  setUnreadCounts,
  clearUnread,
  incrementUnread,
  updateMessageStatus,
  updateMessageContent,
  removeMessage,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;