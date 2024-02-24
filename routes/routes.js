const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// TODO check auth
// router.get("/", (req, res) => {

// })

router.get("/users", async (req, res) => {
  const usersCol = mongoose.connection.db.collection("users");
  const users = await usersCol.find({}).toArray();
  res.send(users);
});

router.post("/signIn", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("Wrong credentials");
  }
  try {
    const usersCol = mongoose.connection.db.collection("users");
    const user = await usersCol.findOne({ username: req.body.username });
    if (user === null) {
      return res.status(400).send("Incorrect user or password");
    }

    if (await bcrypt.compare(req.body.password, user.password)) {
      return res.status(200).send("Success");
    } else {
      return res.status(400).send("Incorrect user or password");
    }
  } catch {
    return res.status(500).send();
  }
});

router.post("/signUp", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(401).send("Wrong credentials");
    }

    const usersCol = mongoose.connection.db.collection("users");

    if ((await usersCol.findOne({ username: req.body.username })) !== null) {
      return res.status(401).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = { username: req.body.username, password: hashedPassword };

    usersCol
      .insertOne(user)
      .then(() => {
        res.status(201).send("User created");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Here is an error when creating a user");
      });
  } catch (error) {
    return res.status(500).send(`${error}`);
  }
});

module.exports = router;
