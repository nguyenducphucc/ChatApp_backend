const loginRouter = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../utils/config");

loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error:
        ">>> It looks like there is at least one part of missing information. Please fill out all needed info",
    });
  }

  const existingUser = await User.findOne({ username });
  const isPasswordCorrect =
    existingUser === null
      ? false
      : await bcrypt.compare(password, existingUser.passwordHash);

  if (!existingUser || !isPasswordCorrect) {
    return res.status(401).json({
      error: ">>> It looks like you have entered wrong username or password.",
    });
  }
  const userForToken = {
    username: existingUser.username,
    id: existingUser._id,
  };

  const token = jwt.sign(userForToken, config.SECRET, {
    expiresIn: 24 * 60 * 60,
  });

  return res.status(200).send({
    token,
    username: existingUser.username,
    name: existingUser.name,
    id: existingUser.id,
  });
});

module.exports = loginRouter;
