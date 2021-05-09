module.exports = {
    name: "ready",
    once: true,
    execute: async function(client) {
        console.log(`${client.user.tag} is now ready!`);
    }
}