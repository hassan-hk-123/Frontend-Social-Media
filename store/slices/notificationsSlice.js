import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark specific notifications as read
export const markNotificationsRead = createAsyncThunk(
  'notifications/markNotificationsRead',
  async (notificationIds, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationIds }),
      });
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      const data = await response.json();
      console.log('Notifications marked as read on server:', data);
      return notificationIds;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark all notifications as read
export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      const data = await response.json();
      console.log('All notifications marked as read on server:', data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addNotification(state, action) {
      const notification = action.payload;
      // Deduplicate by _id or unique fields
      const exists = state.items.some(
        (n) =>
          n._id === notification._id ||
          (n.type === notification.type &&
           n.postId === notification.postId &&
           n.from?._id === notification.from?._id &&
           n.createdAt === notification.createdAt)
      );
      if (!exists) {
        state.items.push({ ...notification, read: false });
        console.log('Added notification:', notification);
      } else {
        console.log('Duplicate notification ignored:', notification);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Replace, don’t append
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        const notificationIds = action.payload;
        state.items.forEach((n) => {
          if (notificationIds.includes(n._id)) {
            n.read = true;
          }
        });
        console.log('Notifications marked as read in state:', notificationIds);
      })
      .addCase(markNotificationsRead.rejected, (state, action) => {
        state.error = action.payload;
        console.log('Failed to mark notifications as read:', action.payload);
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
        console.log('All notifications marked as read in state');
      })
      .addCase(markAllRead.rejected, (state, action) => {
        state.error = action.payload;
        console.log('Failed to mark all notifications as read:', action.payload);
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;