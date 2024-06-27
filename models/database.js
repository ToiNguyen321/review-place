const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:Admin1234@reviewplace.8wt01m7.mongodb.net/?retryWrites=true&w=majority&appName=ReviewPlace', {});
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error('COULD NOT CONNECT TO DATABASE:', error.message);
  }
};