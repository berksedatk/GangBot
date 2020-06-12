const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

module.exports = {
  async execute(bot) {

    app.get("/", (req, res) => {
      res.redirect("https://gladiatorbot.glitch.me/");
    });

    server.listen(5000, () => {
      console.log("Listenin on port 5000")
    });

    bot.user.setActivity(`with fire. | g?help`, {
      type: "PLAYING"
    });

    let number = 0;
    setInterval(function() {
      if (number == 0) {
        bot.user.setActivity(`with fire. | g?help`, {
          type: "PLAYING"
        });
        number = 1;
      } else {
        bot.user.setActivity(`proponagda of gangs. | g?help`, {
          type: "WATCHING"
        });
        number = 0;
      }
    }, 30000)

    require("../util/dbl.js")(bot, server)

    console.log("---------------------------------------------")
    console.log("Bot is online.")
    console.log(`Discord Client: ${bot.user.tag} \nServer count: ${bot.guilds.cache.size} \nUser count: ${bot.users.cache.size}`);

  }
}
