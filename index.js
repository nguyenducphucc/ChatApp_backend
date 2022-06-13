const app = require("./app");
const http = require("http");
const config = require("./utils/config");
//const { WebSocketServer } = require("ws");
//const ws = require("ws");

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

// const wss = new WebSocketServer({
//   server,
// });

// wss.on("connection", (client) => {
//   console.log("New client connected!");

//   client.on("message", (msg) => {
//     console.log(`Message: ${msg}`);

//     for (const cli of wss.clients) {
//       if (cli.readyState === ws.OPEN) {
//         console.log("Send!");
//         cli.send(msg);
//       }
//     }
//   });

//   client.on("close", () => {
//     console.log("Client has disconnected");
//   });
// });
