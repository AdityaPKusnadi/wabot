const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
  webVersionCache: {
    type: "remote",
    remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

client.on('qr', (qr) => {
    console.log('Please scan QR Code:', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
    sendMessages();
});

async function sendMessages() {
    try {
        const data = fs.readFileSync('telp.txt', 'utf8');
        const numbers = data.split('\n'); // Assuming each number is on a new line

        for (const number of numbers) {
            if (!number.trim()) continue; // Skip empty lines
            const chatId = number.trim().includes('@c.us') ? number.trim() : `${number.trim()}@c.us`;
            try {
                const name = "Customer Name"; // Ideally, this would be fetched from a database
                const websiteName = "Amazon";
                const otpCode = "856243"; // Generate OTP code
                const websiteLink = "https://servl-lnt.github.io";
                const contactInfo = "support@amazon.com";

                const message = `Hi ${name},\n\nWe're processing your payment on ${websiteName}. Please verify your transaction with this OTP: ${otpCode}\n\nEnter the OTP on our site within 10 mins.\n\nNote: OTP expires in 10 mins. Problems? Didn't buy anything? Click here: ${websiteLink} or contact us at ${contactInfo}.\n\nThanks,\n${websiteName} Team`;
                await client.sendMessage(chatId, message);
                console.log('Message sent to:', chatId);
            } catch (err) {
                console.error('Failed to send message to', chatId, ':', err);
            }
            await sleep(180000); // Wait for 3 minutes before sending the next message
        }
    } catch (err) {
        console.error('Failed to read file or send messages:', err);
    }
}

client.initialize();
