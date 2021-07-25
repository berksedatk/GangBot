const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");
const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: "info",
  category: "Gangs",
  description: "Lists the information about a Gang.",
  aliases: ["i"],
  usage: "<gang name>",
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    let gangName = args.join(" ");
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err);
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        let gang = guild.gangs.get(gangName);
        if (!gang) return message.error("This gang doesn't exists. Please use `g?list` command to list all the gangs.");
        let memberCount = 0;
        let adminList = [];
        guild.members.forEach(m => {
          if (m.gang.name == gangName) {
            if (m.gang.rank == "Member") {memberCount++;}
            else if (m.gang.rank == "Admin") adminList.push(`<@${a.id}>`)
          }
        });
        if (!gang.uuid) gang.uuid = uuidv4();
        guild.markModified(`gangs`);
        guild.save()
        let owner = await message.guild.members.fetch(gang.owner.id);
        let gangEmbed = new Discord.MessageEmbed()
        .setTitle(gang.name)
        .setDescription(gang.description)
        .setColor(gang.color)
        .setAuthor(owner ? owner.user.tag : gang.owner.tag, owner ? owner.user.avatarURL() : gang.owner.avatarURL)
        .addField("Admins", adminList.join(", ").length > 0 ? adminList.join(", ") : "No Admins", true)
        .addField("Role", gang.role != "" ? `<@&${gang.role}>` : "No Gang Role")
        .addField(":busts_in_silhouette: Members", memberCount + adminList.length + 1, true)
        .addField(":military_medal: Gang Points", `${gang.points} points`, true)
        .setFooter(`UUID: ${gang.uuid}\nCreated at: ${new Date(gang.createdAt).toUTCString()}`)
        gang.banner =! null ? gangEmbed.setImage(gang.banner) : null
        message.channel.send(gangEmbed);
      }
    });
  }
};
