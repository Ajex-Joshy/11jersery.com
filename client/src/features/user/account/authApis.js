import { da } from "zod/v4/locales";
import axiosInstance from "../../../api/axiosInstance";

export const loginUser = async (credentials) => {
  console.log(credentials);
  const { data } = await axiosInstance.post(`/auth/login`, credentials);
  return data;
};

export const signupUser = async (userData) => {
  const { data } = await axiosInstance.post(`/auth/signup`, userData);
  return data;
};

export const requestPasswordReset = async (email) => {
  const { data } = await axiosInstance.post(`/auth/forgot-password`, { email });
  return data;
};

export const resetPassword = async ({ token, password }) => {
  const { data } = await axiosInstance.post(`/auth/reset-password/${token}`, {
    password,
  });
  return data;
};
