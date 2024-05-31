const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/routes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());

    app.use("/", routes);
    app.use("/", authRoutes);

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log("Here is the Error message:");
    console.log(error);
  }
};

main().catch((err) => {
  console.log("The server crashed with error: ");
  console.log(err);
});
