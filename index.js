const app = require("./app");
const http = require("http");
const config = require("./utils/config");

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

const io = require("socket.io")(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("Websocket connected!, userID: " + socket.id);

  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});
