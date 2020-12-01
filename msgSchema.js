const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  timestamp: String,
  received: Boolean,
});

const Message = new mongoose.model("messages", messageSchema);
module.exports = Message;
