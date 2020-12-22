const {MessageEmbed} = require('discord.js');
const artDatabases = require("../artdatabase.json");

module.exports = {
    name: "art",
    description: "Wyświetla losowy obrazke z anime!",
    args: false,
    guildOnly: true,
    cooldown: 15,

    async run(msg, args) {
        const animeRandom = () => {
            return artDatabases[index];
          };
          
        const mathRandom = (number) => ~~(Math.random() * number);

        const index = mathRandom(artDatabases.length);

        let embed = new MessageEmbed().setDescription(`${msg.author} o to obrazek dla ciebie <3`).setImage(animeRandom()).setFooter(`Index: ${index}`).setColor("RANDOM");

        msg.channel.send(embed)
    },
}