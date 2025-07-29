const fs = require('fs');
const path = require('path');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const express = require('express');
const { ensureSession } = require('./lib/sessionManager');
const { handler } = require('./lib/handler');

(async () => {
  await ensureSession(config.SESSION_ID);

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: [config.BOT_NAME, 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages || !messages[0]) return;
    await handler(sock, messages[0]);
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed:', lastDisconnect.error, '| Reconnect:', shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  const app = express();
  app.get('/', (req, res) => res.send(`🤖 ${config.BOT_NAME} is running!`));
  app.listen(config.PORT, () => console.log(`🌐 ${config.BOT_NAME} health-check on port ${config.PORT}`));

})().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
