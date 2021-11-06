const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "remove",
  category: "Gangs",
  description: "Removes the gang you own or a spesific gang.",
  usage: "<gang name>",
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      let user = guild.members.get(message.author.id)
      let gang = guild.gangs.get(user.gang.name)
      if (!user) {
          user = {
            id: message.author.id,
            tag: message.author.tag,
            gang: {
              uuid: '',
              name: "None",
              rank: null,
              joinDate: null
            }
          }
          gang = { name: null }
          guild.members.set(message.author.id, user);
          guild.save()
          if (message.guild.ownerID != message.author.id) return message.error("You dont own a Gang!");
      }
      
      if (args[0]) {
        if (message.guild.ownerID != message.author.id && !message.member.permissions.has("ADMINISTRATOR") && user.gang.rank != "Owner") return message.error("You do not have permission to remove gangs. Only Administrators, Server Owner or Gang Owners can remove gangs.");
        gang = guild.gangs.get(args.join(" "));
        if (!gang) return message.error("This gang does not exist! Use the `g?list` command to see all gangs.");
        if (message.author.id != gang.owner.id) return message.error("You are not the owner of this gang.")
      } else {
        if (user.gang.rank != "Owner") return message.error("You cannot remove a gang, you must be a Owner of the gang or a Server Admin to do it so.");
      }

      let confirm = await message.channel.send(`<:warning:724052384031965284> | Do you really wish to remove the **${gang.name}** gang? (yes/no)`);
      confirm.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 60000, errors: ['time']}).then(c => {
        if (c.first().content.toLowerCase() == "yes" || c.first().content.toLowerCase() == "y") {
          member = {
            id: gang.owner.id,
            tag: gang.owner.tag,
            gang: {
              uuid: '',
              name: "None",
              rank: null,
              joinDate: null
            }
          }
          guild.members.set(gang.owner.id, member);
          guild.gangs.set(gang.name, undefined);
          guild.save().then(async () => await message.success("The gang has been removed successfully.")).catch(err => message.channel.send("An error occured: " + err));
        } else {
          return message.error("Command cancelled.");
        }
      });
    });
  }
};
