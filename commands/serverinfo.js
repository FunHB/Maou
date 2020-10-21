const {MessageEmbed} = require("discord.js");

module.exports = {
    name: "serverinfo",
    description: "Wyświetla informacje o serwerze!",
    args: false,
    // !serverinfo
    usage: "",
    guildOnly: true,
    cooldown: 10,
    aliases: ["sinfo"],

    run(msg, args) {
        const {author, guild} = msg;

        const embed = new MessageEmbed()
            .setColor("3480ff")
            .setAuthor(`${guild.name}`, guild.iconURL({
                size: 128,
                format: "jpg"
            }))
            .setThumbnail(guild.iconURL({
                size: 128,
                format: "jpg"
            }))
            .addField("ID serwera", guild.id, true)
            .addField("Właściciel", guild.owner, true)
            .addField("Liczba użytkowników", guild.memberCount, true)

        msg.channel.send(embed);
    },
}