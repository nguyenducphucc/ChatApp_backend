const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const config = require("./utils/config");
const messagesRouter = require("./controllers/messages");

console.log("Connecting to MongoDB...");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err.message));

const app = express();
app.use(cors());
app.use(express.static("build"));
app.use(express.json());

app.use("/api/messages", messagesRouter);

module.exports = app;
