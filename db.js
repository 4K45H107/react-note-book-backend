const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://fahad11ahmed11:McvRPS1epNkpEeW6@cluster0.khwqi.mongodb.net/";

const connectToMongo = async () => {
  await mongoose
    .connect(mongoURI)
    .then(() => console.log("Connected to Mongo Successfully"))
    .catch((err) => console.log(err));
};

module.exports = connectToMongo;
