export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
      socket.join(userData.id);
      socket.emit("connected");
    });
    socket.on("join_chat", (room) => {
      socket.join(room);
      console.log("user joined room", room);
    });
    socket.on("new_message", (newMessageRecived) => {
      const chat = newMessageRecived.chat;
      if (!chat.users) {
        console.log("chat.users is not defined");
      }
      chat.users.forEach((user) => {
        if (user._id === newMessageRecived.sender._id) {
          return;
        }
        socket.in(user._id).emit("message_recived", newMessageRecived);
      });
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing"));
    socket.off("setup", () => {
      socket.leave(userData.id);
      console.log("user disconnected");
    });
  });
};
