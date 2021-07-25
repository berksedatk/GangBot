const { prefixes, devs } = require('../config.json');

const Discord = require("discord.js");
const cooldowns = new Discord.Collection();

function prettyString(string) {
 return string.replace(/_/g, " ").replace(/guild/gi, "Server").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

module.exports = (client, message) => {
  if (!client.ready) return;

  for (const thisPrefix of prefixes) {
    if (message.content.toLowerCase().startsWith(thisPrefix)) message.prefix = thisPrefix;
  }

  if (!message.prefix || message.author.bot || !message.content.toLowerCase().startsWith(message.prefix) || !message.guild.me.permissions.has("SEND_MESSAGES")) return;
  //Arguments
  const args = message.content.slice(message.prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  //Commands definition
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  //Parameters
  if (command.dev && !devs.includes(message.author.id)) return message.channel.send("<:cross:724049024943915209> | Only Bot Developers can use this command!");
  if (command.guildOnly && message.channel.type == "dm") return message.channel.send("<:cross:724049024943915209> | This command can only be executed in a server!");
  if (command.dmOnly && message.channel.type != "dm") return message.channel.send("<:cross:724049024943915209> | This command can only be executed in DM's!");
  if (command.reqPermissions) {
    let missing = [];
    command.reqPermissions.forEach(permission => {
      if (!message.guild.members.cache.get(message.author.id).permissions.has(permission)) missing.push(prettyString(permission))
    })
    if (missing.length > 0) return message.channel.send(":x: | You don't have the required permission(s) to use this command!! Missing permission(s): " + missing.join(', '));
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (!timestamps.has(message.author.id)) {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  } else {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime && !devs.includes(message.author.id)) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  try {
    message.error = function(error, embed, usage, reply) {
      if (!error) throw new ReferenceError("Error context is not defined");
      if (embed) return this.channel.send({embed: {title: "<:cross:724049024943915209> | Error", description: `${error}${usage ? `\n\nUsage:\n\`${this.prefix}${command.name} ${usage}\`` : ""}`, color: "RED"}});
      else return this.channel.send(`<:cross:724049024943915209> | ${error}${usage ? `\n\nUsage:\n\`${this.prefix}${command.name} ${usage}\`` : ""}`)
    }
    message.success = function(success, embed, reply) {
      if (!success) throw new ReferenceError("Success context is not defined");
      if (embed) return this.channel.send({embed: {title: "<:tick:724048990626381925> | Success", description: success, color: "GREEN"}})
      else return this.channel.send(`<:tick:724048990626381925> | ${success}`)

    }
    command.execute(client, message, args);
  } catch (err) {
    console.error(err);
    message.channel.send(`Executing command error: ${err}`);
  }
}
