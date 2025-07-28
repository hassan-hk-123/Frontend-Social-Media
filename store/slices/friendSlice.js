import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchAllUsers = createAsyncThunk('friends/fetchAllUsers', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/all-users`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchRequests = createAsyncThunk('friends/fetchRequests', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/requests`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch requests');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchFriends = createAsyncThunk('friends/fetchFriends', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/friends`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch friends');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const sendFriendRequest = createAsyncThunk('friends/sendFriendRequest', async (to, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ to })
    });
    if (!res.ok) throw new Error('Failed to send request');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const respondToRequest = createAsyncThunk('friends/respondToRequest', async ({ requestId, action }, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ requestId, action })
    });
    if (!res.ok) throw new Error('Failed to respond to request');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const unfriendUser = createAsyncThunk('friends/unfriendUser', async (friendId, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/unfriend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ friendId })
    });
    if (!res.ok) throw new Error('Failed to unfriend user');
    return friendId;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchSentRequests = createAsyncThunk('friends/fetchSentRequests', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/requests/sent`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch sent requests');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const cancelFriendRequest = createAsyncThunk('friends/cancelFriendRequest', async (requestId, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/relationships/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ requestId })
    });
    if (!res.ok) throw new Error('Failed to cancel request');
    return requestId;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const friendSlice = createSlice({
  name: 'friends',
  initialState: {
    users: [],
    requests: [],
    sentRequests: [],
    friends: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeRequest: (state, action) => {
      state.requests = state.requests.filter(req => req._id !== action.payload);
    },
    addIncomingRequest: (state, action) => {
      if (!state.requests.some(req => req._id === action.payload._id)) {
        state.requests.unshift(action.payload);
      }
    },
    removeSentRequest: (state, action) => {
      state.sentRequests = state.sentRequests.filter(req => req.to._id !== action.payload);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllUsers.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchRequests.fulfilled, (state, action) => { state.requests = action.payload; })
      .addCase(fetchFriends.fulfilled, (state, action) => { state.friends = action.payload; })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.sentRequests.push(action.payload);
      })
      .addCase(respondToRequest.fulfilled, (state, action) => { /* Optionally update state */ })
      .addCase(unfriendUser.fulfilled, (state, action) => {
        state.friends = state.friends.filter(friend => friend._id !== action.payload);
      })
      .addCase(fetchSentRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.sentRequests = state.sentRequests.filter(req => req._id !== action.payload);
      });
  }
});

export const { removeRequest, addIncomingRequest, removeSentRequest } = friendSlice.actions;
export default friendSlice.reducer;