const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const config = require("./utils/config");
const middleware = require("./utils/middleware");
const messagesRouter = require("./controllers/messages");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const gifRouter = require("./controllers/gif");
const friendsRouter = require("./controllers/friends");
const convosRouter = require("./controllers/convos");

console.log("Connecting to MongoDB...");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err.message));

const app = express();
app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/messages", messagesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/gif", gifRouter);
app.use("/api/friends", friendsRouter);
app.use("/api/convos", convosRouter);

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/build/index.html");
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
