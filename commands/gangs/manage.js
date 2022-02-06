const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");
const w3color = require("../../utility/w3color.js");

var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);

module.exports = {
  name: "manage",
  category: "Gangs",
  description: "Manages the Gang you own or moderate.",
  aliases: ["m"],
  usage: "<name/description/color/banner/setadmin/removeadmin/kick/transferownership>",
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    let gangName = args.join(" ");
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.channel.send("An error occured: " + err);
      if (!guild) return message.channel.send("Database does not exist! Please contract a dev.");
      if (guild) {
        let user = guild.members.get(message.author.id)
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
          guild.members.set(message.author.id, user);
          guild.save()
          return message.error("You dont own or moderate a Gang!");
        } else if (user.gang.rank != "Owner" && user.gang.rank != "Admin") {
          return message.error("You can't manage the Gang you're in or you're not in a Gang!");
        } else {
          if (!args[0]) return message.error("You didn't provide a true option. `name, description, color, flag, setadmin, setgangrole, removeadmin, kick, transferownership`")
          if (!guild.gangs.get(user.gang.name) && user.gang.name != 'None') {
            guild.gangs.forEach(g => {
              if (g.uuid === user.gang.uuid) user.gang.name = g.name;
            });
            guild.markModified('members');
          }
          let gang = guild.gangs.get(user.gang.name);
          let admins = []
          switch (args[0].toLowerCase()) {
            case "name":
              if (!args[1]) return message.error("The gang name should be between 0 and 32 characters.\nWarning, this is capital sensitive.");
              if (args[1] == gang.name) return message.error("This is the same name as the old one! Try a new one.")
              if (args[1].length > 32 || args[1].length < 3 || args[1].includes('\n')) return message.error("The gang name should be between 0 and 32 characters and should not include new lines.\nWarning, this is capital sensitive.");
              gang.name = args[1];
              guild.gangs.set(args[1], gang);
              guild.gangs.delete(user.gang.name);
              user.gang.name = args[1];
              guild.markModified('gangs');
              guild.markModified('users');
              guild.save().then(() => message.success(`Gang name has been updated to **${args[1]}** successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              break;
            case "description":
              args.shift();
              let desc = args.join();
              if (desc.length == 0 || desc.length > 4000) return message.error("The gang description should be between 0 and 4000 characters.");
              gang.description = desc;
              guild.markModified('gangs');
              guild.save().then(() => message.success(`Gang description has been updated successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              break;
            case "color":
              if (!args[1]) return message.error("You didn't provide a hex color for the guild.");
              if (!w3color(args[1]).valid) return message.error("This is not a valid color. Please provide a hex color for the guild.");
              gang.color = args[1];
              guild.markModified('gangs');
              guild.save().then(() => message.success(`Gang color has been updated to **${args[1]}** successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              break;
            case "banner":
              if (args[1]) {
                if (args[1].toLowerCase() == 'clear') {
                  gang.banner = null;
                  guild.markModified('gangs');
                  await guild.save().then(() => message.success(`Gang banner has been cleared successfully.`)).catch(err => message.error("An error occured while saving the database: " + err));
                } else return message.error(`You didn't provide a image for the guild, please attach a image with your message. If you wish to remove your banner please use \`${message.prefix}manage banner clear\` command.`);
              } else {
                if (message.attachments.size = 0) return message.error(`You didn't provide a image for the guild, please attach a image with your message. If you wish to remove your banner please use \`${message.prefix}manage banner clear\` command.`);
                gang.banner = message.attachments.first().proxyURL;
                guild.markModified('gangs');
                guild.save(() => message.success(`Gang banner has been updated to the image you attached successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              }
              break;
            case "setgangrole":
              if (!args[1] || !message.mentions.roles.first()) return message.error("You didn't provide a role for the gang.");
              if (!message.mentions.roles.first()) return message.error("This role doesn't exist in this server.");
              if (args[1] == '@everyone') return message.error("You can't set the role to @everyone.");
              if (args[1].toLowerCase() == 'none') {
                gang.gangRole = "";
                guild.markModified('gangs');
                guild.save().then(() => message.success(`Gang role has been cleared successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              } else {
                let gangRole = message.mentions.roles.first();
                if (gangRole.position > message.guild.me.roles.highest.position) return message.error("The role you provided is higher than my highest role.");
                gang.gangRole = gangRole.id;
                guild.markModified('gangs');
                guild.save().then(() => message.success(`Gang role has been updated to **${gangRole.name}** successfully.`)).catch(err => message.channel.send("An error occured: " + err));
              }
              break;
            case "setadmin":
              if (user.gang.rank != "Owner") return message.error("Only Owner of the gang can manage this.");
              if (!message.mentions.users.first()) return message.error("You did not mention a user to set as Admin.");
              let admins = [];
              guild.members.forEach(m => {
                if (gang.uuid == m.gang.uuid && m.gang.rank == "Admin") admins.push(m.id);
              });
              if (admins.size == 6) return message.error("You can only have 6 admins at a time in your gang.");
              if (message.mentions.users.first().id == message.author.id) return message.error("You can't be Admin! You're already the Owner.");
              if (admins.includes(message.mentions.users.first().id)) return message.error("This user is already an Admin.");
              let usera = guild.members.get(message.mentions.users.first().id);
              if (!usera) {
                return message.error("This user is not in your gang.");
              } else {
                if (guild.members.get(message.mentions.users.first().id).gang.uuid != gang.uuid) return message.error("This user is not in your gang.");
              }
              usera.gang.rank = "Admin";
              guild.markModified('users');
              guild.save().then(() => message.success(`User has been set as a Admin successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              break;
            case "removeadmin":
              if (user.gang.rank != "Owner") return message.error("Only Owner of the gang can manage this.");
              if (!message.mentions.users.first()) return message.error("You did not mention a user to remove their Admin.");
              let adminlist = [];
              guild.members.forEach(m => {
                if (gang.uuid == m.gang.uuid && m.gang.rank == "Admin") adminlist.push(m.id);
              });
              if (!adminlist.includes(message.mentions.users.first().id)) return message.error("This user is not an Admin.");
              adminlist.indexOf(message.mentions.users.first().id) > -1 ? adminlist.splice(admins.indexOf(message.mentions.users.first().id), 1) : null;
              guild.markModified('users');
              guild.save().then(() => message.success(`User has been removed from Admins successfully.`)).catch(err => message.channel.send("An error occured: " + err))
              break;
            case "kick":
              if (user.gang.rank != "Owner" && user.gang.rank != "Admin") return message.error("Only Owner or Admin of the Gang can manage this.");
              if (!message.mentions.users.first()) return message.error("You did not mention a user to remove to kick from the Gang.");
              let userb = guild.members.get(message.mentions.users.first().id);
              if (!userb) {
                return message.error("This user is not in your gang.");
              } else {
                if (guild.members.get(message.mentions.users.first().id).gang.uuid != gang.uuid) return message.error("This user is not in your gang.");
              }
              userb.gang = {
                uuid: '',
                name: "None",
                rank: null,
                joinDate: null
              }
              guild.markModified('users');
              guild.save().then(() => message.success(`User has been kicked from the Gang successfully.`)).catch(err => message.channel.send("An error occured: " + err));
              
              break;
            case "transferownership":
              if (user.gang.rank != "Owner") return message.error("Only Owner of the gang can manage this.");
              if (!message.mentions.users.first()) return message.error("You did not mention the user to transfer the Gang to.");
              let userc = guild.members.get(message.mentions.users.first().id);
              if (userc.gang.rank == "Owner") {
                return message.error("This user is already a Gang owner");
              } else if (userc.gang.uuid != guild.gangs.get(user.gang.name).uuid) {
                return message.error("This user is not in your Gang.");
              } else {
                let confirm = await message.channel.send(`<:warning:724052384031965284> | Do you really wish to transfer **${gang.name}** to ${userc.tag}? (yes/no)`);
                confirm.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 60000, errors: ['time']}).then(async c => {
                  if (c.first().content.toLowerCase() == "yes" || c.first().content.toLowerCase() == "y") {
                    gang.owner = {
                      tag: message.mentions.users.first().tag,
                      avatar: message.mentions.users.first().avatarURL(),
                      id: message.mentions.users.first().id
                    }
                    userc.gang.rank = "Owner";
                    user.gang.rank = "Member";
                    guild.markModified('users');
                    guild.markModified('gangs');
                    console.log(gang)
                    guild.save().then(()=> message.success("The gang has been successfully transferred.")).catch(err => message.channel.send("An error occured: " + err));
                  } else {
                    return message.error("Command cancelled.");
                  }
                });
              }
              break;
            default:
              return message.error("You didn't provide a option. `name, description, color, flag, setadmin, setguildrole, removeadmin, kick, transferownership`");
          }
          
        }
      }
          });
  }
};
