const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

const rooms = {}; // Tracks players in each room

io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  socket.on("joinRoom", (roomId) => {
    console.log(`User joined room: ${roomId}`);
    socket.join(roomId);

    // Create new room or join existing one
    if (!rooms[roomId]) {
      rooms[roomId] = [socket.id];
      socket.emit("startGame", "white");
    } else if (rooms[roomId].length === 1) {
      rooms[roomId].push(socket.id);
      socket.emit("startGame", "black");
    } else {
      socket.emit("roomFull");
    }

    // When a player moves
    socket.on("move", (data) => {
      socket.to(roomId).emit("opponentMove", data.move);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected");
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
