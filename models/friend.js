const mongoose = require("mongoose");

const friendSchema = mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: Number,
    enum: [
      0, // add friend
      1, // requested
      2, // pending
      3, // friends
    ],
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
});

friendSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Friend", friendSchema);
