import { io } from "socket.io-client";
import { env } from "../utils/env";

const socketUrl = env.VITE_SOCKET_URL;

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
});
