module.exports = {
    name: 'help',
    description: 'Show help menu',
    args: false,
    aliases: ["menu"],
    permissions: [],
    execute: async function (message, args, client) {
        message.channel.send("Hello");
    }
}