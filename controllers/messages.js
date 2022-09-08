/* eslint-disable indent */
const messagesRouter = require("express").Router();
const Message = require("../models/message");
const User = require("../models/user");
const Convo = require("../models/convo");
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
  const messages = await Message.find({})
    .limit(25)
    .sort({ _id: -1 })
    .populate("user", "id imageUrl name role username");
  return res.json(messages);
});

messagesRouter.get("/:activeConvoId/:targetMessageId", async (req, res) => {
  const activeConvoId = req.params.activeConvoId;
  const targetMessageId = req.params.targetMessageId;

  if (activeConvoId === "none") {
    const messages =
      targetMessageId === "none"
        ? await Message.find({ convo: { $exists: false } })
            .limit(25)
            .sort({ _id: -1 })
            .populate("user", "id imageUrl name role username")
        : await Message.find({
            convo: { $exists: false },
            _id: { $lt: targetMessageId },
          })
            .limit(25)
            .sort({ _id: -1 })
            .populate("user", "id imageUrl name role username");
    return messages ? res.json(messages) : res.status(404).end();
  }

  const messages =
    targetMessageId === "none"
      ? await Message.find({ convo: activeConvoId })
          .limit(25)
          .sort({ _id: -1 })
          .populate("user", "id imageUrl name role username")
      : await Message.find({
          convo: activeConvoId,
          _id: { $lt: targetMessageId },
        })
          .limit(25)
          .sort({ _id: -1 })
          .populate("user", "id imageUrl name role username");
  return messages ? res.json(messages) : res.status(404).end();
});

messagesRouter.post("/", async (req, res) => {
  const body = req.body;
  console.log(body);

  var noContent = !body.content;
  var noImage = !body.imageMessages;
  if (!noImage) noImage = body.imageMessages.length === 0;
  var noGif = !body.gifMessage;

  if (noContent && noImage && noGif) {
    return res.status(400).json({
      error: ">>> It looks like you are sending nothing. Content is required.",
    });
  }

  try {
    if (body.convoId !== "none") {
      const user = await User.findById(body.userId);
      const convo = await Convo.findById(body.convoId);

      const newMessage = new Message({
        ...body,
        user: user._id,
        convo: convo._id,
      });

      const savedMessage = await newMessage.save();

      convo.messages = convo.messages.concat(savedMessage._id);
      await convo.save();

      user.messages = user.messages.concat(savedMessage._id);
      await user.save();

      const returnedMessage = {
        ...savedMessage._doc,
        user: {
          id: user.id,
          imageUrl: user.imageUrl,
          name: user.name,
          role: user.role,
        },
        convo: convo.id,
      };
      return res.status(201).json(returnedMessage);
    }

    const user = await User.findById(body.userId);
    const newMessage = new Message({
      ...body,
      user: user._id,
    });

    const savedMessage = await newMessage.save();
    user.messages = user.messages.concat(savedMessage._id);
    await user.save();

    const returnedMessage = {
      ...savedMessage._doc,
      user: {
        id: user.id,
        imageUrl: user.imageUrl,
        name: user.name,
        role: user.role,
      },
    };
    return res.status(201).json(returnedMessage);
  } catch (err) {
    console.log(err);
    res.status(401).json({
      error: ">>> It looks like there is an error that we don't expect.",
    });
  }
});

messagesRouter.post("/verify", async (req, res) => {
  const token = extractToken(req);
  if (token === null) {
    return res.status(400).json({
      error: ">>> It looks like you somehow got here. Login is required.",
      name: "loginRequired",
    });
  }

  try {
    const decodedToken = jwt.verify(token, config.SECRET);
    res.status(200).json({ id: decodedToken.id });
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
