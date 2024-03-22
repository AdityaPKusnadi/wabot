const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false },
});

client.on('qr', (qr) => {
    console.log(qr)
});

client.on('ready', () => {
    console.log('Client is ready!');
});

//proses dimana ketika pesan masuk ke bot
client.on('message', async message => {
    //mengecek pesan yang masuk sama dengan halo jika benar balas dengan opo cuy!!
    if(message.body ==='hai'){
        // membalas pesan
        message.reply('ok friend!')
    }
});

client.on('message', msg => {
    if (msg.body == 'otp') {
        msg.reply('pong');
    }
});

client.on('disconnected', (reason) => {
    console.log('disconnect whatsapp-bot', reason);
});

client.initialize();
