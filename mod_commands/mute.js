const {MessageEmbed} = require('discord.js');
const {modLogsChannel, muteRole} = require(__dirname + "/../config.js");

module.exports = {
    name: "mute",
    description: "Wycisza użytkownika na serwerze!",
    guildOnly: true,
    aliases: ["wycisz"],

    async run(msg, args) {
        //const { channel, guild, mentions, author } = msg
    
        const reasonArg = [...args].slice(1).join(" ");
    
        const userToMute = msg.mentions.users.first();

        if(modLogsChannel===undefined) {
            return msg.channel.send("Serwer dla bota nie jest poprawnie skonfigurowany!");
        }

        if (!userToMute) {
          return msg.channel.send(new MessageEmbed().setDescription(`Musisz podać osobę, którą chcesz wyciszyć!`).setColor("ff0000"));
        }
    
        if (userToMute.id === msg.author.id) {
          return msg.channel.send(new MessageEmbed().setDescription(`Nie możesz wyciszyć samego siebie!`).setColor("ff0000"));
        }

        if (userToMute.bot === true) {
            return msg.channel.send(new MessageEmbed().setDescription(`Nie możesz wyciszyć bota!`).setColor("ff0000"));
        }
    
        const memberToMute = msg.guild.members.cache.get(userToMute.id);
        let role = msg.guild.roles.cache.get(muteRole)

        if(memberToMute.roles.cache.has(role.id)) {
            return msg.channel.send(new MessageEmbed().setDescription(`Ta osoba jest już wyciszona!`).setColor("ff0000"));
        }

        const modlogChannel = msg.guild.channels.cache.get(modLogsChannel);

        let logMsg = new MessageEmbed()
            .setColor("8800cc")
            .setAuthor(userToMute.username, userToMute.displayAvatarURL({dynamic: true, size: 128, format: "png"}))
            .setDescription(`Powód: ${reasonArg ? `${reasonArg}` : `Brak.`}`)
            .addField("UserId:", `${memberToMute.id}`, true)
            .addField("Typ:", "Mute", true)
            .addField("Kiedy:", `${msg.createdAt.getUTCDate()}.${msg.createdAt.getUTCMonth()+1}.${msg.createdAt.getUTCFullYear()} ${msg.createdAt.getUTCHours()+1}:${msg.createdAt.getUTCMinutes()}`, true)
            .setFooter(`Przez: ${msg.author.username}`);

        memberToMute.roles.add(role).then((res) => {
            msg.channel.send(new MessageEmbed().setDescription(`:white_check_mark: <@!${memberToMute.id}> został wyciszony!`).setColor("00ff00"));
            modlogChannel.send(logMsg);
        });
    },
}