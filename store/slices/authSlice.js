import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Async thunks
const signup = createAsyncThunk(
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

const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google-login`, { idToken }, { withCredentials: true });
      const { userId, userName, role, user } = response.data;
      
      // Extract token from response headers or data
      const token = response.config.headers['Authorization']?.split(' ')[1] || response.data.token;
      
      // Return user data with all necessary fields including token
      return {
        token,
        userId: user._id,
        userName: user.fullName,
        username: user.username,
        email: user.email,
        avatarImg: user.avatarImg,
        provider: user.provider,
        isVerified: user.isVerified,
        role: 'user'
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

const facebookLogin = createAsyncThunk(
  'auth/facebookLogin',
  async (accessToken, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/facebook-login`, { accessToken }, { withCredentials: true });
      const { userId, userName, role, user } = response.data;
      
      // Extract token from response headers or data
      const token = response.config.headers['Authorization']?.split(' ')[1] || response.data.token;
      
      // Return user data with all necessary fields including token
      return {
        token,
        userId: user._id,
        userName: user.fullName,
        username: user.username,
        email: user.email,
        avatarImg: user.avatarImg,
        provider: user.provider,
        isVerified: user.isVerified,
        role: 'user'
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Facebook login failed');
    }
  }
);

const signin = createAsyncThunk(
  'auth/signin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signin`, credentials, { withCredentials: true });
      const { userId, userName, role } = response.data;
      const token = response.config.headers['Authorization']?.split(' ')[1] || response.data.token;
      const profileRes = await axios.get(`${API_URL}/api/auth/profile/${userId}`, { withCredentials: true });
      const userProfile = profileRes.data;
      return { ...userProfile, token, userId, role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const verifyEmail = createAsyncThunk(
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

const forgotPassword = createAsyncThunk(
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

const resetPassword = createAsyncThunk(
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

const getProfile = createAsyncThunk(
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

const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
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

const changePassword = createAsyncThunk(
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

const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post(`${API_URL}/api/auth/upload-avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

const uploadCover = createAsyncThunk(
  'auth/uploadCover',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const res = await axios.post(`${API_URL}/api/auth/upload-cover`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

const checkUsername = createAsyncThunk(
  'auth/checkUsername',
  async (username, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-username/${username}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Username check failed');
    }
  }
);

const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const initialState = {
  token: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.token : null,
  isAuthenticated: !!(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.token : null),
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
  viewedProfile: null,
  viewedProfileLoading: false,
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
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(facebookLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(facebookLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(facebookLogin.rejected, (state, action) => {
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
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
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
        state.viewedProfileLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.viewedProfileLoading = false;
        if (state.user?.userId === action.payload._id) {
          state.user = { ...action.payload, token: state.user.token, userId: state.user.userId };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
        state.viewedProfile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.viewedProfileLoading = false;
        state.error = action.payload;
        state.viewedProfile = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
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
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.viewedProfile = null;
        localStorage.removeItem('user');
        // Clear cookies
        if (typeof window !== 'undefined') {
          document.cookie.split(";").forEach(c => {
            document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          });
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuth, logout, clearError, clearMessage } = authSlice.actions;
export { googleLogin, facebookLogin, signin, signup, verifyEmail, forgotPassword, resetPassword, getProfile, updateProfile, changePassword, uploadAvatar, uploadCover, checkUsername, logoutUser };
export default authSlice.reducer;