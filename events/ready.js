const config = require('../config.json');

module.exports = async (client) => {

  //client.user.setActivity("to the propaganda of gangs | g?help", {
  //  type: "LISTENING"
  //});

  //Finalize
  console.log(`Discord - Bot is ready.
Client User: ${client.user.tag}
Guild Count: ${client.guilds.cache.size}`);

  client.ready = true
}
