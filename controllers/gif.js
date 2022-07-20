const { GIFAPIKEY } = require("../utils/config");

const gifRouter = require("express").Router();

gifRouter.get("/", (req, res) => {
  return res.json(GIFAPIKEY);
});

module.exports = gifRouter;
