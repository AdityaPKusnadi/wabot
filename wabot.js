const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise'); // menggunakan mysql2 dengan support Promise

// Konfigurasi koneksi database
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'act'
};

// Membuat koneksi database
const db = mysql.createPool(dbConfig);

// Fungsi untuk mengecek pembayaran dan mengirim notifikasi
async function checkPaymentsAndNotify() {
  try {
    // Membuat koneksi ke database
    const connection = await db.getConnection();

    // Query untuk mengecek pesanan yang sudah dibayar tapi belum dikirim notifikasi
    const [orders] = await connection.query('SELECT a.*,b.nomor_telepon,b.email FROM `order` a LEFT JOIN pelanggan b ON (a.id_pelanggan=b.id) WHERE a.posting_status=1 AND a.statuswa=0 AND a.id_pembayaran IS NOT NULL');

    for (let order of orders) {
      // Mengirim notifikasi menggunakan WhatsApp
      let number = order.nomor_telepon; // Pastikan nomor sudah dalam format internasional dan sesuai dengan WhatsApp
      console.log(number);
      let message = 'Pembayaran berhasil!';
      let chatId = number.includes('@c.us') ? number : `${number}@c.us`;

      client.sendMessage(chatId, message).then(response => {
        // Pesan berhasil dikirim
            console.log('Message sent to:', chatId);
        }).catch(err => {
            // Terjadi kesalahan saat mengirim pesan
            console.error('Failed to send message:', err);
        });

      // Update statuswa menjadi 1 untuk menandakan notifikasi sudah dikirim
      await connection.query('UPDATE `order` SET statuswa=1 WHERE id=?', [order.id]);
    }

    // Melepaskan koneksi
    connection.release();
  } catch (error) {
    console.error('Error when checking payments and sending notifications:', error);
  }
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

client.on('qr', (qr) => {
    console.log(qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
    // Menjalankan fungsi checkPaymentsAndNotify setiap 1 menit (60000 ms)
    setInterval(() => {
        checkPaymentsAndNotify().catch(console.error);
    }, 60000);
});


// Kode lainnya...

client.initialize();
