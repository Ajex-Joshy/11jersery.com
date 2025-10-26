import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

const initialState = {
  admin: null,
  token: null,
  status: "idle",
  error: null,
};

export const loginAdmin = createAsyncThunk(
  "admin/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/auth/login", loginData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data.error);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.admin = action.payload.admin;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message || "Login failed";
      });
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
