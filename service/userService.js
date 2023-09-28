// Layer to handle all user related operations
// Create DAO object to call
const userDAO = require('../repository/userDAO');
const uuid = require('uuid');
const jwtUtil = require('../utility/jwtUtil');

// Winston logger setup
const { createLogger, transports, format} = require('winston');
const { resolve, reject } = require('bluebird');

// Create the logger
const logger = createLogger({
    level: 'info', 
    format: format.combine(
        format.timestamp(),
        format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(), // log to the console
        new transports.File({ filename: 'app.log'}), // log to a file
    ]
})

// Function to register users
async function registerUser(body){
    // Log access
    logger.info('User service layer accessed: registerUser');
    // Check if username is taken
    const retrieved = await userDAO.getUsername(body.username);
    return new Promise((resolve, reject) => {
        if(retrieved.Items.length === 0){
            // Create user object
            const user = {
                user_id: uuid.v4(),
                username: body.username,
                password: body.password,
                role: 'Employee'
            };
            // Call DAO layer to create user
            userDAO.createUser(user).then((data) => {
                // If result is returned, return true, else log error
                if(data){
                    logger.info('User created');
                resolve(true);
                }else{
                    logger.error('User not created');
                    reject(false);
                }    
            });
        }else{
            logger.error('Username already exists');
            reject(false);
        }
        }); 
}

// Function to login users
async function loginUser(username, password){
    // Log access
    logger.info('User service layer accessed: loginUser');
    // Call DAO layer to get user
    return new Promise((resolve, reject) => {
        userDAO.getUser(username, password).then((data) => {
            // If result is returned, return true, else log error
            if(data.Items.length > 0){
                logger.info('User logged in');
                const token = jwtUtil.createJWT(data.Items[0].username, data.Items[0].role);
                resolve(token);
            }else{
                logger.error('User not logged in');
                reject(null);
            }
        });
    })
}

module.exports = {
    registerUser,
    loginUser
}