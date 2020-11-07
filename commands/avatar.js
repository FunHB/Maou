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
            dynamic: true,
            size: 128,
            format: "png"
        })


        const embed = new Discord.MessageEmbed()
            .setDescription(`Awatar dla: ${member}`)
            .setImage(avatar)
            .setColor("222222")
        //.setDescription('Some description here')

        msg.channel.send(embed);
    },
}