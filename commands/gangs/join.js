const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "join",
  category: "Gangs",
  description: "Join a gang!",
  usage: "<gang name>",
  cooldown: 5,
  execute(bot, message, args) {
    let gangName = args.join(" ");
    Guild.findOne({ guildID: message.guild.id }, (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err)
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        let gang = guild.gangs.get(gangName);
        if (!gang) return message.error("This gang does not exist!");
        let member = guild.members.get(message.author.id);
        if (member) {
          if (member.gang.name != "None") return message.error("You are already in a gang!");
        }
        member = {
          id: message.author.id,
          tag: message.author.tag,
          gang: {
            uuid: gang.uuid,
            name: gang.name,
            rank: "Member",
            joinDate: Date.now()
          }
        }
        guild.members.set(message.author.id, member);
        guild.save().then(() => message.success(`You successfully joined the **${gang.name}**!`)).catch(err => message.channel.send("An error occured: " + err));
      }
    });
  }
};
