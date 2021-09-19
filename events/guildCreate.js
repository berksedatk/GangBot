const { MessageEmbed } = require("discord.js");
const Guild = require("../schemas/guild.js");
const mongoose = require("mongoose");

module.exports = async (bot, guild) => {
    const serverEmbed = new MessageEmbed()
    .setAuthor(guild.owner.user.tag, guild.owner.user.avatarURL())
    .setTitle("New Server!")
    .setColor("GREEN")
    .setThumbnail(guild.iconURL())
    .setTimestamp()
    .setFooter(`New server count: ${bot.guilds.cache.size}`)
    .setDescription(`Server Name: **${guild.name}**(${guild.id}) \nMember Count: **${guild.members.cache.size}** members.`)
    bot.channels.cache.get("673869397277933653").send(serverEmbed);

    Guild.findOne({ guildID: guild.id }, (err, dbguild) => {
      if (err) return console.log(`New guild added but there was a error while adding to database: ${guild.name} -> ${err}`);
      if (dbguild) return;
      if (!dbguild) {
        let guildschema = new Guild({
          _id: mongoose.Types.ObjectId(),
          guildName: guild.name,
          guildID: guild.id,
          settings: {
            createGang: {
              allow: "everyone",
              roles: []
            },
            blacklist: {
              commands: [],
              channels: []
            }
          },
          globalGang: {
            active: false,
            gang: {
              name: guild.name,
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
        guildschema.save().then(() => console.log(`A new guild added: ${guild.name}`)).catch(err => console.log(`New guild added but there was a error while adding to database: ${guild.name} -> ${err}`))
      }
    })
}
