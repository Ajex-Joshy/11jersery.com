import { io } from "socket.io-client";
import { env } from "../utils/env";

const socketUrl = env.VITE_BASE_URL;

export const socket = io("http://localhost:3000", {
  autoConnect: false,
  withCredentials: true,
});
