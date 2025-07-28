import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API_URL:', API_URL);

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const signin = createAsyncThunk(
  'auth/signin',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signin`, credentials, { withCredentials: true });
      const { token, userId, userName } = response.data;
      let role = 'user';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role || 'user';
      } catch (e) {}
      // Fetch full user profile after login
      const profileRes = await axios.get(`${API_URL}/api/auth/profile/${userId}`, { withCredentials: true });
      const userProfile = profileRes.data;
      return { ...userProfile, token, userId, role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const checkToken = createAsyncThunk(
  'auth/checkToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-token`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token check failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify`, { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, { token, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Reset failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/auth/profile/${profileData.id}`,
        {
          fullName: profileData.fullName,
          username: profileData.username,
          bio: profileData.bio,
          avatarImg: profileData.avatarImg,
          coverImg: profileData.coverImg,
          age: profileData.age,
          address: profileData.address,
          country: profileData.country,
          study: profileData.study,
          dob: profileData.dob,
        },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// Change password thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ id, currentPassword, newPassword, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/auth/change-password/${id}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post(`${API_URL}/api/auth/upload-avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url; // Cloudinary URL
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const uploadCover = createAsyncThunk(
  'auth/uploadCover',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const res = await axios.post(`${API_URL}/api/auth/upload-cover`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url; // Cloudinary URL
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        document.cookie.split(";").forEach(c => {
          document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      }
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);



const initialState = {
  token: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.token : null,
  isAuthenticated: !!(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.token : null),
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
  viewedProfile: null, // <-- ADD
  viewedProfileLoading: false, // <-- ADD
  loading: false,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('user');
      
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(signin.fulfilled, (state, action) => {
  state.loading = false;
  state.user = action.payload;
  state.isAuthenticated = true;
  // Cookie se token check
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    state.token = token;
    localStorage.setItem('user', JSON.stringify({ ...action.payload, token }));
  }
})
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       .addCase(checkToken.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(checkToken.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = action.payload.valid; // `check-token` ka response
    })
    .addCase(checkToken.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    })

      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.pending, (state) => {
        state.viewedProfileLoading = true; // <-- CHANGE
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.viewedProfileLoading = false; // <-- CHANGE
        // If the fetched profile is the logged-in user's, update the main user object too
        if (state.user?.userId === action.payload._id) {
            state.user = { ...action.payload, token: state.user.token, userId: state.user.userId };
            localStorage.setItem('user', JSON.stringify(state.user));
        }
        state.viewedProfile = action.payload; // <-- SET viewedProfile
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.viewedProfileLoading = false; // <-- CHANGE
        state.error = action.payload;
        state.viewedProfile = null; // <-- CLEAR viewedProfile
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Update both user and viewedProfile if they are the same person
        if (state.user?.userId === action.payload.user._id) {
            state.user = { ...action.payload.user, token: state.user.token, userId: state.user.userId };
             localStorage.setItem('user', JSON.stringify(state.user));
        }
        if (state.viewedProfile?._id === action.payload.user._id) {
            state.viewedProfile = action.payload.user;
        }
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuth, logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;