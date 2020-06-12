const fs = require("fs");
const config = require('../config.json');

const Discord = require("discord.js");
const cooldowns = new Discord.Collection();

function prettyString(string) {
 return string.replace(/_/g, " ").replace(/guild/gi, "Server").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

module.exports = {
  async execute(bot, message, db, dbl) {
    const prefixes = config.prefixes;
    let prefix = false;
    for (const thisPrefix of prefixes) {
      if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if (!prefix || message.author.bot) return;

    //Arguments
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    //Command defining
    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.dev && !config.devs.includes(message.author.id)) {
    return message.channel.send(":x: | You are not accesed to use this command!")
    }
    if (command.admin && !config.admins.includes(message.author.id)) {
    return message.channel.send(":x: | You are not accesed to use this command!")
    }
    if (command.guildOnly && message.channel.type === 'dm') {
      return message.reply(':x: | This command cannot be executed in direct messages.');
    }
    if (command.reqPermissions) {
      let missing = []
      command.reqPermissions.forEach(permission => {
        if (!message.guild.members.cache.get(message.author.id).permissions.has(permission)) missing.push(prettyString(permission))
      })
      if (missing.length > 0) {
        return message.channel.send(":x: | You are not accesed to use this command! Missing permission(s): " + missing.join(', '));
      }
    }

    //Cooldowns
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

      if (now < expirationTime && !config.devs.includes(message.author.id)) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      }

    //Executing
    try {
      command.execute(bot, message, args, db, dbl);
    } catch (err) {
      console.error(`Executing command error: ${err}`);
      message.channel.send(`Executing command error: ${err}`);
    }
  }
}
