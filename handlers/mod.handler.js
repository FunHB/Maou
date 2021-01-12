const {MessageEmbed} = require('discord.js');
const {prefix, owner, modRole} = require(__dirname + "/../config.js");
const {readdirSync} = require("fs");

const mod_prefix = `${prefix}mod`;

module.exports = {
    mod_prefix: mod_prefix,

    
    async on(msg) {

        const commands = new Array();
        const commandFile = readdirSync(__dirname + "/../mod_commands");

        if (!msg.guild) return msg.reply(`Poleceń możesz używać tylko na serwerze Discord - Maou Subs!`);

        // Chcek mod role
        let role = msg.guild.roles.cache.get(modRole) || modRole;
        if(!msg.member.roles.cache.has(role.id) && msg.author.id !== owner) {
            return msg.channel.send(new MessageEmbed().setImage("https://i.giphy.com/RX3vhj311HKLe.gif").setColor("ff0000"));
        }

        // load commands
        for (const file of commandFile){
            const command = require(__dirname + `/../mod_commands/${file}`);
            
            if (command.name){
                commands.push(command)
                console.log(`${file} loaded!`);
            } else {
                console.log(`${file} missing!`);
            }
    
        };

        const args = msg.content.slice(mod_prefix.length).trim().split(/ +/g);
        const cmdName = args.shift().toLowerCase();
        const cmd = commands.find(cmd => cmd.name===cmdName);

        // Check if mod command exist
        if(!cmd) return;

        // Run command
        cmd.run(msg, args)
    },
}