import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});
socket.on("connect_error", (error) => {
  console.error("Socket Connect Error:", error.message);
});

export default socket;