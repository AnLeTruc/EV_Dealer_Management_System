const jwt = require('jsonwebtoken');

//Get JWT Secret by type
function getSecret(type){
    let secret;
    if (type === 'ACCESS'){
        secret = process.env.JWT_ACCESS_SECRET;
    } else if (type === 'REFRESH'){
        secret = process.env.JWT_REFRESH_SECRET;
    }

    if (!secret){
        throw new Error(`JWT_${type}_SECRET is not set`);
    }
    return secret;
}

//Sign access token
function signAccessToken(account){
    const secret = getSecret('ACCESS');
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN;

    //Payload 
    const payload = {
        sub: account._id.toString(),
        role: account.role,
        branch: account.branch ?? null,
    };

    return jwt.sign(payload, secret, { expiresIn});
}

//Sign refresh token
function signRefreshToken(account, tokenId){
    const secret = getSecret('REFRESH');
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

    //Pay load
    const payload = {
        sub: account._id.toString(),
        jti: tokenId,  //JWT ID
    };

    return jwt.sign(payload, secret, { expiresIn});
}

//Verify access token
function verifyAccessToken(token){
    const secret = getSecret('ACCESS');
    
    try{
        return jwt.verify(token, secret);
    } catch (error){
        throw error;
    }
}

//Verify refresh token
function verifyRefreshToken(token){
    const secret = getSecret('REFRESH');
    try{
        return jwt.verify(token, secret);
    } catch (error){
        throw error;
    }
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
