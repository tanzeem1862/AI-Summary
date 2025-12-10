import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import summaryReducer from './slices/summarySlice';
import historyReducer from './slices/historySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    summary: summaryReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});