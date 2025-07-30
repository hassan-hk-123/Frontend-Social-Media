import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
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
    markNotificationsRead(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    markAllRead(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
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
      });
  },
});

export const { addNotification, markNotificationsRead, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;