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
  return null;
};

messagesRouter.get("/", async (req, res) => {
  const messages = await Message.find({}).populate("user");
  return res.json(messages);
});

messagesRouter.get("/:id", async (req, res) => {
  const message = await Message.findById(req.params.id);
  return message ? res.json(message) : res.status(404).end();
});

messagesRouter.post("/", async (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({
      error: ">>> It looks like you are sending nothing. Content is required.",
    });
  }

  const token = extractToken(req);
  if (token === null) {
    return res.status(400).json({
      error: ">>> It looks like you somehow got here. Login is required.",
      name: "loginRequired",
    });
  }

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

    const returnedMessage = await Message.findById(savedMessage._id).populate(
      "user"
    );
    res.status(201).json(returnedMessage);
  } catch (err) {
    console.log(err);

    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        error:
          ">>> It looks like you have gone for a long time. Login is required.",
        name: "loginRequired",
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: ">>> It looks like there is something wrong. Login is required.",
        name: "loginRequired",
      });
    }
  }
});

module.exports = messagesRouter;
