
require("node:dns").setServers(["8.8.8.8"]);
require("dotenv").config();

const mongoose = require("mongoose");

async function testAtlas() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("Atlas connection successful!");
  } catch (error) {
    console.error("Atlas connection failed:");
    console.error(error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

testAtlas();
