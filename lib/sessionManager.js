const fs = require('fs-extra');
const path = require('path');
const { File } = require('megajs');

async function ensureSession(sessionIdWithPrefix) {
  const sessionDir = path.join(__dirname, '..', 'sessions');
  const credsPath = path.join(sessionDir, 'creds.json');

  if (!fs.existsSync(credsPath)) {
    if (!sessionIdWithPrefix || !sessionIdWithPrefix.startsWith('silva~')) {
      throw new Error('Invalid SESSION_ID: must start with "silva~"');
    }
    const sessId = sessionIdWithPrefix.replace('silva~', '');
    const url = `https://mega.nz/file/${sessId}`;
    const file = File.fromURL(url);
    await file.loadAttributes();

    const buffer = await file.downloadBuffer();
    await fs.ensureDir(sessionDir);
    await fs.writeFile(credsPath, buffer);

    console.log('[+] Session downloaded and saved to sessions/creds.json');
  }

  return credsPath;
}

module.exports = { ensureSession };
