import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk for login
export const adminLogin = createAsyncThunk(
  "admin/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/auth/login",
        credentials
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data.error || error.message);
    }
  }
);

const initialState = {
  admin: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.admin = action.payload.admin;
        localStorage.setItem("adminToken", action.payload.token);
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
