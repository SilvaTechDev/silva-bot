const config = require('../config');
module.exports = {
  command: 'ping',
  run: async (sock, m) => {
    await sock.sendMessage(m.key.remoteJid, {
      text: `${config.BOT_NAME} is alive! 🏓`
    }, { quoted: m });
  }
};
