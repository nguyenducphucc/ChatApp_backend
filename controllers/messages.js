const messagesRouter = require("express").Router();
const Message = require("../models/message");

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
  const newMessage = new Message({
    content: body.content,
    time: body.time,
  });

  const savedMessage = await newMessage.save();
  return res.status(201).json(savedMessage);
});

module.exports = messagesRouter;
