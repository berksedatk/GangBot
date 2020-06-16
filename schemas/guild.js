const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildName: String,
  guildID: String,
  settings: {
    createGang: {
      allow: String,
      role: String,
      permission: String
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
      color: String,
      description: String,
      gangPoints: Number,
      banner: String,
    }
  },
  gangs: Map
});

module.exports = mongoose.model("guildSchema", guildSchema);
