const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const readline = require('readline');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
  webVersionCache: {
    type: "remote",
    remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
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
        let trimmedNumber = number.trim();
        try {
            let numberId = await client.getNumberId(trimmedNumber);
            if (!numberId && trimmedNumber.slice(0, 2) !== '44') { // Check if it doesn't start with 44
                trimmedNumber = '44' + trimmedNumber; // Prepend '44' to the number
                numberId = await client.getNumberId(trimmedNumber); // Try again with the new number
            }
            if (numberId) {
                console.log(`${trimmedNumber} is registered on WhatsApp.`);
                liveNumbers.push(trimmedNumber);
            } else {
                console.log(`${trimmedNumber} is not registered on WhatsApp.`);
            }
        } catch (error) {
            console.error(`Error retrieving WhatsApp ID for ${trimmedNumber}:`, error);
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
