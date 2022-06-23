const app = require("./app");
const http = require("http");
const config = require("./utils/config");

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

var clientsCount = 0;
var user_name = "";
const io = require("socket.io")(server, { cors: { origin: "*" } });
io.of("/messages").on("connection", (socket) => {
  console.log("Websocket connected!, userID:", socket.id);

  socket.on("disconnect", () => {
    clientsCount--;
    socket.broadcast.emit("clientsCount", "off");
    socket.broadcast.emit("typing", { type: "stop", name: user_name });
  });

  socket.on("online", () => {
    clientsCount++;
    socket.emit("clientsCount", clientsCount);
    socket.broadcast.emit("clientsCount", "on");
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });

  socket.on("typing", (data) => {
    user_name = data.name;
    socket.broadcast.emit("typing", data);
  });
});
