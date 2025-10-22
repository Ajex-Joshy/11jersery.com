import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "../features/admin/authSlice.js";

const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
  },
  devTools: true,
});

export default store;
