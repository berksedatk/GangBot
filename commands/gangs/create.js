const Discord = require("discord.js");
const Guild = require("../../schemas/guild.js");
const find = require("../../utility/find.js");
const w3color = require("../../utility/w3color.js");
const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: "create",
  category: "Gangs",
  description: "Creates a gang. If allowed for everyone, gangs will be created as their own unless they have Manage Server permission.",
  aliases: ["addgang"],
  cooldown: 5,
  guildOnly: true,
  execute(bot, message, args) {
    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.error("An error occured: " + err)
      if (!guild) return message.error("Database does not exist! Please contract a dev.");
      if (guild) {
        if (guild.settings.create.allow == "everyone") {
          //Public
          let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 600000 })
          let msg = await message.channel.send("Gang creator started! What should be the gang's name? (case sensitive)\nType in `cancel` anytime to exit the creator.");
          let uuid = uuidv4();

          let newGang = {
            name: "",
            uuid: uuid,
            description: "",
            owner: {
              tag: message.author.tag,
              avatar: message.author.avatarURL(),
              id: message.author.id
            },
            points: 0,
            banner: "",
            color: "#000000",
            role: "",
            createdAt: new Date()
          }

          collector.on("collect", c => {
            if (c.content.toLowerCase() == "cancel") {
              collector.stop()
              return message.channel.send("Gang creator has been cancelled.");
            }
            let count = collector.collected.size;
            switch (count) {
              case 1:
                //Name
                if (c.content.length > 32 || c.content.length < 3 || c.content.includes('\n')) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Name length must be in between 3 and 32 characters and should not include newlines(Case sensitive).\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else if (guild.gangs.get(c.content)) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("A gang with this name already exist!.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.name = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's name will be \`${c.content}\`, what should be the description to the gang?\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 2:
                //Description
                if (c.content.length > 1024 || c.content.length < 3) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Name length must be in between 3 and 1024 characters.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.description = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Ggang's description has been set, what should be the color of the gang?\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 3:
                //Color
                if (!w3color(c.content).valid) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang color must be a valid color.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.color = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's color is set, What should be the flag of this gang? Please attach a image or type in \`skip\`.\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 4:
                //Banner
                if (!c.attachments.first() && c.content.toLowerCase() != "skip") {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("You must attach a image with your message.\nPlease try again or type in \`skip\` to skip. Type in `cancel` to cancel.", true).then(m => m.delete({timeout: 5000}))
                } else if (c.attachments.first() || c.content.toLowerCase() == "skip") {
                  newGang.banner = c.attachments.first() ? c.attachments.first().url : null
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's banner is now set. What should be the role of this gang?\nType in \`cancel\` anytime to exit the creator.`));
                }
              break;
              case 5:
                //Role
                if (c.content.length > 32 || c.content.length < 3 || c.content.includes('\n')) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Role name length must be in between 3 and 32 characters and should not include newlines(Case sensitive).\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}));
                } else if (guild.roles.get(c.content)) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("A role with this name already exist!.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}));
                } else if (c.content || c.content.toLowerCase() == "skip") {
                  let role;
                  c.content.toLowerCase() == "skip" ? newGang.role = null : role = new message.guild.roles.create({ data: { name: c.content, color: newGang.color, hoist: true} })
                  newGang.role = role ? role.id : null;
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's role has been set! Your gang has been created! Your followers now can use the \`g?join ${newGang.name}\` command to join your gang.`))
                  collector.stop();
                  guild.gangs.set(newGang.name, newGang);
                  member = {
                    id: message.author.id,
                    tag: message.author.tag,
                    gang: {
                      uuid: uuid,
                      name: newGang.name,
                      rank: "Owner",
                      joinDate: Date.now()
                    }
                  }
                  guild.members.set(message.author.id, member);
                  guild.save().catch(err => console.log(`Error occured while adding a new gang: ${message.guild.id} ${err}`));
                }
                break;
            }
          });

          collector.on("end", (c, r) => {
            if (r == "time") message.error("Gang creator timed out.", false);
          })
        } else if (guild.settings.create.allow == "roles") {
          //Role
          let missing = []
          guild.settings.create.roles.forEach(role => {
            if (message.guild.roles.cache.get(role)) {
              if (!message.member.roles.cache.get(role)) missing.push(`<@&${message.guild.roles.cache.get(role).id}>`)
            }
          })
          if (missing.length > 0) return message.error("You don't have the required role(s) to create a gang! Missing role(s): " + missing.join(`, `), true)

          let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 600000 })
          let msg = await message.channel.send("Gang creator started! What should be the gang's name? (case sensitive)\nType in \`cancel\` anytime to exit the creator.");
          let uuid = uuidv4();

          let newGang = {
            name: "",
            uuid: uuid,
            owner: {
              tag: "",
              avatar: "",
              id: ""
            },
            description: "",
            points: 0,
            banner: "",
            color: "#000000",
            role: "",
            createdAt: new Date()
          }

          collector.on("collect", c => {
            if (c.content.toLowerCase() == "cancel") {
              collector.stop()
              return message.channel.send("Gang creator has been cancelled.");
            }
            let count = collector.collected.size;
            switch (count) {
              case 1:
                //Name
                if (c.content.length > 32 || c.content.length < 3) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Name length must be in between 3 and 32 characters(Case sensitive).\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else if (guild.gangs.get(c.content)) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("A gang with this name already exist!.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.name = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Your gang's name will be \`${c.content}\`, what should be the description to your gang?\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 2:
                //Description
                if (c.content.length > 1024 || c.content.length < 3) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Name length must be in between 3 and 1024 characters.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.description = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Your gang's description has been set, what should be the color of your gang?\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 3:
                //Color
                if (!w3color(c.content).valid) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang color must be a valid color.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.color = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's color is set, What should be the flag for the gang? Please attach a image or  type in \`skip\` to skip.\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 4:
                //Banner
                if (!c.attachments.first() && c.content.toLowerCase() != "skip") {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("You must attach a image with your message.\nPlease try again or type in `skip` to skip. Type in `cancel` to cancel.", true).then(m => m.delete({timeout: 5000}))
                } else if (c.attachments.first() || c.content.toLowerCase() == "skip") {
                  newGang.banner = c.attachments.first() ? c.attachments.first().url : null
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's baner is now set. You must mention the user you want to make the owner of the gang.\nType in \`cancel\` anytime to exit the creator.`))

                }
              break;
              case 5:
                let user = c.mentions.members.first()
                if (!user) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("You must mention the user you want to make the owner of the gang.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  let member = guild.members.get(user.id);
                  if (member) {
                    if (member.gang.name != "None" || guild.gangs.get(member.gang.name)) {
                      collector.dispose(c)
                      collector.collected.delete(c.id)
                      message.error("This user is already in a gang.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                      return
                    }
                  }
                  newGang.owner.tag = user.user.tag;
                  newGang.owner.avatar = user.user.avatarURL();
                  newGang.owner.id = user.id;
                  msg.delete().then(async () => msg = await message.channel.send(`Their gang has been created! Their followers now can use the \`g?join ${newGang.name}\` command to join their gang.`))
                  collector.stop()
                  guild.gangs.set(newGang.name, newGang)
                  member = {
                    id: user.id,
                    tag: user.user.tag,
                    gang: {
                      uuid: uuid,
                      name: newGang.name,
                      rank: "Owner",
                      joinDate: Date.now()
                    }
                  }
                  guild.members.set(user.id, member);
                  guild.save().catch(err => console.log(`Error occured while adding a new gang: ${message.guild.id} ${err}`))
                }
              break;
            }
          })

          collector.on("end", (c, r) => {
            if (r == "time") message.error("Gang creator timed out.", false);
          })
        } else if (guild.settings.create.allow == "owner") {
          //Owner
          if (message.guild.ownerID != message.author.id) return message.error("Only server owner can create gangs.")

          let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 600000 })
          let msg = await message.channel.send("Gang creator started! What should be the gang's name? (case sensitive)\nType in `cancel` to exit the creator.");
          let uuid = uuidv4();

          let newGang = {
            name: "",
            uuid: uuid,
            owner: {
              tag: "",
              avatar: "",
              id: ""
            },
            description: "",
            points: 0,
            banner: "",
            color: "#000000",
            role: "",
            createdAt: new Date()
          }

          collector.on("collect", c => {
            if (c.content.toLowerCase() == "cancel") {
              collector.stop()
              return message.channel.send("Gang creator has been cancelled.");
            }
            let count = collector.collected.size;
            switch (count) {
              case 1:
                //Name
                if (c.content.length > 32 || c.content.length < 3) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Name length must be in between 3 and 32 characters(Case sensitive).\nType in \`cancel\` anytime to exit the creator.", true).then(m => m.delete({timeout: 5000}))
                } else if (guild.gangs.get(c.content)) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("A gang with this name already exist!.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.name = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's name will be \`${c.content}\`, what should be the description to the gang?\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 2:
                //Description
                if (c.content.length > 1024 || c.content.length < 3) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang Name length must be in between 3 and 1024 characters.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.description = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's description has been set, what should be the color of the gang?\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 3:
                //Color
                if (!w3color(c.content).valid) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("Gang color must be a valid color.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  newGang.color = c.content
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's color is set, What should be the flag for the gang? Please attach a image or type in \`skip\` to skip.\nType in \`cancel\` anytime to exit the creator.`))
                }
              break;
              case 4:
                //Banner
                if (!c.attachments.first() && c.content.toLowerCase() != "skip") {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("You must attach a image with your message.\nPlease try again or type in `skip` to skip. Type in `cancel` to cancel.", true).then(m => m.delete({timeout: 5000}))
                } else if (c.attachments.first() || c.content.toLowerCase() == "skip") {
                  newGang.banner = c.attachments.first() ? c.attachments.first().url : null
                  msg.delete().then(async () => msg = await message.channel.send(`Gang's baner is now set. You must mention the user you want to make the owner of the gang.`))
                }
              break;
              case 5:
                let user = c.mentions.members.first()
                if (!user) {
                  collector.dispose(c)
                  collector.collected.delete(c.id)
                  message.error("You must mention the user you want to make the owner of the gang.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                } else {
                  let member = guild.members.get(user.id);
                  if (member) {
                    if (member.gang.name != "None" || guild.gangs.get(member.gang.name)) {
                      collector.dispose(c)
                      collector.collected.delete(c.id)
                      message.error("This user is already in a gang.\nPlease try again or type in `cancel`.", true).then(m => m.delete({timeout: 5000}))
                      return
                    }
                  }
                  newGang.owner.tag = user.user.tag;
                  newGang.owner.avatar = user.user.avatarURL();
                  newGang.owner.id = user.id;
                  msg.delete().then(async () => msg = await message.channel.send(`Their gang has been created! Their followers now can use the \`g?join ${newGang.name}\` command to join their gang.`))
                  collector.stop()
                  guild.gangs.set(newGang.name, newGang)
                  member = {
                    id: user.id,
                    tag: user.user.tag,
                    gang: {
                      uuid: uuid,
                      name: newGang.name,
                      rank: "Owner",
                      joinDate: Date.now(),
                    }
                  }
                  guild.members.set(user.id, member);
                  guild.save().catch(err => console.log(`Error occured while adding a new gang: ${message.guild.id} ${err}`))
                }
              break;
            }
          });
          collector.on("end", (c, r) => {
            if (r == "time") message.error("Gang creator timed out.", false);
          });
        }
      }
    })
  }
};
