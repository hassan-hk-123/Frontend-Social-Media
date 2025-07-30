import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch notifications from the server
export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// Mark all notifications as read
export const markNotificationsRead = createAsyncThunk('notifications/markNotificationsRead', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift({ ...action.payload, read: false, id: Date.now() });
    },
    clearNotifications: (state) => {
      state.items = [];
    },
    markAllRead: (state) => {
      state.items.forEach(n => (n.read = true));
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map(n => ({ ...n, id: n._id }));
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.items.forEach(n => (n.read = true));
      });
  }
});

export const { addNotification, clearNotifications, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;