import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Get all posts
export const getPosts = createAsyncThunk('posts/getPosts', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
      credentials: 'include', // ensure cookies/session are sent
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createPost = createAsyncThunk('posts/createPost', async (formData, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to create post');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const editPost = createAsyncThunk('posts/editPost', async ({ postId, caption, image }, thunkAPI) => {
  try {
    const formData = new FormData();
    if (caption !== undefined) formData.append('caption', caption);
    if (image) formData.append('image', image);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to edit post');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (postId, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete post');
    }
    const data = await res.json();
    return data.postId;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const getUserPosts = createAsyncThunk('posts/getUserPosts', async (userId, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user posts');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const likePost = createAsyncThunk('posts/likePost', async (postId, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to like post');
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const addComment = createAsyncThunk('posts/addComment', async ({ postId, comment, user }, thunkAPI) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comment`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    const newComment = await res.json();
    
    return { ...newComment, user: { _id: user.userId, username: user.username, avatarImg: user.avatarImg } };

  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Get posts
      .addCase(getPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit post
      .addCase(editPost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const idx = state.posts.findIndex(p => p._id === updatedPost._id);
        if (idx !== -1) {
          state.posts[idx] = updatedPost;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      // Get user posts
      .addCase(getUserPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        console.log('getUserPosts fulfilled:', action.payload); // Debug: check API response
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Like/unlike post
      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const idx = state.posts.findIndex(p => p._id === updatedPost._id);
        if (idx !== -1) {
          state.posts[idx] = updatedPost;
        }
      })
      // Add comment
      .addCase(addComment.pending, (state, action) => {
        const { postId, comment, user } = action.meta.arg;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          const newComment = {
            comment,
            user: {
              _id: user.userId,
              username: user.username,
              avatarImg: user.avatarImg
            },
            createdAt: new Date().toISOString()
          };
          post.comments.push(newComment);
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const idx = state.posts.findIndex(p => p._id === updatedPost._id);
        if (idx !== -1) {
          state.posts[idx] = updatedPost;
        }
      });
  }
});

export default postSlice.reducer; 