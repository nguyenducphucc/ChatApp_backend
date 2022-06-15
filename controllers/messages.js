const messagesRouter = require("express").Router();
const Message = require("../models/message");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const extractToken = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
};

messagesRouter.get("/", async (req, res) => {
  const messages = await Message.find({});
  return res.json(messages);
});

messagesRouter.get("/:id", async (req, res) => {
  const message = await Message.findById(req.params.id);
  return message ? res.json(message) : res.status(404).end();
});

messagesRouter.post("/", async (req, res) => {
  const body = req.body;
  const token = extractToken(req);
  try {
    const decodedToken = jwt.verify(token, config.SECRET);
    const user = await User.findById(decodedToken.id);

    const newMessage = new Message({
      content: body.content,
      time: body.time,
      user: user._id,
    });

    const savedMessage = await newMessage.save();
    user.messages = user.messages.concat(savedMessage._id);
    await user.save();

    res.status(201).json(savedMessage);
  } catch (err) {
    console.log(err);

    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token has expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "invalid token" });
    }
  }
});

module.exports = messagesRouter;
