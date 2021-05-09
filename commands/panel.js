const { MessageEmbed } = require("discord.js");
const serverConfig = require('../schemas/serverConfig.js');

module.exports = {
    name: 'panel',
    description: 'Create ticket panel',
    args: false,
    aliases: [],
    permissions: ["ADMINISTRATOR"],
    execute: async function (message, args, client) {
        
        message.delete();
        const embed = new MessageEmbed()
        .setTitle("Ticket Creation!")
        .setDescription("React with :white_check_mark: to this message to open a ticket!")
        .setColor(client.config.colors.main);

        let embedMsg = await message.channel.send(embed);
        embedMsg.react('✅');

        let category = message.guild.channels.cache.find(c => c.name === "tickets");
        if(!category) {
            category = await message.guild.channels.create('tickets', {
                type: 'category',
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL']
                    }
                ]
            });
        }

        serverConfig.findOne({guildID: message.guild.id}, async (err, res) => {
            if(res) {
                serverConfig.findOneAndUpdate({guildID: message.guild.id}, {ticketMessageID: embedMsg.id, ticketCategoryID: category.id}, {}, (err, res) => {
                    if(err) {
                        console.log(err);
                    }
                })
            } else {
                const config = new serverConfig({
                    guildID: message.guild.id,
                    ticketMessageID: embedMsg.id,
                    ticketCategoryID: category.id,
                    ticketCount: 0
                });
        
                config.save()
                .catch(err => console.log(err))
            }
        });
    }
}