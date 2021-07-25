const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildName: String,
  guildID: String,
  blacklisted: Boolean,
  gangs: {
    type: Map,
    of: Object
  },
  members: {
    type: Map,
    of: Object
  },
  settings: {
    create: {
      allow: String,
      roles: []
    },
    blacklist: {
      commands: [],
      channels: []
    }
  },
  globalGang: {
    active: false,
    gang: {
      name: String,
      admins: {
        type: Map,
        of: Object
      },
      members: {
        type: Map,
        of: Object
      },
      color: String,
      description: String,
      gangPoints: Number,
      banner: String,
    }
  },
});

module.exports = mongoose.model("guilds", guildSchema);
