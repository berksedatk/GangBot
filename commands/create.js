const Discord = require("discord.js");
const Guild = require("../schemas/guild.js");

function prettyString(string) {
 return string.replace(/_/g, " ").replace(/guild/gi, "Server").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

module.exports = {
  name: "create",
  category: "Local Gang",
  description: "Creates a local gang on your server.",
  aliases: ["new"],
  usage: "[user] <gang name>",const Discord = require("discord.js");
const Guild = require("../schemas/guild.js");

function prettyString(string) {
 return string.replace(/_/g, " ").replace(/guild/gi, "Server").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

module.exports = {
  name: "create",
  category: "Local Gang",
  description: "Creates a local gang on your server.",
  aliases: ["new"],
  usage: "[user] <gang name>",
  cooldown: 5,
  async execute(bot, message, args) {

    Guild.findOne({ guildID: message.guild.id }, async (err, guild) => {
      if (err) return message.channel.send(`An error occured: ${err}`);
      if (!guild) return message.channel.send("There was an error while fetching server database, please contact a bot dev! (https://discord.gg/tkR2nTf)");
      if (guild) {
        let gangName;
        switch (guild.settings.createGang.allow) {
          case "everyone":
          if (!args[0]) return message.channel.send(":x: | You didn't provide a gang name.");
          gangName = args.join(" ")
          if (guild.gangs) {
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === message.author.id) return message.channel.send(":x: | You already own a gang.");
            })
          }
          guild.gangs.set(gangName.toLowerCase(), {
            owner: {
              id: message.author.id,
              tag: message.author.tag
            },
            admins: new Map(),
            members: new Map(),
            name: gangName,
            color: "#999999",
            description: "No description given.",
            role: null,
            gangPoints: 0,
            createdTimestamp: Date.now(),
            banner: null,
          });
          guild.save().then(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
          case "role":
          if (!message.member.roles.get(guild.settings.createGang.role)) return message.channel.send({embed: {description: `:x: | You don't have the required role to create a gang! Required role: <@&${guild.settings.createGang.role}>`}})
          if (!args[0]) return message.channel.send(":x: | You didn't provide a gang name.");
          gangName = args.join(" ")
          if (guild.gangs) {
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === message.author.id) return message.channel.send(":x: | You already own a gang.");
            })
          }
          guild.gangs.set(gangName.toLowerCase(), {
              owner: {
              id: message.author.id,
              tag: message.author.tag
            },
            admins: new Map(),
            members: new Map(),
            name: gangName,
            color: "#999999",
            description: "No description given.",
            role: null,
            gangPoints: 0,
            createdTimestamp: Date.now(),
            banner: null,
          });
          guild.save().then(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
          case "permission":
            if (!message.member.hasPermission(guild.settings.createGang.permission)) return message.channel.send(`:x: | You don't have the required permission to create a gang! Required permission: ${prettyString(guild.settings.createGang.permission)}`)
            if (!args[0]) return message.channel.send(":x: | You didn't provide a gang name.");
            gangName = args.join(" ")
            if (guild.gangs) {
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
              guild.gangs.forEach((gang, gangName) => {
                if (gang.owner.id === message.author.id) return message.channel.send(":x: | You already own a gang.");
              })
            }
            guild.gangs.set(gangName.toLowerCase(), {
              owner: {
                id: message.author.id,
                tag: message.author.tag
              },
              admins: new Map(),
              members: new Map(),
              name: gangName,
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            });
            guild.save().then(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
          case "owner":
            if (message.guild.owner.id != message.author.id) return message.channel.send(":x: | Only server owner can create gangs.");
            if (!args[0]) return message.channel.send(":x: | You didn't provide a true user.");

            let user = message.mentions.users.first() ? message.mentions.users.first()
              : (message.guild.members.cache.get(args[0]) ? message.guild.members.cache.get(args[0])
              : (message.guild.members.cache.filter(u => u.user.username.toLowerCase().includes(args[0].toLowerCase())).size > 0 ? message.guild.members.cache.filter(u => u.user.username.toLowerCase().includes(args[0].toLowerCase())).array()
              : undefined))

            if (!user) return message.channel.send(":x: | You didn't provide a true user.");

            if (user.length > 1) {
              let usermsg = "";
                for (let i = 0; i < (user.length > 10 ? 10 : user.length); i++) {
              usermsg += `\n${i + 1} -> ${user[i].user.username}`;
              }

              let msg = await message.channel.send("", {embed: {description: `**There are multiple users found with name '${args[0]}', which one would you like to use?** \n${usermsg}`, footer: {text: "You have 30 seconds to respond."}, timestamp: Date.now()}});
              let collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 30000, errors: ['time'] })
              if (Number(collected.first().content) > user.length) return message.channel.send(":x: | Invalid user number. Command cancelled.");
              user = user[collected.first().content - 1]
              msg.delete()
            } else {
              user = user[0] || message.guild.members.cache.get(user.id)
            }
            args.shift()
            gangName = args.join(" ")

            if (guild.gangs) {
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === user.id) return message.channel.send(":x: | This user already owns a gang.");
              })
            }

            guild.gangs.set(gangName.toLowerCase(), {
              owner: {
                id: user.id,
                tag: user.user.tag
              },
              admins: new Map(),
              members: new Map(),
              name: gangName,
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            });
            guild.save().then(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
        }
      }
    });
  }
};

  cooldown: 5,
  async execute(bot, message, args) {

    Guild.findOne({ guildID: message.guild.id }, (err, guild) => {
      if (err) return message.channel.send(`An error occured: ${err}`);
      if (!guild) return message.channel.send("There was an error while fetching server database, please contact a bot dev! (https://discord.gg/tkR2nTf)");
      if (guild) {
        switch (guild.settings.createGang.type) {
          case "everyone":
            if (!args[0]) return message.channel.send(":x: | You didn't provide a gang name.");
            let gangName = args.join(" ")
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === message.author.id) return message.channel.send(":x: | You already own a gang.");
            })
            guild.gangs.set(gangName.toLowerCase(), {
              owner: {
                id: message.author.id,
                tag: message.author.tag
              },
              admins: new Map(),
              members: new Map(),
              name: gangName,
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            });
            guild.save(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
          case "role":
            if (!message.member.roles.get(guild.settings.createGang.role)) return message.channel.send({embed: {description: `:x: | You don't have the required role to create a gang! Required role: <@&${guild.settings.createGang.role}>`}})
            if (!args[0]) return message.channel.send(":x: | You didn't provide a gang name.");
            let gangName = args.join(" ")
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === message.author.id) return message.channel.send(":x: | You already own a gang.");
            })
            guild.gangs.set(gangName.toLowerCase(), {
              owner: {
                id: message.author.id,
                tag: message.author.tag
              },
              admins: new Map(),
              members: new Map(),
              name: gangName,
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            });
            guild.save(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
          case "permission":
            if (!message.member.hasPermission(guild.settings.createGang.permission)) return message.channel.send(`:x: | You don't have the required permission to create a gang! Required permission: ${prettyString(guild.settings.createGang.permission)}`}})
            if (!args[0]) return message.channel.send(":x: | You didn't provide a gang name.");
            let gangName = args.join(" ")
            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === message.author.id) return message.channel.send(":x: | You already own a gang.");
            })
            guild.gangs.set(gangName.toLowerCase(), {
              owner: {
                id: message.author.id,
                tag: message.author.tag
              },
              admins: new Map(),
              members: new Map(),
              name: gangName,
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            });
            guild.save(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
          case "owner":
            if (message.guild.owner.id != message.author.id) return message.channel.send(":x: | Only server owner can create gangs.");
            if (!args[0]) return message.channel.send(":x: | You didn't provide a true user.");

            let user = message.mentions.users.first() ? message.mentions.users.first()
              : (message.guild.members.cache.get(args[0]) ? message.guild.members.cache.get(args[0])
              : (message.guild.members.cache.filter(u => u.user.username.toLowerCase().includes(args[0].toLowerCase())).size > 0 ? message.guild.members.cache.filter(u => u.user.username.toLowerCase().includes(args[0].toLowerCase())).array()
              : undefined))

            if (!user) return message.channel.send(":x: | You didn't provide a true user.");

            if (user.length > 1) {
              let usermsg = "";
                for (let i = 0; i < (user.length > 10 ? 10 : user.length); i++) {
              usermsg += `\n${i + 1} -> ${user[i].user.username}`;
              }

              let msg = await message.channel.send("", {embed: {description: `**There are multiple users found with name '${args[0]}', which one would you like to use?** \n${usermsg}`, footer: {text: "You have 30 seconds to respond."}, timestamp: Date.now()}});
              let collected = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 30000, errors: ['time'] })
              if (Number(collected.first().content) > user.length) return message.channel.send(":x: | Invalid user number. Command cancelled.");
              user = user[collected.first().content - 1]
              msg.delete()
            } else {
              user = user[0] || message.guild.members.cache.get(user.id)
            }
            args.shift()
            let gangName = args.join(" ")

            if (guild.gangs.get(gangName.toLowerCase())) return message.channel.send(":x: | This gang already exists.");
            guild.gangs.forEach((gang, gangName) => {
              if (gang.owner.id === user.id) return message.channel.send(":x: | This user already owns a gang.");
            })

            guild.gangs.set(gangName.toLowerCase(), {
              owner: {
                id: user.id,
                tag: user.user.tag
              },
              admins: new Map(),
              members: new Map(),
              name: gangName,
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            });
            guild.save(() => message.channel.send(`:white_check_mark: | **${gangName}** gang has been created!`)).catch(err => message.channel.send("An error occured: " + err))
            break;
        }
      }
    });
  }
};
