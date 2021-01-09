const {MessageEmbed} = require('discord.js');
const {modLogsChannel} = require(__dirname + "/../config.js");

module.exports = {
    name: "kick",
    description: "Wyrzuca użytkownika z serwera!",
    guildOnly: true,
    aliases: ["wyrzuc", "wyrzuć"],

    async run(msg, args) {
        //const { channel, guild, mentions, author } = msg
    
        const reasonArg = [...args].slice(1).join(" ");
    
        const userToKick = msg.mentions.users.first();

        if(modLogsChannel===undefined) {
            return msg.channel.send("Serwer dla bota nie jest poprawnie skonfigurowany!");
        }

        if (!userToKick) {
          return msg.channel.send(new MessageEmbed().setDescription(`Musisz podać osobę, którą chcesz wyrzucić!`).setColor("ff0000"));
        }
    
        if (userToKick.id === msg.author.id) {
          return msg.channel.send(new MessageEmbed().setDescription(`Nie możesz wyrzucić samego siebie!`).setColor("ff0000"))
        }

        if (userToKick.bot === true) {
            return msg.channel.send(new MessageEmbed().setDescription(`Nie możesz wyrzucić bota!`).setColor("ff0000"))
        }
    
        const memberToKick = msg.guild.members.cache.get(userToKick.id);

        if (!memberToKick.kickable) {
          return msg.channel.send(new MessageEmbed().setDescription(`Nie masz wystarczających uprawnień, aby wyrzucić tego użytkownika!`).setColor("ff0000"))
        }
        
        const modlogChannel = msg.guild.channels.cache.get(modLogsChannel);

        let logMsg = new MessageEmbed()
            .setColor("ffa500")
            .setAuthor(userToKick.username, userToKick.displayAvatarURL({dynamic: true, size: 128, format: "png"}))
            .setDescription(`Powód: ${reasonArg ? `${reasonArg}` : `Brak.`}`)
            .addField("UserId:", `${memberToKick.id}`, true)
            .addField("Typ:", "Kick", true)
            .addField("Kiedy:", `${msg.createdAt.getUTCDate()}.${msg.createdAt.getUTCMonth()+1}.${msg.createdAt.getUTCFullYear()} ${msg.createdAt.getUTCHours()+1}:${msg.createdAt.getUTCMinutes()}`, true)
            .setFooter(`Przez: ${msg.author.username}`);

        memberToKick.kick(reasonArg).then((res) => {
            msg.channel.send(new MessageEmbed().setDescription(`:white_check_mark: <@!${memberToKick.id}> został wyrzucony!`).setColor("00ff00"))
            modlogChannel.send(logMsg)
        });

      },
}