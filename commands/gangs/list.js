const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "list",
  category: "Gangs",
  description: "Lists all the Gangs in the server",
  aliases: ["listgangs"],
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err)
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        let list = ""
        guild.gangs.forEach(gang => {
          list += `**- ${gang.name}** >> Owner <@${gang.owner.id}>\n`
        })

        const listEmbed = new Discord.MessageEmbed()
        .setTitle(`**${message.guild.name}**'s Gangs`)
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setColor("PURPLE")
        .setDescription(list.length > 0 ? list : "No Gangs")
        message.channel.send(listEmbed)
      }
    })
  }
};
