const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const cron = require('node-cron');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false, // Set to true for headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
      '--single-process', // Mungkin membantu mengurangi penggunaan memori
      '--disable-background-timer-throttling' // Mencegah Chromium menghentikan background timer secara agresif
    ]
  },
  // Use a remote file to define the web version to overcome update issues
  webVersionCache: {
    type: "remote",
    remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  }
});

client.on('qr', (qr) => {
  // Display QR code in the console for testing purposes
  console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
  console.log('Client is ready!');
  // Run payment reminder function every 15th of the month
  cron.schedule('0 0 15 * *', () => {
    sendPaymentReminder().catch(console.error);
  });

  // Run auto isolir function every 21st at 00:00
  cron.schedule('0 0 21 * *', () => {
    sendAutoIsolirMessage().catch(console.error);
  });
});

// Function to send payment reminders
async function sendPaymentReminder() {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reminder/payment');
    const message = response.data.message_reminder_payment;
    const customersResponse = await axios.get('http://127.0.0.1:8000/api/customers-reminder');
    const customers = customersResponse.data;

    for (let customer of customers) {
      let number = customer.nomor_telepon;
      let chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      client.sendMessage(chatId, message).then(response => {
        console.log('Reminder sent to:', chatId);
      }).catch(err => {
        console.error('Failed to send reminder:', err);
      });
    }
  } catch (error) {
    console.error('Error when sending payment reminders:', error);
  }
}

// Function to send auto isolir messages
async function sendAutoIsolirMessage() {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/message/disposisi');
    const message = response.data.message_disposisi;
    const customersResponse = await axios.get('http://127.0.0.1:8000/api/customers-disposisi');
    const customers = customersResponse.data;

    for (let customer of customers) {
      let number = customer.nomor_telepon;
      let chatId = number.includes('@c.us') ? number : `${number}@c.us`;
      client.sendMessage(chatId, message).then(response => {
        console.log('Isolir message sent to:', chatId);
      }).catch(err => {
        console.error('Failed to send isolir message:', err);
      });
    }
  } catch (error) {
    console.error('Error when sending auto isolir messages:', error);
  }
}

client.initialize();
