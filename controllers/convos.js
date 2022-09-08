// Between only 2 users
const convosRouter = require("express").Router();
const Convo = require("../models/convo");
const User = require("../models/user");

convosRouter.post("/", async (req, res) => {
  const { myId, friendId } = req.body;

  const me = await User.findById(myId);
  const friend = await User.findById(friendId);
  const createAt = Date.now();

  const newConvo = new Convo({
    createAt,
    lastRead: "",
    users: [me._id, friend._id],
  });

  // Create convo for two users
  const savedConvo = await newConvo.save();
  me.convos = me.convos.concat(savedConvo._id);
  await me.save();
  friend.convos = friend.convos.concat(savedConvo._id);
  await friend.save();

  const returnedConvo = {
    ...savedConvo._doc,
    me: {
      id: me.id,
      name: me.name,
      imageUrl: me.imageUrl,
    },
    friend: {
      name: friend.name,
      imageUrl: friend.imageUrl,
    },
  };
  res.status(201).json(returnedConvo);
});

module.exports = convosRouter;
