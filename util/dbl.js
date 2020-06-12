const { MessageEmbed } = require('discord.js');
const DBL = require('dblapi.js');

module.exports = async (bot, server) => {
  const dbl = new DBL(process.env.DBL_TOKEN, {
    webhookAuth: process.env.DBL_PASS,
    webhookPort: 5000
  });

  dbl.webhook.on('ready', async hook => {
		client.log(`Top.gg webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
	});

  dblWebhook.webhook.on('vote', async voter => {
    const user = bot.users.cache.get(vote.user);
    const voteEmbed = new MessageEmbed()
      .setTitle("**New Vote!**")
      .setTimestamp()
      .setColor("PURPLE")
      .setFooter(`Vote by using g?vote command!`)
      .addField(`${user.tag}(${user.id})`, `Just voted for the bot!`);
    bot.channels.cache.get("673867340810551342").send(voteEmbed);
    try {
      user.send("Thanks for voting! You can vote again in 12 hours.");
      console.log(`User ${user.tag} just voted!`);
    } catch (err) {
      console.log(`User ${user.tag} just voted but couldn't DM the user!`);
    }
  });

}
