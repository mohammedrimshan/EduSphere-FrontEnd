import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from "./Slices/userSlice"; 
import themeReducer from './Slices/themeSlice';
import tutorReducer from './Slices/tutorSlice';
import sidebarReducer from './Slices/sidebarSlice';
import adminReducer from './Slices/adminSlice'
import categoryReducer from './Slices/categorySlice'
import courseReducer from './Slices/courseSlice';
import cartReducer from './Slices/cartSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['items']
};

const persistedCartReducer = persistReducer(persistConfig, cartReducer);

const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    tutor: tutorReducer,
    sidebar: sidebarReducer,
    admin: adminReducer,
    category: categoryReducer,
    course: courseReducer,
    cart: persistedCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);

export default store;