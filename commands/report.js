const {MessageEmbed, Permissions: { FLAGS }} = require("discord.js");
const {readdirSync} = require("fs");

const {reportsChannel} = require(__dirname + "/../config.js");

module.exports = {
    name: "report",
    description: "Dzięki niej możesz zgłosić wiadomośc użytkownika.",
    args: false,
    // !report <id wiadomości> [powód zgłoszenia]
    usage: "<id wiadomości> [powód zgłoszenia]",
    guildOnly: true,
    cooldown: 1,
    aliases: ["raport", "zgłoś", "zgloś", "zgłos", "zglos"],

    run(msg, args) {

        if (!args.length) return msg.channel.send(new MessageEmbed().setColor("222222").setDescription("Wydaje mi się, że nie podałeś wystarczająco dużo argumentów.\n\n Polecenie powinno wyglądać tak: \`!zgłoś <ID wiadomości> [powód zgłoszenia]\` \n\n Na przykład: \`!zgłoś 769249115443036162 Tak się nie robi!\`"));

        var reportChannel = msg.guild.channels.cache.get(reportsChannel);

        const reported = args[0];
        
        if(isNaN(parseInt(reported))) return msg.channel.send(new MessageEmbed().setColor("222222").setDescription("To nawet nie jest liczba! Musisz podać ID wiadomości, którą chcesz zgłosić."));

        if(reported.length!=18) return msg.channel.send(new MessageEmbed().setColor("222222").setDescription("Coś krótka ta wiadomość.. jak dla mnie ID to to nie jest :("));

        if(!args[1]) return msg.channel.send(new MessageEmbed().setColor("222222").setDescription('Musisz podać powód zgłoszenia!'));

        if(msg.deletable) msg.delete();
        msg.channel.send(new MessageEmbed().setColor("1717c2").setDescription('Wiadomość została zgłoszona!'));

        reason = args.join(" ").slice(18);

        let reportLink = "https://discord.com/channels/"+msg.guild.id+"/"+msg.channel+"/"+reported;

        const reportEmbed = new MessageEmbed()
            .setColor("4100aa")
            .setDescription("Report")
            .addField("Zgłoszone przez:", `Użytkownik: ${msg.author} ID: ${msg.author.id}`)
            .addField("Zgłoszono na kanale:", msg.channel)
            .addField("Id zgłoszonej wiadmości:", reported)
            .addField("Link do zgłoszonej wiadomości:", reportLink)
            .addField("Czas:", msg.createdAt)
            .addField("Powód:", reason)


        reportChannel.send(reportEmbed);
    },
}