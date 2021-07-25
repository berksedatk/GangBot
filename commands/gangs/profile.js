const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");
const find = require("../../utility/find.js");

module.exports = {
  name: "profile",
  category: "Gangs",
  description: "Get profile information about Gangs",
  usage: "[username/user ID/mention]",
  aliases: ["p"],
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err)
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        let user,member;
        if (args[0]) {
          user = await find.guildMember(bot, message, args.join(" "));
          if (!user) return message.error("You didnt provide a true member.", true, "<username/user ID/mention>");
          user = user.user
        } else {
          user = message.author
        }
        member = guild.members.get(user.id);

        if (!member) {
          member = {
            id: message.author.id,
            tag: message.author.tag,
            gang: {
              name: "None",
              uuid: "",
              rank: null,
              joinDate: null
            }
          }
          guild.markModified('members');
        }

        let gangName = member.gang.name;
        if (!guild.gangs.get(gangName) && gangName != 'None') {
          guild.gangs.forEach(g => {
            if (g.uuid === member.gang.uuid) member.gang.name = g.name;
          });
          guild.markModified('members');
        } else if (guild.gangs.get(gangName) && guild.gangs.get(gangName).uuid != member.gang.uuid) {
          member.gang = {
            name: "None",
            uuid: "",
            rank: null,
            joinDate: null
          }
          guild.markModified('members');
        }

        guild.save().catch(err => message.channel.send("An error occured: " + err));

        message.channel.send(new Discord.MessageEmbed()
        .setAuthor(user.tag, user.avatarURL())
        .setDescription(`:fleur_de_lis: **Gang Name**: ${member.gang.name}\n:clock10: **Join Date**: ${member.gang.joinDate ? new Date(member.gang.joinDate).toUTCString() : "-"}\n:star: **Gang Rank**: ${member.gang.rank ? member.gang.rank : "-"}`)
        .setColor("GOLD")
        .setTimestamp());
      }
    });
  }
};
