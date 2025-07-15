
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    let room = rooms[roomId] || [];
    if (room.length >= 2) return;
    socket.join(roomId);
    room.push(socket);
    rooms[roomId] = room;

    let color = room.length === 1 ? "white" : "black";
    socket.emit("startGame", color);

    if (room.length === 2) {
      console.log(`Room ${roomId} is full`);
    }

    socket.on("move", (data) => {
      socket.to(roomId).emit("opponentMove", data.move);
    });

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter(s => s !== socket);
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
