const bcrypt = require('bcryptjs');
const Account = require('../models/Account.jsx');
const RefreshToken = require('../models/RefreshToken');
const {v4 : uuidv4} = require('uuid'); // Generating unique IDs if needed

const { generatePassword } = require('../utils/credential');
const { generateUniqueUsername } = require('../services/accountCredentials');
const { signAccessToken, signRefreshToken} = require('../middlewares/jwt');

// Create new account
exports.createAccount = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, branch, role } = req.body;

        const creator = req.user;
        if (!creator) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!fullname || !email || !phoneNumber || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (creator.role !== 'ADMIN' && role === 'ADMIN') {
            return res.status(403).json({ message: 'Only ADMIN can create ADMIN accounts' });
        }

        // System admin can create accounts for any branch by providing `branch`.
        let effectiveBranch = branch;
        if (role === 'ADMIN') {
            effectiveBranch = undefined;
        } else if (creator.role !== 'ADMIN') {
            if (!creator.branch) {
                return res.status(403).json({ message: 'Your account has no branch assigned' });
            }
            effectiveBranch = creator.branch;
        } else if (!effectiveBranch) {
            return res.status(400).json({ message: 'Branch is required for non-admin accounts' });
        }

        //username & password generation
        const username = await generateUniqueUsername();
        const plainPassword = generatePassword();
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const account = await Account.create({
            username,
            password: passwordHash,
            fullname,
            email,
            phoneNumber,
            branch: effectiveBranch,
            role,
        });

        return res.status(201).json({
            message: 'Account created',
            data: {
                _id: account._id,
                username,
                password: plainPassword,
            },
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({
                message: 'Duplicate field value',
                fields: err.keyValue,
            });
        }

        return res.status(500).json({
            message: 'Failed to create account',
            error: err?.message,
        });
    }
};

// Login account
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing username or password' });
        }

        //Check account existence
        const account = await Account.findOne({ username });
        if (!account) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        //Verify password
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        //Generate access token
        const accessToken = signAccessToken(account);

        //Generate refresh token
        const jti = uuidv4(); //Token id
        const refreshToken = signRefreshToken (account, jti);

        //Store refresh token in DB
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        await RefreshToken.create({
            user: account._id,
            jti: jti,
            tokenHash: tokenHash,
            expiresAt: new Date(Date.now() + 7*24*60*60*1000), // 7 days
        });

        //Set cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/api/auth/refresh-token',
            maxAge: 7*24*60*60*1000, //7 days
        });

        return res.status(200).json({
            message: 'Login success',
            data: {
                accessToken,
                account: {
                    _id: account._id,
                    username: account.username,
                    fullname: account.fullname,
                    email: account.email,
                    phoneNumber: account.phoneNumber,
                    role: account.role,
                    branch: account.branch ?? null,
                },
            },
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Login failed',
            error: err?.message,
        });
    }
};

exports.refreshToken = async (req, res) => {
    try{
        //Get refresh token from cookies
        const {refreshToken} = req.cookies;

        if(!refreshToken){
            return res.status(401).json({message: 'Missing refresh token'});
        }

        //Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        //Check token existence in DB
        const tokenDoc = await RefreshToken.findOne({
            jti: decoded.jti, 
            user: decoded.sub, 
            revokeAt: null
        });

        //Invalid token
        if(!tokenDoc || tokenDoc.revokeAt){
            return res.status(401).json({message: 'Invalid refresh token'});
        }

        //Check token hash
        const isMatch = await bcrypt.compare(refreshToken, tokenDoc.tokenHash);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid refresh token'});
        }

        //Token rotation
            //Revoke old token
            tokenDoc.revokeAt = new Date();
            await tokenDoc.save();
            //Get current account
            const account = await Account.findById(decoded.sub);
            if(!account){
                return res.status(404).json({message: 'Account not found'});
            }
            //Generate new tokens
            const newAccessToken = signAccessToken(account);
            const newJti = uuidv4();
            const newRefreshToken = signRefreshToken(account, newJti);
            //Store new refresh token
            const newTokenHash = await bcrypt.hash(newRefreshToken, 10);
            await RefreshToken.create({
                user: account._id,
                jti: newJti,
                tokenHash: newTokenHash,
                expiresAt: new Date(Date.now() + 7*24*60*60*1000), // 7 days
            });
            //Set cookies
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                path: '/api/auth/refresh-token',
                maxAge: 7*24*60*60*1000, //7 days
            });
            //Return new tokens
            return res.status(200).json({
                message: 'Token refreshed',
                data: {
                    accessToken: newAccessToken,
                },
            });
        } catch (err){
            return res.status(500).json({
                message: 'Failed to refresh token',
                error: err?.message,
            });
    }
};