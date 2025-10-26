import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../features/admin/auth/adminSlice.js";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
  },
});
