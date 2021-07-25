const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "invite",
  description: "Invite the bot to your server or join the support server!",
  execute(bot, message, args) {
    const inviteEmbed = new MessageEmbed()
    .setDescription(`To invite ${bot.user.username} to your server click [here](https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot). \n\nJoin the support server Sax's Bot Dump by clicking [here](https://gladiatorbot.ga/support)`)
    .setColor("GOLD")
    .setThumbnail(bot.user.avatarURL())
    .setFooter(`${bot.user.username} by Sax#6211`)
    .setTimestamp()
    message.channel.send(inviteEmbed)
  }
};
