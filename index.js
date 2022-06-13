const app = require("./app");
const http = require("http");
const config = require("./utils/config");
const { v4: uuidv4 } = require("uuid");
const webSocketServer = require("websocket").server;

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = {};
wsServer.on("request", (request) => {
  var userID = uuidv4();

  console.log(
    new Date().toLocaleTimeString() +
      " Received a new connection from origin " +
      request.origin
  );

  const connection = request.accept(null, request.origin);
  clients[userID] = connection;

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      console.log("Received Message: ", message.utf8Data);

      for (const key in clients) {
        clients[key].sendUTF(message.utf8Data);
        console.log("send Message to: ", clients[key]);
      }
    }
  });

  connection.on("close", () => {});
});
