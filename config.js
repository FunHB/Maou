const dotenv = require("dotenv").config()

module.exports = {
    token: process.env.token,
    botCommandsChannel: process.env.botCommandsChannel,
    reportsChannel: process.env.reportsChannel,
    modRole: process.env.modRole,
    modLogsChannel: process.env.modLogsChannel,
    prefix: "!",
    botAuthor: "ZYGl",
    botVersion: "0.8",
    owner: "324612588677627904",
}