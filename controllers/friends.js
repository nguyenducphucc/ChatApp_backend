const friendsRouter = require("express").Router();
const User = require("../models/user");
const Friend = require("../models/friend");

// --------- POST -------------
friendsRouter.post("/add", async (req, res) => {
  const { requesterId, recipientId, time } = req.body;

  if (!requesterId || !recipientId || !time) {
    return res.status(400).json({
      error:
        ">>> It looks like there is something happened in friendRouterPost",
    });
  }

  const requesterUser = await User.findById(requesterId);
  const recipientUser = await User.findById(recipientId);

  // Document is for return message
  const returnedData = {
    recipient: {
      id: recipientUser.id,
      name: recipientUser.name,
      imageUrl: recipientUser.imageUrl,
    },
    status: 1,
    time,
  };

  // Document is for requester to keep
  const requesterRelationship = new Friend({
    requester: requesterUser._id,
    recipient: recipientUser._id,
    status: 1,
    time,
  });
  const savedRequesterRelationship = await requesterRelationship.save();
  requesterUser.friends = requesterUser.friends.concat(
    savedRequesterRelationship._id
  );
  await requesterUser.save();

  // Document is for recipient to keep
  const recipientRelationship = new Friend({
    requester: recipientUser._id,
    recipient: requesterUser._id,
    status: 2,
    time,
  });
  const savedRecipientRelationship = await recipientRelationship.save();
  recipientUser.friends = recipientUser.friends.concat(
    savedRecipientRelationship._id
  );
  await recipientUser.save();

  res.status(200).json(returnedData);
});

// ------------- DELETE ----------------
friendsRouter.delete("/cancel", async (req, res) => {
  const { requesterId, recipientId } = req.body;
  console.log(requesterId, recipientId);
  if (!requesterId || !recipientId) {
    return res.status(400).json({
      error:
        ">>> It looks like there is something happened in friendRouterDelete",
    });
  }

  // Destroy relationship of requester to recipient
  const requesterUser = await User.findById(requesterId);
  const requesterReceipt = await Friend.findOneAndRemove({
    requester: requesterId,
    recipient: recipientId,
  });
  const targetIdReq = requesterReceipt._id.toString();
  requesterUser.friends = requesterUser.friends.filter(
    (objId) => objId.toString() !== targetIdReq
  );
  await requesterUser.save();

  // Destroy relationship of recipient to requester
  const recipientUser = await User.findById(recipientId);
  const recipientReceipt = await Friend.findOneAndRemove({
    requester: recipientId,
    recipient: requesterId,
  });
  const targetIdRec = recipientReceipt._id.toString();
  recipientUser.friends = recipientUser.friends.filter(
    (objId) => objId.toString() !== targetIdRec
  );
  await recipientUser.save();

  res.status(204).end();
});

// ---------------- PUT -------------------
friendsRouter.put("/create", async (req, res) => {
  const { requesterId, recipientId, time } = req.body;

  if (!requesterId || !recipientId || !time) {
    return res.status(400).json({
      error: ">>> It looks like there is something happened in friendRouterPut",
    });
  }

  // Create relationship for both requester and recipient documents
  await Friend.findOneAndUpdate(
    {
      requester: requesterId,
      recipient: recipientId,
    },
    { status: 3, time }
  );

  await Friend.findOneAndUpdate(
    {
      requester: recipientId,
      recipient: requesterId,
    },
    { status: 3, time }
  );

  return res.status(204).end();
});

module.exports = friendsRouter;
