const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/routes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());

    app.use("/", routes);
    app.use("/", authRoutes);

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main().catch((err) => {
  console.log("The server crashed with error: ");
  console.log(err);
});
