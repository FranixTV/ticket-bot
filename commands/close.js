const Discord = require('discord.js');
const Ticket = require('../schemas/ticket.js');
const fs = require("fs");
const { JSDOM } = require("jsdom");
const dom = new JSDOM();
const document = dom.window.document;

module.exports = {
    name: 'close',
    description: 'Close a ticket',
    args: false,
    aliases: [],
    permissions: ["ADMINISTRATOR"],
    execute: async function (message, args, client) {
        
        if(message.channel.parent.name !== "tickets") return;
        await message.delete();

        // transcript here
        let logChannel = message.guild.channels.cache.get(client.config.transcriptChannel);
        if(logChannel) {
            let messageCollection = new Discord.Collection();
            let channelMessages = await message.channel.messages.fetch({
                limit: 100
            }).catch(err => console.log(err));

            messageCollection = messageCollection.concat(channelMessages);

            while(channelMessages.size === 100) {
                let lastMessageKey = channelMessages.lastKey();
                channelMessages = await message.channel.messages.fetch({
                    limit: 100,
                    before: lastMessageKey
                }).catch(err => console.log(err))

                if(channelMessages) {
                    messageCollection.concat(channelMessages); 
                }
            }

            let msgs = messageCollection.array().reverse();

            let style = fs.readFileSync("./assets/template.html", "utf-8")
            if (style) {
                await fs.writeFileSync('./assets/index.html', style)
                let guildElement = document.createElement("div");
                guildElement.className = "guild-container";
                let guildText = document.createTextNode(message.guild.name);
                let guildImg = document.createElement("img")
                guildImg.setAttribute('src', message.guild.iconURL());
                guildImg.setAttribute("width", "150");
                guildElement.appendChild(guildImg);
                guildElement.appendChild(guildText);

                await fs.appendFile("./assets/index.html", guildElement.outerHTML, (err) => {if(err) console.log(err)})

                msgs.forEach(async (msg) => {
                    let parentContainer = document.createElement("div");
                    parentContainer.className = "parent-container";

                    let avatarDiv = document.createElement("div");
                    avatarDiv.className = "avatar-container";
                    let img = document.createElement("img");
                    img.setAttribute("src", await msg.author.displayAvatarURL());
                    img.className = "avatar";
                    avatarDiv.appendChild(img);

                    parentContainer.appendChild(avatarDiv);

                    let messageContainer = document.createElement("div");
                    messageContainer.className = "message-container";

                    let nameElement = document.createElement("span");
                    nameElement.className = "name"
                    let name = document.createTextNode(msg.author.tag + " " + msg.createdAt.toDateString() + " " + msg.createdAt.toLocaleTimeString());
                    nameElement.appendChild(name);
                    messageContainer.append(nameElement);

                    if(msg.content.startsWith("```")) {
                        let m = message.content.replace(/```/g, "");
                        let codeNode = document.createElement("code");
                        let textNode = document.createTextNode(m);
                        codeNode.appendChild(textNode);
                        messageContainer.append(codeNode);
                    } else if(msg.embeds[0]) {
                        let msgEmbed = msg.embeds[0];
                        let embedNode = document.createElement("div");
                        embedNode.className = "embed";

                        let colorNode = document.createElement("div");
                        colorNode.className = "embed-color";
                        colorNode.style = `background-color: ${msgEmbed.hexColor}`;
                        embedNode.appendChild(colorNode);

                        let embedContent = document.createElement("div");
                        embedContent.className = "embed-content";

                        let titleNode = document.createElement("span");
                        titleNode.className = "embed-title";
                        titleNode.innerHTML = msgEmbed.title;
                        embedContent.appendChild(titleNode);

                        let descNode = document.createElement("span");
                        descNode.className = "embed-description";
                        descNode.innerHTML = msgEmbed.description;
                        embedContent.appendChild(descNode);

                        embedNode.appendChild(embedContent);
                        messageContainer.append(embedNode);
                    } else {
                        let msgNode = document.createElement("span");
                        let textNode = document.createTextNode(msg.content);
                        msgNode.appendChild(textNode);
                        messageContainer.append(msgNode);
                    }

                    parentContainer.appendChild(messageContainer);
                    fs.appendFile('./assets/index.html', parentContainer.outerHTML, (err) => {if(err) console.log(err)})
                });

                let ticketData = await Ticket.findOne({channelID: message.channel.id}, (err, res) => {
                    if(res) {
                        return res;
                    }
                    if(err) {
                        console.log(err);
                    }
                });

                let ticketMember = message.guild.members.resolve(ticketData.userID);

                let transcriptEmbed = new Discord.MessageEmbed()
                .setTitle("Transcript from ticket")
                .setColor(client.config.colors.main)
                .setDescription("Download the attached file and open it in your browser!")
                .addField("Ticket creator", ticketMember)
                .addField("Created Date", ticketData.creationDate)
                .addField("Closed Date", message.createdAt.toLocaleString("en-US"));

                logChannel.send(transcriptEmbed);
                logChannel.send("", {
                    files: [{attachment: './assets/index.html', name: "transcript.html"}]
                });
            }
        }

        await message.channel.delete();
        Ticket.findOneAndDelete({channelID: message.channel.id}, {}, (err, res) => {
            if(err) {
                console.log(err);
            }
        });
    }
}