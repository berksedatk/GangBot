const Discord = require("discord.js");
const Guild = require("../schemas/guild.js");
const mongoose = require("mongoose");

module.exports = {
  name: "addguild",
  category: "Utility",
  description: "Adds a guild",
  dev: true,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, (err, dbguild) => {
      if (err) return console.log(`New guild added but there was a error while adding to database: ${message.guild.name} -> ${err}`);
      if (dbguild) return;
      if (!dbguild) {
        let guildschema = new Guild({
          _id: mongoose.Types.ObjectId(),
          guildName: message.guild.name,
          guildID: message.guild.id,
          settings: {
            createGang: {
              allow: "everyone",
              role: null,
              permission: null
            },
            blacklist: {
              enabled: false,
              channels: []
            }
          },
          globalGang: {
            active: false,
            gang: {
              name: message.guild.name,
              admins: {},
              members: {},
              color: "#999999",
              description: "Hello, this is my Global Gang!",
              gangPoints: 0,
              banner: null,
            }
          },
          gangs: {}
        });
        guildschema.save().then(() => message.channel.send(`A new guild added: ${message.guild.name}`)).catch(err => message.channel.send(`New guild added but there was a error while adding to database: ${message.guild.name} -> ${err}`))
      }
    })
  }
};
