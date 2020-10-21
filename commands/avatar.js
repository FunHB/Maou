const Discord = require('discord.js');

module.exports = {
    name: "avatar",
    description: "Wyświetla twój lub czyjś avatar.",
    args: false,
    // !avatar <osoba>
    usage: "<osoba>",
    guildOnly: true,
    cooldown: 10,
    aliases: ["awatar"],

    run(msg, args) {
        let member = msg.mentions.users.first() || msg.author;

        let avatar = member.displayAvatarURL({
            size: 128,
            format: "jpg"
        })


        const embed = new Discord.MessageEmbed()
            .setTitle(`${member.username}`)
            .setImage(avatar)
            .setColor("222222")
        //.setDescription('Some description here')

        msg.channel.send(embed);
    },
}