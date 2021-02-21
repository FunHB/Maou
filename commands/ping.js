const {MessageEmbed} = require('discord.js');

module.exports = {
    name: "ping",
    description: "Sprawdza opóźnienie między botem a serwerem!",
    args: false,
    guildOnly: true,
    cooldown: 10,

    async run(msg, args) {
        const amount = 1;
        let member = msg.mentions.users.first() || msg.author;
        const m = await msg.channel.send("Ping?");
        msg.channel.send(new MessageEmbed().setDescription(`Ping **${member}** wynosi - \`${m.createdTimestamp - msg.createdTimestamp}ms\``).setColor("00ff00"));
        m.channel.bulkDelete(amount);
    },
}