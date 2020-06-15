const Discord = require("discord.js");

function prettyString(string) {
 return string.replace(/_/g, " ").replace(/guild/gi, "Server").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

module.exports = {
  name: "create",
  category: "Local Gang",
  description: "Creates a local gang on your server.",
  aliases: ["new"],
  usage: "[user] <gang name>",
  cooldown: 5,
  async execute(bot, message, args) {
    
  }
};
