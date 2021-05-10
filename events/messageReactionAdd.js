const serverConfig = require('../schemas/serverConfig.js');
const Ticket = require('../schemas/ticket.js');
const Discord = require('discord.js');

module.exports = {
    name: "messageReactionAdd",
    once: false,
    execute: async function(reaction, user, client) {
        if (user.bot) return;
        const message = reaction.message;
        const guild = message.guild;
        serverConfig.findOne({guildID: guild.id}, async (err, res) => {
            if(res) {
                if(message.id === res.ticketMessageID) {
                    reaction.users.remove(user);
                    if(reaction.emoji.name === '✅') {
                        let category = guild.channels.resolve(res.ticketCategoryID);
                        if(!category || category.children.size >= 50) {
                            category = await message.guild.channels.create('tickets', {
                                type: 'category',
                                permissionOverwrites: [
                                    {
                                        id: message.guild.id,
                                        deny: ['VIEW_CHANNEL']
                                    }
                                ]
                            });

                            serverConfig.findOneAndUpdate({guildID: guild.id}, {ticketCategoryID: category.id}, {}, (err, res) => {
                                if(err) console.log(err);
                            })
                        }
                        const ticketChannel = await guild.channels.create(`ticket-${user.username}`, {
                            type: 'text',
                            parent: category,
                            permissionOverwrites: [
                                {
                                    id: user.id,
                                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "ADD_REACTIONS", "READ_MESSAGE_HISTORY"]
                                },
                                {
                                    id: guild.id,
                                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                                }
                            ]
                        });

                        let embed = new Discord.MessageEmbed()
                        .setTitle('Ticket created')
                        .setDescription('Simple ticket here with a lot of text, maybe it should take its time and break to a different level you dumb twat')
                        .setColor(client.config.colors.main);

                        await ticketChannel.send(embed);

                        let date = new Date();

                        const ticket = new Ticket({
                            userID: user.id,
                            channelID: ticketChannel.id,
                            creationDate: date.toLocaleString("en-US")
                        });

                        ticket.save()
                        .catch(err => console.log(err));
                    }
                }
            }
        });
    }
}