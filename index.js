//Firebase
var admin = require("firebase-admin");

const serviceAccount = require("./.data/key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://memebot-9ac4e.firebaseio.com"
});

const db = admin.firestore();

//Discord
const Discord = require('discord.js');
const bot = new Discord.Client({ disableMentions: "everyone" });

bot.commands = new Discord.Collection();
bot.events = new Discord.Collection();

["commands", "events"].forEach(handler => {
  require(`./util/handlers/${handler}`)(bot, db);
});

bot.login(process.env.BOT_TOKEN);
