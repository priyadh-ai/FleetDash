const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // Join a room for targeted notifications
    socket.on("join", (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });

  // Pass io to telemetry worker
  const { setIO } = require("../workers/telemetryWorker");
  setIO(io);
}

function sendUpdate(vehicle) {
  if (io) {
    io.emit("vehicleUpdate", vehicle);
  }
}

module.exports = {
  initSocket,
  sendUpdate
};
