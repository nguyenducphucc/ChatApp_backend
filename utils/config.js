require("dotenv").config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;
const GIFAPIKEY = process.env.GIFAPIKEY;

module.exports = {
  PORT,
  MONGODB_URI,
  SECRET,
  GIFAPIKEY,
};
