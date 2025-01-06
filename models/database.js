const mongoose = require("mongoose");

const databaseConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {});
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error("COULD NOT CONNECT TO DATABASE:", error.message);
  }
};

module.exports = {
  mongoose,
  databaseConnect,
};
