const {MessageEmbed, MessageAttachment} = require('discord.js');
const fs = require('fs');
const axios = require('axios').default;

module.exports = {
    name: "t",
    description: "Testowe polecenie bota! - s.mod t tag id-osoby",
    args: false,
    guildOnly: true,
    cooldown: 1,

    /* Polecenia do filtrwania kolekcji po tagu */
    /* Oczywiście zrobione źle ale kto by się tym przejmował jak to polecenie tylko dla 1 osoby */
    async run(msg, args) {

        if (!args.length) return

        const tagUser = args[0];
        const waifuUserID = args[1];

        const waifuProfile = await axios.get(`https://api.sanakan.pl/api/waifu/user/${waifuUserID}/profile`).then(({data}) => data)

        const cardsCount = ({sssCount, ssCount, sCount, aCount, bCount, cCount, dCount, eCount}) => sssCount+ssCount+sCount+aCount+bCount+cCount+dCount+eCount;

        const waifu = await axios.get(`https://api.sanakan.pl/api/waifu/user/${waifuUserID}/cards/0/${cardsCount(waifuProfile)}`).then(({data}) => data)
        let idArray = []

        waifu.forEach(card => {
            let tag = card.tags.filter(tag => tag === tagUser)
            if (tag.length) idArray.push(card.id)
        });

        fs.writeFileSync('./wids.txt', idArray.join(" "))
        const buffer = fs.readFileSync('./wids.txt');

        const attachment = new MessageAttachment(buffer, 'wids.txt');

        msg.channel.send(`Liczba kart w tagu: ${idArray.length}`, attachment);
    },
}