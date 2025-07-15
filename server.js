const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    socket.roomId = roomId;

    if (!rooms[roomId]) {
      rooms[roomId] = [socket.id];
      socket.emit("startGame", "white");
    } else if (rooms[roomId].length === 1) {
      rooms[roomId].push(socket.id);
      socket.emit("startGame", "black");
    } else {
      socket.emit("roomFull");
    }
  });

  socket.on("move", (data) => {
    const roomId = socket.roomId;
    if (roomId) {
      socket.to(roomId).emit("opponentMove", data);
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;
    console.log("🔴 Client disconnected");
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
