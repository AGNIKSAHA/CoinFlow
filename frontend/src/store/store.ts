import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/api';
import transactionUiReducer from './slices/transactionUiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    transactionUi: transactionUiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
