const express = require("express");
const authRouter = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("../utils/generateAccessToken");
const router = require("./routes");

authRouter.post("/signIn", async (req, res) => {
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
      const user = { name: req.body.username };

      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "24h",
      });

      const refreshTokensCol = mongoose.connection.db.collection("sessions");

      await refreshTokensCol
        .find({
          owner: user.name,
        })
        .toArray()
        .then((refreshTokensArr) => {
          if (refreshTokensArr.length)
            refreshTokensCol.deleteMany({ owner: user.name });
        });

      refreshTokensCol.insertOne({ t: refreshToken, owner: user.name });

      res.status(200).json({ accessToken, refreshToken });
    } else {
      return res.status(400).send("Incorrect user or password");
    }
  } catch {
    return res.status(500).send();
  }
});

authRouter.post("/signUp", async (req, res) => {
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

authRouter.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken === null) return res.sendStatus(401);

  const refreshTokensCol = mongoose.connection.db.collection("sessions");

  const refreshTokensArr = await refreshTokensCol
    .find({
      t: refreshToken,
    })
    .toArray();

  if (!refreshTokensArr.length) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    return res.json({ accessToken });
  });
});

authRouter.delete("/logout", async (req, res) => {
  const refreshTokensCol = mongoose.connection.db.collection("sessions");

  await refreshTokensCol
    .findOne({
      t: req.body.token,
    })
    .then((refreshToken) => {
      if (refreshToken) refreshTokensCol.deleteOne({ t: req.body.token });
    })
    .then(() => {
      res.sendStatus(204);
    });
});

module.exports = authRouter;
