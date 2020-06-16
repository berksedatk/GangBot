const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildName: String,
  guildID: String,
  settings: {
    createGang: {
      type: "everyone",
      role: null,
      permission: null
    },
    blacklist: {
      enabled: false,
      channels: []
    }
  },
  globalGang: {
    active: false,
    gang: {
      name: String,
      admins: {},
      members: {},
      color: "#999999",
      description: "Hello, this is my Global Gang!",
      gangPoints: 0,
      banner: null,
    }
  },
  gangs: {}
});

module.exports = mongoose.model("guildSchema", guildSchema);
