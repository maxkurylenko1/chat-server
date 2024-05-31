const express = require("express");
const authRouter = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const dayjs = require("dayjs");
const cryptor = require("../utils/cryptor");

const cookiesConfig = {
  httpOnly: true,
  expires: dayjs().add(7, "d").toDate(),
  secure: true,
  sameSite: "lax",
};

//Log in route
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
      const userInfo = { name: req.body.username, id: user._id };

      const accessToken = generateToken(
        userInfo,
        process.env.ACCESS_TOKEN_SECRET,
        "1m"
      );
      const refreshToken = generateToken(
        userInfo,
        process.env.REFRESH_TOKEN_SECRET,
        "24h"
      );

      const refreshTokensCol = mongoose.connection.db.collection("sessions");

      await refreshTokensCol
        .find({
          owner: userInfo.name,
        })
        .toArray()
        .then((refreshTokensArr) => {
          if (refreshTokensArr.length)
            refreshTokensCol.deleteMany({ owner: userInfo.name });
        });

      refreshTokensCol.insertOne({ t: refreshToken, owner: userInfo.name });

      const encodedRefreshToken = cryptor.encrypt(
        refreshToken,
        process.env.COOKIES_SECRET
      );

      return res
        .cookie(
          "secureCookie",
          JSON.stringify({
            rToken: encodedRefreshToken,
          }),
          cookiesConfig
        )
        .json({ accessToken })
        .status(200);
    } else {
      return res.status(400).send("Incorrect user or password");
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

//Registration route

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
    console.log(error);
    return res.sendStatus(500);
  }
});

// Refresh token route

authRouter.post("/token", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies) return res.sendStatus(401);

    if (dayjs().isAfter(cookies.Expires)) return res.sendStatus(403);

    const { rToken } = JSON.parse(cookies.secureCookie);
    if (!rToken) return res.sendStatus(401);

    const decodedRefreshToken = cryptor.decrypt(
      rToken,
      process.env.COOKIES_SECRET
    );

    const refreshTokensCol = mongoose.connection.db.collection("sessions");

    const refreshTokensArr = await refreshTokensCol
      .find({
        t: decodedRefreshToken,
      })
      .toArray();

    if (!refreshTokensArr.length) {
      return res.sendStatus(403);
    }

    jwt.verify(
      decodedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateToken(
          { name: user.name },
          process.env.ACCESS_TOKEN_SECRET,
          "1m"
        );
        return res.json({ accessToken }).status(200);
      }
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

//Log out route

authRouter.delete("/logout", async (req, res) => {
  const refreshTokensCol = mongoose.connection.db.collection("sessions");

  const cookies = req.cookies;
  const { rToken } = JSON.parse(cookies.secureCookie);

  const decodedRefreshToken = cryptor.decrypt(
    rToken,
    process.env.COOKIES_SECRET
  );

  await refreshTokensCol
    .findOne({
      t: decodedRefreshToken,
    })
    .then((refreshToken) => {
      if (refreshToken) refreshTokensCol.deleteOne({ t: refreshToken.t });
    })
    .then(() => {
      res.status(204).send("Logged out successfully");
    });
});

module.exports = authRouter;
