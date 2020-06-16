const Guild = require("../schemas/guild.js");

module.exports = {
  async execute(bot, guild) {
    const serverEmbed = new Discord.MessageEmbed()
    .setAuthor(guild.owner.user.tag, guild.owner.user.avatarURL())
    .setTitle("New Server!")
    .setColor("GREEN")
    .setThumbnail(guild.iconURL())
    .setTimestamp()
    .setFooter(`New server count: ${bot.guilds.cache.size}`)
    .setDescription(`Server Name: **${guild.name}**(${guild.id}) \nMember Count: **${guild.members.cache.size}** members.`)
    bot.channels.cache.get("673869397277933653").send(serverEmbed);

    Guild.findOne({ guildID: message.guild.id }, (err, guild) => {
      if (err) return console.log(`New guild added but there was a error while adding to database: ${guild.name} -> ${err}`);
      if (guild) return;
      if (!guild) {
        let guild = new Guild({
          _id: mongoose.Types.ObjectId(),
          guildName: guild.name,
          guildID: guild.id,
          settings: {
            createGang: {
              type: "everyone",
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
        guild.save().then(() => console.log(`A new guild added: ${guild.name}`)).catch(err => message.chanel.send(`New guild added but there was a error while adding to database: ${guild.name} -> ${err}`))
      }
    })
  }
}
