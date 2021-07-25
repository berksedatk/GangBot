const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "leave",
  category: "Gangs",
  description: "Leave your gang!",
  usage: "<gang name>",
  cooldown: 5,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err)
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        let member = guild.members.get(message.author.id);
        if (member) {
          if (member.gang.joinDate + 1800000 > Date.now()) {
            return message.error("You're on cooldown to leave the gang!")
          }
          if (member.gang.rank == "Owner") {
            return message.error("You can't leave your own gang. If you wish to transfer your gang's ownership please use the `g?manage transferownership` command.");
          } else if (member.gang.rank == "Admin") {
            let msg = await message.channel.send(`You are a Admin on the **${gangName}**. Are you sure you want to leave your gang?(yes)`);
            msg.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time:60000, errors: ['time']}).then(c => {
              if (c.first().content.toLowerCase() != "yes") return message.error("Command cancelled.");
              if (!c.first()) return message.error("Command timed out.");
            });
          }

          let gangName = member.gang.name;
          member = {
            id: message.author.id,
            tag: message.author.tag,
            gang: {
              uuid: '',
              name: "None",
              rank: null,
              joinDate: null
            }
          }
          guild.members.set(message.author.id, member);
          guild.save().then(() => message.success(`You left the **${gangName}**.`)).catch(err => message.channel.send("An error occured: " + err));

        } else {
          return message.error("You are not in a gang!");
        }
      }
    });
  }
};
