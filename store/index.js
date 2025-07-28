import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import friendReducer from './slices/friendSlice';
import notificationsReducer from './slices/notificationsSlice';
import chatReducer from './slices/chatSlice';



export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    friends: friendReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});