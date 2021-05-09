const { Schema, model } = require("mongoose");

const ticketSchema = new Schema({
    userID: String,
    channelID: String,
    creationDate: String
});

module.exports = model("Ticket", ticketSchema);