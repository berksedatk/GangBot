const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "setcreator",
  category: "Gangs",
  description: "Sets the Gang creator's usability.",
  aliases: ["setperms"],
  usage: "<everyone/roles/owner> [roles(mention/id)]",
  cooldown: 5,
  reqPermissions: ['ADMINISTRATOR'],
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err);
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        if (!args[0]) return message.error("You didn't provide a option to set as usability.", true, `<everyone/roles/owner>`);
        switch (args[0].toLowerCase()) {
          case "everyone":
          guild.settings.create.allow = 'everyone';
          guild.save().then(() => message.success("Gang creator usability is successfull set for everyone to use.")).catch(err => console.log('An error occured: ' + err));
            break;
          case "owner":
          guild.settings.create.allow = 'owner';
          guild.save().then(() => message.success("Gang creator usability is successfull set for only owner of this server to use.")).catch(err => console.log('An error occured: ' + err));
            break;
          case "roles":
          if (!args[1]) return message.error("You didn't mention or provide any roles required to be able to use gang creator.");
          if (message.mentions.roles.size = 0) return message.error("You didn't mention or provide any roles required to be able to use gang creator.");
          guild.settings.create.allow = 'roles';
          let roles = []
          message.mentions.roles.forEach(r => roles.push(r.id));
          guild.settings.create.roles = roles
          guild.save().then(() => message.success("Gang creator usability is successfull set for the roles you provided to use.")).catch(err => console.log('An error occured: ' + err));
            break;
          default:
            return message.error("You didn't provide a option to set as usability.", true, `<everyone/roles/owner>`);
            break;
        }
      }
    });
  }
};
