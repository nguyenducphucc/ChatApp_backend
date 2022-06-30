const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  content: {
    type: String,
  },
  time: {
    type: Number,
    required: true,
  },
  imageMessages: [
    {
      url: {
        type: String,
      },
      imageName: {
        type: String,
      },
    },
  ],
  gifId: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

messageSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Message", messageSchema);
