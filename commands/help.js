const { prefix } = require("../config");

module.exports = {
    name: "help",
    description: "Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu.",
    // !help <komenda>
    usage: "<komenda>",
    guildOnly: true,
    cooldown: 2,
    aliases: ["pomoc","h"],

    run(msg, args) {

        const {commands} = msg.client;

        const data = [];

        if (!args.length) {
            data.push("Lista poleceń bota:");
            data.push(commands.map((command) => `\`${command.name}\``).join(", "));
            data.push(`\nMożesz wyświetlić informacje na temat pojedynczego polecenia użyj: \`${prefix}pomoc [polecenie]\``);

            return msg.channel.send(data, {slit: true}).catch(err => {
                console.error(`Could not send help to ${msg.author.tag}.\n`, err);
                msg.reply("O nie! Coś się stało i nie udało mi się wysłać wiadomości! Co teraz? :scream:");
            })
        } 
        
        const name = args[0].toLowerCase();

        const command = commands.get(name) || commands.find((c) => c.aliases && c.aliases.includes(name));
    
        if (!command) {
            return msg.reply("Taka komenda nie istnieje!");
        }
    
        data.push(`**Nazwa:** ${command.name}`);
    
        if(command.aliases) data.push(`**Aliasy:** ${command.aliases.join(", ")}`);
        if(command.description) data.push(`**Opis:** ${command.description}`);
        if(command.usage) data.push(`**Użycie:** ${prefix}${command.name} ${command.usage}`);
    
        msg.channel.send(data, {split: true});

    },
}