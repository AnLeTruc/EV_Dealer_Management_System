const crypto = require('crypto');

function randomString(length, charset) {
    const bytes = crypto.randomBytes(length);
    let output = '';

    for (let i = 0; i < length; i += 1) {
        output += charset[bytes[i] % charset.length];
    }

    return output;
}

function generatePassword() {
    // Friendly charset (no confusing 0/O, 1/l/I) and no special chars.
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    return randomString(12, charset);
}

module.exports = {
    randomString,
    generatePassword,
};
