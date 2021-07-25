const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "leaderboard",
  category: "Gangs",
  description: "Leaderboard of gangs who has most of the members or gang points",
  aliases: ["lb"],
  usage: "[points/members]",
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err)
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {

        let top = [];
        guild.gangs.forEach(gang => {
          let members = 0;
          guild.members.forEach(m => {
            if (m.gang.uuid == gang.uuid) members++;
          });
          top.push({gang: gang, members: members, points: gang.points});
        });

        top.sort((a, b) => b.members - a.members);
        let count = top.length < 10 ? top.length : 10;

        let lb = [];
        for (let i = 0; i < count; i++) {
          lb.push(`${i == 0 ? ':crown:' : (i === 1 ? ':second_place:' : (i === 2 ? ':third_place:': `${i + 1}.`))} **${top[i].gang.name}** | Members: ${top[i].members}`)
        }

        const listEmbed = new Discord.MessageEmbed()
        .setTitle(`🏅 **${message.guild.name}**'s Gang Leaderboard 🏅`)
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setColor("GOLD")
        .setDescription(lb.length > 0 ? lb : "No Gangs.")
        message.channel.send(listEmbed)
      }
    })
  }
};
