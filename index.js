const Discord = require("discord.js");
const client = new Discord.Client();
const {token} = require("./config.js");

const commandHandler = require("./handlers/command.handler")

commandHandler(client);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`!pomoc`)
})

client.login(token);

client.on("debug", () => {});
client.on("warn", () => {});
client.on("error", () => {});