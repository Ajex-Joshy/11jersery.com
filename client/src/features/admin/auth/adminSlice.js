import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance";

const storedAdmin = localStorage.getItem("admin");

const initialState = {
  admin: storedAdmin ? JSON.parse(storedAdmin) : null,
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
      return rejectWithValue(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Login failed"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("admin");
      localStorage.removeItem("token");
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
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("admin", JSON.stringify(action.payload.admin));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
