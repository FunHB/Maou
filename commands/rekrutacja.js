const {MessageEmbed} = require("discord.js");
const {readdirSync} = require("fs");

module.exports = {
    name: "rekrutacja",
    description: "Dzięki temu poleceniu możesz wysłać swoje zgłoszenie odnośnie rekrutacji na tłumacza/korektora. ",
    args: false,
    // !rekrutacja
    usage: "<wiadomość>",
    guildOnly: true,
    cooldown: 1,
    //aliases: [],

    run(msg, args) {

        const reportChannel = msg.guild.channels.cache.get("769186897523245116");

        let reason = "";

        if(!args.length) {
            reason = "Brak wiadomości.";
        } else {
            reason = args.join(" ");
        }

        if(msg.deletable) msg.delete();
        msg.channel.send(new MessageEmbed().setColor("b348ff").setDescription(`${msg.author} Wiadomość została wysłana! \n Prosimy o cierpliwość, wkrótce zostaniesz poinformowany o dalszych czynnościach, jakie należy podjąć odnośnie rekrutacji.`).addField("Treść wiadomości:", reason));

        const reportEmbed = new MessageEmbed()
            .setColor("b348ff")
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setTitle("Zgłoszenie do rekrutacji:")
            .setDescription(`**Treść:** ${reason}`)
            .addField("Zgłoszone przez:", `Użytkownik: ${msg.author} ID: ${msg.author.id}`)
            .addField("Zgłoszono na kanale:", msg.channel)
            .addField("Czas:", `${msg.createdAt}`)

        reportChannel.send(reportEmbed);
    },
}