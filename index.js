const app = require("./app");
const http = require("http");
const config = require("./utils/config");
const User = require("./models/user");

const server = http.createServer(app);
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

var sockets = {};
var lastReadSockets = {};
var onlineUsersId = {}; // 1 is true
const io = require("socket.io")(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("Websocket connected!, userID:", socket.id);
  socket.emit("newConnection");

  socket.on("disconnect", async () => {
    try {
      if (sockets[socket.id] !== undefined) {
        const id = sockets[socket.id];
        const targetUser = await User.findById(id);
        const lastOnline = Date.now();
        console.log("disconnection", targetUser, lastReadSockets[id]);

        const changedUser = {
          ...targetUser._doc,
          lastOnline,
          lastRead: lastReadSockets[id],
        };
        console.log("changedUser", changedUser);

        await User.findByIdAndUpdate(sockets[socket.id], changedUser);

        socket.broadcast.emit("offlineNotify", {
          userId: sockets[socket.id],
          lastOnline,
        });
        socket.broadcast.emit("typing", {
          type: "stop",
          id: sockets[socket.id],
          name: "",
        });

        delete lastReadSockets[id];
        delete onlineUsersId[id];
        delete sockets[socket.id];
      }
    } catch (err) {
      console.log(err);
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
    lastReadSockets[id] = {};
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

  socket.on("newConvoNotify", (data) => {
    const recipientId = data.recipientId;
    const convoId = data.convoId;
    const requesterId = data.requesterId;
    const requesterName = data.requesterName;
    const requesterImageUrl = data.requesterImageUrl;

    socket.to(recipientId).emit("newConvoNotify", {
      convoId,
      requesterId,
      requesterName,
      requesterImageUrl,
    });
  });

  socket.on("update", (data) => {
    const id = sockets[socket.id];
    lastReadSockets[id] = data;
  });
});
