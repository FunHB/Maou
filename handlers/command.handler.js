const {Collection} = require("discord.js");
const {readdirSync} = require("fs");

const {prefix, owner} = require(__dirname + "/../config.js");

module.exports = (client) => {
    client.commands = new Collection();
    const cooldowns = new Collection();

    // Command load
    const commandFile = readdirSync(__dirname + "/../commands");

    for (const file of commandFile){
        const command = require(__dirname + `/../commands/${file}`);
        
        if (command.name){
            client.commands.set(command.name, command)
            console.log(`${file} loaded!`);
        } else {
            console.log(`${file} missing!`);
        }

    };


    client.on('message', (msg) => {

        const {author, guild, channel} = msg;
        // //Check if user is a bot
        if (author.bot) return;

        // ignore message without prefix
        if (!msg.content.startsWith(prefix)) return; 
        //723113830464618556 id #polecenia-bota
        // Check channel commands
        if (msg.channel.id !== "723113830464618556" && author.id !== owner && msg.content !== prefix && msg.content !== prefix+"report" && msg.content !== prefix+"raport" && msg.content !== prefix+"zglos" && msg.content !== prefix+"zgłoś" && msg.content !== prefix+"zgłos" && msg.content !== prefix+"zgloś") return msg.reply(`Poleceń możesz używać na kanele <#723113830464618556>!`);
        //if (msg.channel.id !== "723113830464618556" && author.id !== owner && msg.content !== prefix) return msg.reply(`Poleceń możesz używać na kanele <#723113830464618556>!`);
    
        const args = msg.content.slice(prefix.length).trim().split(/ +/g);
        const cmdName = args.shift().toLowerCase();
        

        const cmd = client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));


        // Check if command exist
        if(!cmd) return;
        
        
        if (cmd.guildOnly && !guild) return msg.reply(`Poleceń możesz używać tylko na serwerze Discord - Maou Subs!`);

        // Check bot permissions
        if (cmd.botPermissions && cmd.botPermissions.length) {
            if (!guild.me.permissionsIn(channel).has(cmd.botPermissions)){
                return channel.send(`Brakuje mi uprawnien do wykonania tej komendy: \`${cmd.botPermissions.join("`, `")}\`.`)
            }
        }

        // Check bot permissions
        if (cmd.userPermissions && cmd.userPermissions.length) {
            if (!msg.member.permissionsIn(channel).has(cmd.userPermissions)) {
                return msg.reply("Nie masz uprawnien do używania tej komendy!")
            }
        }

        if (cmd.args && !args.length) {
            let reply = `Nie podałeś żadnych argumentów ${msg.author}!`;

            if (cmd.usage) {
                reply += `\nPolecenie powinno wyglądać tak: \`${prefix}${cmdName} ${cmd.usage}\``
            }
            return msg.channel.send(reply);
        }

        // Check cooldowns
        if(!cooldowns.has(cmdName)) {
            cooldowns.set(cmdName, new Collection());
        }

        const date = Date.now();
        const timestamps = cooldowns.get(cmdName);
        const cooldownAmount = (cmd.cooldown || 3) * 1000;

        if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id) + cooldownAmount;

            if (date < expirationTime) {
                const timeLeft = (expirationTime - date) / 1000;
                return msg.reply(`Polecenie \`${cmdName}\` możesz uzyć dopiero za ${timeLeft.toFixed(1)} sekund.`);
            }
        }

        timestamps.set(author.id, date);
        setTimeout(() => {
            timestamps.delete(author.id);
        }, cooldownAmount);

        try {
            cmd.run(msg, args);
        } catch(error) {
            console.error(error);
            msg.reply("Nie wywołano polecenia! Ten bot coś popsuty :sob:");
        }
        
    });

}

