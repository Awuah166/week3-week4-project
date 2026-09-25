const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB || "movies",
    });

    console.log("Connected to MongoDB");
}

module.exports = connectDB;