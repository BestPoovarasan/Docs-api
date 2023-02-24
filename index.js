const express = require("express");
const app = express();
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const router = require("./routes/user_routes");
const cookieParser = require("cookie-parser")
const cors = require("cors");
require("dotenv").config();

// middleware------------------>
app.use(cors({credentials: true, origin:"*"}));
app.use(cookieParser());
app.use(express.json()); // this is middleware
app.use("/api", router); // this routes

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
  });


app.listen(process.env.PORT || 3001);