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
  }
}
