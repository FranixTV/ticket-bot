/* IMPORT LIBRARIES */
const Discord = require("discord.js");
const mongoose = require("mongoose");
const yaml = require("yaml");
const fs = require("fs");
require("dotenv").config();

/* GETTING CONFIG AND TOKEN */
const { TOKEN } = process.env;
const config = fs.readFileSync("./config.yml", "utf-8");
const client = new Discord.Client();
client.config = yaml.parse(config);

/* COMMAND HANDLER BEGINNING */
client.commands = new Discord.Collection();
console.log("Begin loading commands.");
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
    console.log(`Loaded command: '${file}'`);
}
console.log("Ended loading commands.\n")
/* COMMAND HANDLER END */


/* EVENTS */
client.on("ready", () => {
    console.log(`${client.user.tag} is now ready!`);
});

client.on("message", async (message) => {
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
})

client.login(TOKEN);