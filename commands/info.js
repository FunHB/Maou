const {MessageEmbed} = require("discord.js");

const {botAuthor, botVersion} = require(__dirname + "/../config.js");

module.exports = {
    name: "info",
    description: "Wyświetla informacje o bocie!",
    args: false,
    // !info
    guildOnly: true,
    cooldown: 10,
    aliases: ["informacje"],

    run(msg, args) {

        const {author, guild} = msg;
        let time = Date().toLocaleString().slice(16,21);

        const embed = new MessageEmbed()
            .setTitle("MaouBot - Info")
            .setColor("3480ff")
            .setAuthor(`${guild.name}`, guild.iconURL({
                size: 128,
                format: "jpg"
            }))
            .setDescription('Bot stworzony dla grupy tłumaczy Maou Subs!')
            .setThumbnail(guild.iconURL({
                size: 128,
                format: "jpg"
            }))
            .addField("Autor", botAuthor, true)
            .addField("Wersja", botVersion, true)
            .setFooter(`Aktualny czas ${time}`);

        msg.channel.send(embed);

    },
}