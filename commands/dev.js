const { Permissions: { FLAGS } } = require("discord.js");
const { prefix } = require("../config");


module.exports = {
    name: "dev",
    description: "Polecenia dla administratorów :alien:",
    // !dev <polecenie> [wartości]
    usage: "<polecenie> [wartości]",
    guildOnly: true,
    cooldown: 1,
    botPermiissions: [FLAGS.ADMINISTRATOR],
    userPermissions: [FLAGS.ADMINISTRATOR],

    run(msg, args) {
        const {channel} = msg;

        let member = msg.mentions.users.first()
        let msgAuthor =  msg.author
        const commands = ["clear", "kick", "ban", "mute", "unmute"];

        const data = [];

        if (!args.length) {
            data.push("Lista poleceń \`dev\` dla administratora:");
            data.push(commands.map((command) => `\`${command}\``).join(", "));
            data.push(`\nAby użyć wpisz: \`${prefix}dev ${this.usage}\``);

            return msg.channel.send(data, {slit: true}).catch(err => {
                console.error(`Could not send help to ${msg.author.tag}.\n`, err)
                msg.reply("O nie! Coś się stało i nie udało mi się wysłać wiadomości! Co teraz? :scream:")
            })
        } 
        
        const name = args[0].toLowerCase();

        switch(name) {
            case "clear":
                const amount = parseInt(args[1]);
                if(!Number.isInteger(amount)){
                    data.push(`${msgAuthor} Musisz podać liczbę wiadomości do usunięcia!`);
                    data.push(`\nAby użyć wpisz: \`${prefix}dev clear [wartość]\``);
                } else if (amount < 2 || amount > 200){
                    data.push(`${msgAuthor} Możesz usunąć minimalnie 2 wiadomości, a maksymalnie 200!`);
                } else {
                    channel.bulkDelete(amount);
                    data.push(`${msgAuthor} Usunięto ${amount} wiadomości!`)
                }
                break;
            case "kick":
                data.push("nie ma jeszcze polecenia kick");
                break;
            case "ban":
                data.push("nie ma jeszcze polecenia ban");
                break;
            case "mute":
                data.push("nie ma jeszcze polecenia mute");
                break;
            case "unmute":
                data.push("nie ma jeszcze polecenia unmute");
                break;
            default:
                data.push("Takie polecenie nie istnieje!");
                data.push(`\nSprawdź: \`${prefix}dev\` aby wyświetlić polecenia administratora.`);
        }
    
        msg.channel.send(data, {split: true})

    },
}