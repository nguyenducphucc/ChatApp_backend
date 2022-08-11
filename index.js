const app = require("./app");
const http = require("http");
const config = require("./utils/config");
const User = require("./models/user");

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

var user_name = "";
var sockets = {};
var onlineUsersId = {}; // 1 is true
const io = require("socket.io")(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("Websocket connected!, userID:", socket.id);
  socket.emit("newConnection");

  socket.on("disconnect", async () => {
    if (sockets[socket.id] !== undefined) {
      const targetUser = await User.findById(sockets[socket.id]);
      const lastOnline = Date.now();

      const changedUser = {
        ...targetUser._doc,
        lastOnline,
      };
      await User.findByIdAndUpdate(sockets[socket.id], changedUser);

      socket.broadcast.emit("offlineNotify", {
        userId: sockets[socket.id],
        lastOnline,
      });
      socket.broadcast.emit("typing", {
        type: "stop",
        id: sockets[socket.id],
        name: user_name,
      });
      delete onlineUsersId[sockets[socket.id]];
      delete sockets[socket.id];
    }
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("initRoom", (id) => {
    socket.join(id);
    sockets[socket.id] = id;
    onlineUsersId[id] = 1;
  });

  socket.on("initFriendOnline", (friendList) => {
    for (const recipientId in friendList) {
      if (onlineUsersId[recipientId] === undefined) {
        delete friendList[recipientId];
      } else {
        socket.to(recipientId).emit("friendOnlineNotify", {
          requesterId: sockets[socket.id],
        });
      }
    }

    socket.emit("friendOnlineReturn", friendList);
  });

  socket.on("friendRelationship", (data) => {
    const type = data.type;
    const recipientId = data.recipientId;
    const requesterId = data.requesterId;
    const requester = data.requester;
    const status = data.status;
    const time = data.time;
    socket.to(recipientId).emit("friendRelationship", {
      type,
      requester,
      requesterId,
      status,
      time,
    });
  });
});
