const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const cron = require('node-cron');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
  console.log('Client is ready!');
  // Menjalankan fungsi pengingat pembayaran setiap tanggal 15
  cron.schedule('0 0 15 * *', () => {
    sendPaymentReminder().catch(console.error);
  });

  // Menjalankan fungsi auto isolir setiap tanggal 21 jam 00:00
  cron.schedule('0 0 21 * *', () => {
    sendAutoIsolirMessage().catch(console.error);
  });
});

// Fungsi untuk mengirim pesan pengingat pembayaran
async function sendPaymentReminder() {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/reminder/payment');
    const message = response.data.message_reminder_payment;
    // Asumsi Anda memiliki API untuk mendapatkan pelanggan yang perlu pengingat
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

// Fungsi untuk mengirim pesan auto isolir
async function sendAutoIsolirMessage() {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/message/disposisi');
    const message = response.data.message_disposisi;
    // Asumsi Anda memiliki API untuk mendapatkan pelanggan untuk isolir
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
