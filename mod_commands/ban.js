const {MessageEmbed} = require('discord.js');
const {modLogsChannel} = require(__dirname + "/../config.js");

module.exports = {
    name: "ban",
    description: "Banuje użytkownika na serwerze!",
    guildOnly: true,
    aliases: [],

    async run(msg, args) {
        //const { channel, guild, mentions, author } = msg
    
        const reasonArg = [...args].slice(1).join(" ");
    
        const userToBan = msg.mentions.users.first();

        if(modLogsChannel===undefined) {
            return msg.channel.send("Serwer dla bota nie jest poprawnie skonfigurowany!");
        }

        if (!userToBan) {
          return msg.channel.send(new MessageEmbed().setDescription(`Musisz podać osobę, którą chcesz zbanować!`).setColor("ff0000"));
        }
    
        if (userToBan.id === msg.author.id) {
          return msg.channel.send(new MessageEmbed().setDescription(`Nie możesz zbanować samego siebie!`).setColor("ff0000"));
        }

        if (userToBan.bot === true) {
            return msg.channel.send(new MessageEmbed().setDescription(`Nie możesz zbanować bota!`).setColor("ff0000"));
        }
    
        const memberToBan = msg.guild.members.cache.get(userToBan.id);

        if (!memberToBan.bannable) {
          return msg.channel.send(new MessageEmbed().setDescription(`Nie masz wystarczających uprawnień, aby zbanować tego użytkownika!`).setColor("ff0000"));
        }
        
        const modlogChannel = msg.guild.channels.cache.get(modLogsChannel);

        let logMsg = new MessageEmbed()
            .setColor("ff0000")
            .setAuthor(userToBan.username, userToBan.displayAvatarURL({dynamic: true, size: 128, format: "png"}))
            .setDescription(`Powód: ${reasonArg ? `${reasonArg}` : `Brak.`}`)
            .addField("UserId:", `${memberToBan.id}`, true)
            .addField("Typ:", "Ban", true)
            .addField("Kiedy:", `${msg.createdAt.getUTCDate()}.${msg.createdAt.getUTCMonth()+1}.${msg.createdAt.getUTCFullYear()} ${msg.createdAt.getUTCHours()+1}:${msg.createdAt.getUTCMinutes()}`, true)
            .setFooter(`Przez: ${msg.author.username}`);

        const banOptions = {
            reason: reasonArg,
        }

        memberToBan.ban(banOptions).then((res) => {
            msg.channel.send(new MessageEmbed().setDescription(`:white_check_mark: <@!${memberToBan.id}> został zbanowany!`).setColor("00ff00"));
            modlogChannel.send(logMsg);
        });

      },
}