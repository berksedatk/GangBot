const Discord = require("discord.js");

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
  async execute(bot, message, args, db) {

    if (!args[0]) {
      if (message.guild.owner.id === message.author.id) {
        return message.channel.send(":x: | You didn't provide a user or a local gang name.");
      } else {
        return message.channel.send(":x: | You didn't provide a gang name to name your local gang.");
      }
    }

    if (message.guild.owner.id === message.author.id && !args[1]) return message.channel.send(":x: | You didn't provide a gang name to name the local gang.");

    let doc = await db.collection("local").doc(message.guild.id).get()

    if (!doc.exists) {
      db.collection("servers").doc(message.guild.id).set({
        guildName: message.guild.name,
        guildID: message.guild.id,
        settings: {
          createGang: {
            type: "everyone", //Can be "everyone", "role", "mod" and "owner" | *Note* Owner of the server can bypass this and create a gang ratherless the type is
            role: null, //Wont be used until type is "role",
            permission: null //Wont be used until type is "mod"
          },
          blacklist: {
            enabled: false,
            channels: []
          }
        },
        globalGang: {
          active: false,
          gang: {
            name: null,
            owner: message.guild.owner.id,
            gangPoints: 0,
            members: new Map()
          }
        }
      }).then(() => {
        console.log(`New Guild doc has been added: ${message.guild.name}`);
      }).catch(err => {
        return message.channel.send(`An error occured, please contract a dev with this error message: ${err}`);
        console.log(`Error while creating a new Guild: ${message.guild.name} -> ${err}`)
      });
    } else {
      if (doc.data().settings.createGang.type === "everyone") {
        let doc = await db.collection("local").doc(message.guild.id).collection("gangs").doc(args[0].toLowerCase()).get()
        if (doc.exists) {
          return message.channel.send(":x: | A local gang with this name already exists!");
        } else {
          db.collection("local").doc(message.guild.id).collection("gangs").doc(args[0].toLowerCase()).set({
            owner: {
              id: message.author.id,
              tag: message.author.tag
            },
            admins: new Map(),
            members: new Map(),
            gang: {
              name: args[0],
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            }
          }).then(() => {
            return message.channel.send(`:white_check_mark: | **${args[0]}** has been created!`);
          }).catch(err => {
            return message.channel.send(`An error occured, please contract a dev with this error message: ${err}`);
            console.log(`Error while creating a new Local gang: ${message.guild.name} -> ${err}`)
          })
        }
      } else if (doc.data().settings.createGang.type === "role") {
        if (!message.author.roles.cache.get(doc.data().settings.createGang.role)) return message.channel.send({
          embed: {
            author: {
              text: message.author.tag,
              icon: message.author.avatarURL()
            },
            color: "RED",
            description: `:x: | You don't have the required <@&${doc.data().settings.createGang.role}> role to create a gang.`
          }
        });

        let doc = await db.collection("local").doc(message.guild.id).collection("gangs").doc(args[0].toLowerCase()).get()
        if (doc.exists) {
          return message.channel.send(":x: | A local gang with this name already exists!");
        } else {
          db.collection("local").doc(message.guild.id).collection("gangs").doc(args[0].toLowerCase()).set({
            owner: {
              id: message.author.id,
              tag: message.author.tag
            },
            admins: new Map(),
            members: new Map(),
            gang: {
              name: args[0],
              color: "#999999",
              description: "No description given.",
              role: null,
              gangPoints: 0,
              createdTimestamp: Date.now(),
              banner: null,
            }
          }).then(() => {
            return message.channel.send(`:white_check_mark: | **${args[0]}** has been created!`);
          }).catch(err => {
            return message.channel.send(`An error occured, please contract a dev with this error message: ${err}`);
            console.log(`Error while creating a new Local gang: ${message.guild.name} -> ${err}`)
          })
        }

      } else if (doc.data().settings.createGang.type === "mod") {
        if (!message.member.hasPermission(doc.data().settings.createGang.permission)) {
          return message.channel.send(`:x: | You don't have the required permission to create local gangs. Required permission: ${prettyString(doc.data().settings.createGang.permission)}`);
        } else {

          if (!message.mentions.members.first()) return message.channel.send(":x: | You didn't provide a user to create local gang for.");
          let member = message.mentions.members.first()

          args.shift()
          let gangName = args.join(' ')
          if (gangName.length > 32) return message.channel.send(":x: | Local gang name cannot be longer than 32 characters.")

          let doc = await db.collection("local").doc(message.guild.id).collection("gangs").doc(gangName.toLowerCase()).get()
          if (doc.exists) {
            return message.channel.send(":x: | A local gang with this name already exists!");
          } else {
            db.collection("local").doc(message.guild.id).collection("gangs").doc(gangName.toLowerCase()).set({
              owner: {
                id: member.id,
                tag: member.user.tag
              },
              admins: new Map(),
              members: new Map(),
              gang: {
                name: gangName,
                color: "#999999",
                description: "No description given.",
                role: null,
                gangPoints: 0,
                createdTimestamp: Date.now(),
                banner: null,
              }
            }).then(() => {
              return message.channel.send(`:white_check_mark: | **${args[0]}** has been created for **${member.user.tag}**!`);
            }).catch(err => {
              return message.channel.send(`An error occured, please contract a dev with this error message: ${err}`);
              console.log(`Error while creating a new Local gang: ${message.guild.name} -> ${err}`)
            })
          }
        }
      } else if (doc.data().settings.createGang.type === "owner") {
        if (message.guild.owner.id === message.author.id) {
          return message.channel.send(`:x: | You cannot create local gangs, only the server owner can create local gangs.`);
        } else {

          if (!message.mentions.members.first()) return message.channel.send(":x: | You didn't provide a user to create gang for.");
          let member = message.mentions.members.first()

          args.shift()
          let gangName = args.join(' ')
          if (gangName.length > 32) return message.channel.send(":x: | Gang name cannot be longer than 32 characters.")

          let doc = await db.collection("local").doc(message.guild.id).collection("gangs").doc(gangName.toLowerCase()).get()
          if (doc.exists) {
            return message.channel.send(":x: | A local gang with this name already exists!");
          } else {
            db.collection("local").doc(message.guild.id).collection("gangs").doc(gangName.toLowerCase()).set({
              owner: {
                id: member.id,
                tag: member.user.tag
              },
              admins: new Map(),
              members: new Map(),
              gang: {
                name: gangName,
                color: "#999999",
                description: "No description given.",
                role: null,
                gangPoints: 0,
                createdTimestamp: Date.now(),
                banner: null,
              }
            }).then(() => {
              return message.channel.send(`:white_check_mark: | **${args[0]}** has been created for **${member.user.tag}**!`);
            }).catch(err => {
              return message.channel.send(`An error occured, please contract a dev with this error message: ${err}`);
              console.log(`Error while creating a new Local gang: ${message.guild.name} -> ${err}`)
            })
          }
        }
      }
    }
  }
};
