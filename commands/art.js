const {MessageEmbed} = require('discord.js');
const randomanime = require('random-anime')

module.exports = {
    name: "art",
    description: "Wyświetla losowy obrazek z anime! Możliwe użycie tylko na kanale #obrazki",
    args: false,
    guildOnly: true,
    cooldown: 10,

    async run(msg, args) {
        let anime = randomanime.anime();
        msg.channel.send(new MessageEmbed().setDescription(`${msg.author} o to obrazek dla ciebie <3`).setImage(anime).setColor("RANDOM"));
    },
}