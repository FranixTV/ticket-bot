/* IMPORT LIBRARIES */
const Discord = require("discord.js");
const mongoose = require("mongoose");
const yaml = require("yaml");
const fs = require("fs");
require("dotenv").config();

/* GETTING CONFIGS */
const { TOKEN, MONGODBURI } = process.env;
const config = fs.readFileSync("./config.yml", "utf-8");
const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
client.config = yaml.parse(config);

/* DB CONNECTION */
mongoose.connect(MONGODBURI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
const db = mongoose.connection;
db.on('error', (error) => console.log('ERROR CONNECTING TO DB'));
db.on('open', () => {
    console.log('Successfully connected to DB')
});

/* COMMANDS */
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
    console.log(`- Loaded command: '${file}'`);
}


/* EVENTS */
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith("js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(TOKEN);