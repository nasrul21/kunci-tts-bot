require('dotenv').config()

const TeleBot = require('telebot');
const got = require('got');

const bot = new TeleBot({
    token: process.env.BOT_TOKEN || "",
});

bot.on('/start', (msg) => {
    const msgReply = '<b>Selamat datang di Kunci TTS Bot.</b>\nTempat mencari kunci jawaban TTS Indonesia lengkap. Untuk bertanya silahkan ketik:\n<b>/tanya</b> &lt;spasi&gt; <i>pertanyaan anda</i>';
    bot.sendMessage(msg.from.id, msgReply, { parseMode: "html" });
});

bot.on(/^\/tanya (.+)$/, async (msg, props) => {
    const q = props.match[1] || "";
    const request = await got(process.env.API_URL, {
        searchParams: {
            question: q
        }
    });
    console.log(request.body);
    const { title, answers = [], total = 0 } = JSON.parse(request.body);

    const answerContent = answers.slice(0, 10).map(item => {
        const stars = ("⭐").repeat(item.stars);
        const emptyBlocks = ("⬜").repeat(5 - item.stars);
        return `${stars}${emptyBlocks} ${item.word} = <i>${item.clue}</i>`;
    });

    const msgReply = ([
        `<b>${title}</b>`,
        ...answerContent,
    ]).join("\n");

    return bot.sendMessage(
        msg.from.id,
        total > 0 ? msgReply : "<i>Maaf, jawaban tidak ditemukan</i>",
        {
            replyToMessage: msg.message_id,
            parseMode: "html"
        }
    );
});

bot.start();