const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

function createJWT(username, role){
    return jwt.sign({
        username,
        role
    }, 'mysecretkey0310', {
        expiresIn: "2 days"
    })
};

jwt.verify = Promise.promisify(jwt.verify);

function verifyJWT(token){
    return jwt.verify(token, 'mysecretkey0310');
}

module.exports = {
    createJWT,
    verifyJWT
};