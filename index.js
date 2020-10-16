//Database

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

//Discord
const Discord = require('discord.js');
const bot = new Client({
  disableMentions: "everyone",
  messageCacheMaxSize: 35,
  messageCacheLifetime: 30,
  messageSweepInterval: 60
}, {
  partials: ['MESSAGE', 'CHANNEL']
}, {
  ws: {
    intents: ['MESSAGE_CREATE']
  }
});

bot.commands = new Discord.Collection();
bot.events = new Discord.Collection();

["commands", "events"].forEach(handler => {
  require(`./util/handlers/${handler}`)(bot);
});

bot.login(process.env.BOT_TOKEN);
