require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const Account = require('./models/Account.jsx');
const Branch = require('./models/Branch.jsx');

async function upsertBranch({ code, name, address }) {
    const branch = await Branch.findOneAndUpdate(
        { code },
        { $set: { code, name, address, isActive: true } },
        { new: true, upsert: true }
    );
    return branch;
}

async function upsertAccount({ username, password, fullname, email, phoneNumber, role, branch }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const update = {
        username,
        password: passwordHash,
        fullname,
        email,
        phoneNumber,
        role,
        branch: role === 'ADMIN' ? undefined : branch,
    };

    const account = await Account.findOneAndUpdate(
        { username },
        { $set: update },
        { new: true, upsert: true }
    );

    return account;
}

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error('Missing MONGO_URI in .env');
    }

    await connectDB();

    const branch1 = await upsertBranch({
        code: 'CN01',
        name: 'Chi nhánh 01',
        address: 'HCM',
    });

    const accounts = [];
    accounts.push(
        await upsertAccount({
            username: 'admin',
            password: 'Admin@123',
            fullname: 'System Admin',
            email: 'admin@evms.local',
            phoneNumber: '0900000000',
            role: 'ADMIN',
        })
    );

    accounts.push(
        await upsertAccount({
            username: 'manager_cn01',
            password: 'Manager@123',
            fullname: 'Dealer Manager CN01',
            email: 'manager.cn01@evms.local',
            phoneNumber: '0900000001',
            role: 'DEALER_MANAGER',
            branch: branch1._id,
        })
    );

    accounts.push(
        await upsertAccount({
            username: 'staff_cn01',
            password: 'Staff@123',
            fullname: 'Dealer Staff CN01',
            email: 'staff.cn01@evms.local',
            phoneNumber: '0900000002',
            role: 'DEALER_STAFF',
            branch: branch1._id,
        })
    );

    accounts.push(
        await upsertAccount({
            username: 'user_cn01',
            password: 'User@123',
            fullname: 'User CN01',
            email: 'user.cn01@evms.local',
            phoneNumber: '0900000003',
            role: 'USER',
            branch: branch1._id,
        })
    );

    console.log('Seed done. Created/updated:');
    console.log('- Branch:', { id: branch1._id.toString(), code: branch1.code, name: branch1.name });
    console.log(
        '- Accounts:',
        accounts.map((a) => ({ id: a._id.toString(), username: a.username, role: a.role, branch: a.branch?.toString?.() ?? null }))
    );

    await mongoose.connection.close();
}

main().catch(async (err) => {
    console.error('Seed failed:', err);
    try {
        await mongoose.connection.close();
    } catch (_) {
        // ignore
    }
    process.exit(1);
});
