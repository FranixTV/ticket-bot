const Discord = require('discord.js');

module.exports = {
    name: "message",
    execute: async function(message, client) {
        const prefix = client.config.prefix;

        if(message.author.bot || !message.content.startsWith(prefix) || message.channel.type === "dm") return;

        const args = message.content.slice(prefix.length).trim().split(' ');
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if(!command) return;

        if(command.permissions.length) {
            let hasPermission = false;
            for(permission of command.permissions) {
                if(message.member.hasPermission(permission)) {
                    hasPermission = true;
                    break;
                }
            }
            if(!hasPermission) return;
        }

        if(command.args && !args.length) {
            let embed = new Discord.MessageEmbed()
            .setTitle("Error!")
            .setDescription(`Wrong command usage!\nCorrect usage: \`${prefix}${commandName} ${command.usage}\``)
            .setColor(client.config.colors.main)
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL());

            return message.channel.send(embed);
        }

        try {
            command.execute(message, args, client);
        } catch (error) {
            console.log(error);
            message.reply("an error occured!");
        }
    }
}