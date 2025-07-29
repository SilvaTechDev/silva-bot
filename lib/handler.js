const fs = require('fs');
const path = require('path');
const config = require('../config');
const prefix = '!';

async function handler(sock, m) {
  try {
    if (!m.message) return;
    const from = m.key.remoteJid;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    const plugins = fs
      .readdirSync(path.join(__dirname, '..', 'plugins'))
      .filter(f => f.endsWith('.js'));

    for (const file of plugins) {
      const plugin = require(`../plugins/${file}`);
      if (plugin.command === command) {
        await plugin.run(sock, m, args);
        break;
      }
    }
  } catch (err) {
    console.error('Handler error:', err);
  }
}

module.exports = { handler };
