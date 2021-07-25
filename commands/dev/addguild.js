const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");

module.exports = {
  name: "addguild",
  category: "Dev",
  description: "Adds a guild to the database",
  dev: true,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, (err, dbguild) => {
      if (err) return console.log(`New guild added but there was a error while adding to database: ${message.guild.name} -> ${err}`);
      if (dbguild) return;
      if (!dbguild) {
        let guildschema = new Guild({
          guildName: message.guild.name,
          guildID: message.guild.id,
          gangs: new Map(),
          members: new Map(),
          settings: {
            create: {
              allow: "everyone",
              role: null
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
          }
        });

        guildschema.save().then(() => message.channel.send(`<:tick:724048990626381925> | Guild has been added: ${message.guild.name}`)).catch(err => message.channel.send(`New guild added but there was a error while adding to database: ${message.guild.name} -> ${err}`))
      }
    })
  }
};
