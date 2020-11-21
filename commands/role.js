const { Guild } = require("discord.js");

const { prefix } = require("../config");

// Wszystko do przerobienia na później...
// i to w sumie pilne bo nie da się dodawać roli w wygodny sposób

module.exports = {
    name: "role",
    description: "Pozwala ndać/zdjąć/wyświetlić role.",
    // !help <komenda> [nazwa roli]
    usage: "<pokaż/nadaj/zdejmij> [nazwa roli]",
    guildOnly: true,
    cooldown: 5,
    aliases: ["rola", "rolę"],

    run(msg, args) {

        let msgAuthor =  msg.author;

        const commands = ["pokaż", "nadaj", "zdejmij"];
        const aliases = ["pokaz", "show", "add", "remove"];
        const roles = ["odcinki"];
        //const rolesC = ["Youkai", "Ayakashi", "Mononoke", "Yousei", "Shiryou"];

        const guildRoles = {ODCINKI: "768065437807542292",};

        //const colorRoles = {YOUKAI: "",
                            // AYAKASHI: "",
                            // MONONOKE: "", 
                            // YOUSEI: "",  
                            // SHIRYOU: "",};


        //// sprawdzić role czy ktoś ma 

        const data = [];

        if (!args.length) {
            data.push(`**Lista opcji dla polecenia** \`${prefix}role\`:`);
            data.push(commands.map((command) => `\`${command}\``).join(", "));
            data.push(`\n**Alliasy:**:`);
            data.push(aliases.map((alias) => `\`${alias}\``).join(", "));
            data.push(`\nMożesz wyświetlić listę roli możliwych do nadania używająć polecenia: \`${prefix}role pokaż\``);
            data.push(`\nMożesz nadać sobie rolę używająć polecenia: \`${prefix}role nadaj [rola]\``);
            data.push(`\nMożesz zdjąć sobie rolę, nadaną wcześniej używająć polecenia: \`${prefix}role zdejmij [rola]\``);

            return msg.channel.send(data, {slit: true}).catch(err => {
                console.error(`Could not send role help to ${msg.author.tag}.\n`, err)
                msg.reply("O nie! Coś się stało i nie udało mi się wysłać wiadomości! Co teraz? :scream:")
            })
        } 
        
        const name = args[0].toLowerCase();
        const role = args[1];

        switch(name) {
            case "pokaż":
                if (role == undefined) {
                    data.push(`Wszystkie role możliwe do samodzielnego nadania:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    data.push("Dzięki roli \`odcinki\` będziesz otrzymywał powiadomienie o nowych odcinkach przetłumaczonych przez grupę Maou Subs!");
                } else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            case "pokaz":
                if (role == undefined) {
                    data.push(`Wszystkie role możliwe do samodzielnego nadania:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    data.push("Dzięki roli \`odcinki\` będziesz otrzymywał powiadomienie o nowych odcinkach przetłumaczonych przez grupę Maou Subs!");
                } else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            case "show":
                if (role == undefined) {
                    data.push(`Wszystkie role możliwe do samodzielnego nadania:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    data.push("Dzięki roli \`odcinki\` będziesz otrzymywał powiadomienie o nowych odcinkach przetłumaczonych przez grupę Maou Subs!");
                } else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            case "nadaj":
                if (role == undefined) {
                    data.push(`${msgAuthor} Nie podałeś roli którą chcesz sobie nadać!`);
                    data.push(`\nWszystkie role możliwe do samodzielnego nadania:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    const member = msg.member
                    member.roles.add(guildRoles.ODCINKI)
                    data.push(`${msgAuthor} Nadano role \`odcinki\`!`);
                    data.push(`\nMożesz zdjąć sobie rolę, nadaną wcześniej używająć polecenia: \`${prefix}role zdejmij [rola]\``);
                } 
                // else if ((role.toLowerCase()) == "youkai") {
                //     // YOUKAI
                //     const member = msg.member
                //     member.roles.add(guildRoles.YOUKAI)
                //     data.push(`${msgAuthor} Nadano role \`Youkai\`!`);
                //     data.push(`\nMożesz zdjąć sobie rolę, nadaną wcześniej używająć polecenia: \`${prefix}role zdejmij [rola]\``);
                // } 
                else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            case "add":
                if (role == undefined) {
                    data.push(`${msgAuthor} Nie podałeś roli którą chcesz sobie nadać!`);
                    data.push(`\nWszystkie role możliwe do samodzielnego nadania:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    const member = msg.member
                    member.roles.add(guildRoles.ODCINKI)
                    data.push(`${msgAuthor} Nadano role \`odcinki\`!`);
                    data.push(`\nMożesz zdjąć sobie rolę, nadaną wcześniej używająć polecenia: \`${prefix}role zdejmij [rola]\``);
                } else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            case "zdejmij":
                if (role == undefined) {
                    data.push(`${msgAuthor} Nie podałeś roli którą chcesz zdjąć!`);
                    data.push(`\nSpis wszystkich roli:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    const member = msg.member
                    member.roles.remove(guildRoles.ODCINKI)
                    data.push(`${msgAuthor} Zdjęto role \`odcinki\`!`);
                } else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            case "remove":
                if (role == undefined) {
                    data.push(`${msgAuthor} Nie podałeś roli którą chcesz zdjąć!`);
                    data.push(`\nSpis wszystkich roli:`);
                    data.push(roles.map((r) => `\`${r}\``).join(", "));
                    // data.push(`Rangi nadające kolor:`);
                    // data.push(rolesC.map((r) => `\`${r}\``).join(", "));
                    data.push(`\nMożesz wyświetlić informacje o danej roli używająć polecenia: \`${prefix}role pokaż [rola]\``);
                } else if ((role.toLowerCase()) == "odcinki") {
                    const member = msg.member
                    member.roles.remove(guildRoles.ODCINKI)
                    data.push(`${msgAuthor} Zdjęto role \`odcinki\`!`);
                } else {
                    return msg.reply("taka rola nie istnieje!");
                }
                break;
            default:
                data.push(`${msgAuthor} Takie polecenie nie istnieje!`);
                data.push(`\nSprawdź \`${prefix}role pokaż\` aby wyświetlić spis roli!`);
        }

        msg.channel.send(data, {split: true})

    },
}