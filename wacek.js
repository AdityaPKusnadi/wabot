const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async () => {
    console.log('Client is ready!');
    const fileStream = fs.createReadStream('telp.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const liveNumbers = [];

    for await (const number of rl) {
        const numberId = await client.getNumberId(number.trim());
        if (numberId) {
            console.log(`${number} is registered on WhatsApp.`);
            liveNumbers.push(number);
        } else {
            console.log(`${number} is not registered on WhatsApp.`);
        }
    }

    fs.writeFile('live.txt', liveNumbers.join('\n'), err => {
        if (err) {
            console.error('Error writing live numbers to file:', err);
        } else {
            console.log('Registered numbers have been saved to live.txt');
        }
    });
});

client.initialize();