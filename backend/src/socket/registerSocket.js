export const registerSocket = (io) => {
  io.on("connection", (socket) => {
    socket.emit("connected", { message: "Realtime market channel connected." });
  });
};
