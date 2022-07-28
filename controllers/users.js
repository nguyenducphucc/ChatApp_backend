const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({
      error:
        ">>> It looks like there is at least one part of missing information. Please fill out all needed info!",
    });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({
      error:
        ">>> It looks like that username has been taken. Please choose different username.",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    username,
    name,
    passwordHash,
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/fest-d765b.appspot.com/o/avatar%2FUnknown_person.jpg?alt=media&token=6ea47852-5ae3-4860-8db2-71c1c2a79bbb",
  });

  const savedUser = await newUser.save();
  res.status(201).json(savedUser);
});

usersRouter.get("/:id", async (req, res) => {
  const targetUser = await User.findById(req.params.id).populate({
    path: "friends",
    select: "recipient status time",
    populate: {
      path: "recipient",
      select: "imageUrl name",
    },
  });
  return res.status(200).json(targetUser);
});

usersRouter.put("/avatar/:id", async (req, res) => {
  const imageUrl = req.body.imageUrl;

  const targetUser = await User.findById(req.params.id);
  const changedUser = {
    ...targetUser._doc,
    imageUrl: imageUrl,
  };

  const returnedUser = await User.findByIdAndUpdate(
    req.params.id,
    changedUser,
    { new: true }
  );

  res.json(returnedUser);
});

module.exports = usersRouter;
