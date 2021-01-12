const {MessageEmbed} = require('discord.js');
const {modLogsChannel, muteRole} = require(__dirname + "/../config.js");

module.exports = {
    name: "unmute",
    description: "Zdejmuje role wyciszonego!",
    guildOnly: true,
    aliases: [],

    async run(msg, args) {
        const userToUnmute = msg.mentions.users.first();
        const memberToUnmute = msg.guild.members.cache.get(userToUnmute.id);
        let role = msg.guild.roles.cache.get(muteRole)

        if(!memberToUnmute.roles.cache.has(role.id)) {
            return msg.channel.send(new MessageEmbed().setDescription(`Ta osoba nie jest wyciszona!`).setColor("ff0000"))
        }

        const modlogChannel = msg.guild.channels.cache.get(modLogsChannel);

        let logMsg = new MessageEmbed()
            .setColor("0066cc")
            .setAuthor(userToUnmute.username, userToUnmute.displayAvatarURL({dynamic: true, size: 128, format: "png"}))
            .setDescription(`Powód: Ułaskawiony`)
            .addField("UserId:", `${memberToUnmute.id}`, true)
            .addField("Typ:", "Unmute", true)
            .addField("Kiedy:", `${msg.createdAt.getUTCDate()}.${msg.createdAt.getUTCMonth()+1}.${msg.createdAt.getUTCFullYear()} ${msg.createdAt.getUTCHours()+1}:${msg.createdAt.getUTCMinutes()}`, true)
            .setFooter(`Przez: ${msg.author.username}`);

        memberToUnmute.roles.remove(role).then((res) => {
            msg.channel.send(new MessageEmbed().setDescription(`:white_check_mark: <@!${memberToUnmute.id}> został ułaskawiony!`).setColor("00ff00"))
            modlogChannel.send(logMsg)
        });
    },
}