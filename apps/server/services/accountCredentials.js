const Account = require('../models/Account.jsx');
const { randomString } = require('../utils/credential');

async function generateUniqueUsername() {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = `u_${randomString(10, charset)}`;
        const exists = await Account.exists({ username: candidate });
        if (!exists) return candidate;
    }

    throw new Error('Could not generate a unique username');
}

module.exports = {
    generateUniqueUsername,
};
