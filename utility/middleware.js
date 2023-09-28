// Check if username is already taken
function validateUser(req, res, next) {
    // Check if username and password are present
    if(!req.body.username || !req.body.password) {
        // If not, send error and set valid to false
        res.status(400).send({ message:"Username and password are required"});
    } else{
        // Move on
        next();
    }
}

// Ensure ticket data is valid
function validateTicket(req, res, next) {
    // Check if all required fields are present
    if(!req.body.requester_id || !req.body.amount || !req.body.description) {
        // If not, send error and set valid to false
        res.status(400).send({ message:"Requester ID, amount, and description are required fields"});

    } else{
        // Move on 
        next();
    }
}

// Ensure that updated ticket status is valid
function validateTicketStatus(req, res, next) {
    // Check if all required fields are present
    if(!req.params.ticketID || !req.body.status) {
        console.log(req.body.ticket_id, req.body.status)
        // If not, send error 
        res.status(400).send({ message:"Ticket ID and status are required fields"});
    } else if(req.body.status === "Approved" || req.body.status === "Denied"){
        // Move on if status is valid 
        next();
    } else{
        // If not, send error and set valid to false
        res.status(400).send({ message:"Status must be set to 'Approved' or 'Denied'"});
    }
}
    
// Winston logger setup
const { createLogger, transports, format} = require('winston');

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

function logRequest(req, res, next) {
    // Log the request
    logger.info(`Method: ${req.method} | URL accessed: http://localhost:3000${req.url}`);
    next();
}

module.exports = {
    validateUser,
    validateTicket,
    validateTicketStatus,
    logRequest
};