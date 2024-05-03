const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authenticateToken = require("../utils/authenticateToken");

router.get("/users", authenticateToken, async (req, res) => {
  const usersCol = mongoose.connection.db.collection("users");
  const users = await usersCol.find({}).toArray();
  res.send(users.filter((user) => user.username === req.user.name));
});

module.exports = router;
