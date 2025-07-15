
let board = null;
let game = new Chess();
let socket = io();
let roomId = '';
let playerColor = 'white';

function joinRoom() {
  roomId = document.getElementById('roomId').value.trim();
  if (roomId === '') return alert("Enter a room ID");
  socket.emit("joinRoom", roomId);
  document.getElementById('room').innerText = "Joined Room: " + roomId;
}

function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false;
  if ((playerColor === 'white' && piece.search(/^b/) !== -1) ||
      (playerColor === 'black' && piece.search(/^w/) !== -1)) return false;
}

function onDrop(source, target) {
  let move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';
  socket.emit("move", { roomId, move });
}

function onSnapEnd() {
  board.position(game.fen());
}

socket.on("startGame", (color) => {
  playerColor = color;
  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    orientation: color,
    onDragStart,
    onDrop,
    onSnapEnd
  });
});

socket.on("opponentMove", (move) => {
  game.move(move);
  board.position(game.fen());
});
