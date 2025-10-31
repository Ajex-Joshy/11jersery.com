import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../features/admin/auth/adminSlice.js";
import userAuthReducer from "../features/user/account/authSlice.js";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: userAuthReducer,
  },
});
