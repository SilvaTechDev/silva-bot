require('dotenv').config();
module.exports = {
    SESSION_ID: process.env.SESSION_ID || '',
    PORT: process.env.PORT || 9090,
    BOT_NAME: process.env.BOT_NAME || 'SilvaBot'
};
