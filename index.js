const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");

const app = express();
const port = 3000;

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.use(express.json());

    app.use("/", routes);

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
