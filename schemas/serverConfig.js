const { Schema, model } = require("mongoose");

const serverConfigSchema = new Schema({
    guildID: String,
    ticketMessageID: String,
    ticketCategoryID: String
});

module.exports = model("serverConfig", serverConfigSchema);