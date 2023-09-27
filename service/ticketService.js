// Layer to handle all ticket related operations
// Create DAO object to call
const ticketDAO = require('../repository/ticketDAO');
const uuid = require('uuid');

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

// Function to get all tickets
function getAllTickets(){
    // Log access
    logger.info('Ticket service layer accessed: getAllTickets');
    // Call DAO layer to get all tickets
    return new Promise((resolve, reject) => {
        ticketDAO.getAllTickets().then((data) => {
            // If successful, resolve promise with data
            logger.info('Tickets retrieved successfully')
            resolve(data);
        }).catch((err) => {
            // If unsuccessful, reject promise with error
            logger.error(`Error retrieving tickets: ${err}`);
            reject(err);
        });
    });
}

// Function to get pending tickets
function getPendingTickets(role){
    // Log access
    logger.info('Ticket service layer accessed: getPendingTickets');
    if(role === 'Manager'){
        // Call DAO layer to get all pending tickets
        return new Promise((resolve, reject) => {
            ticketDAO.getPendingTickets().then((data) => {
                // If successful, resolve promise with data
                logger.info('Pending tickets retrieved successfully')
                resolve(data);
            }).catch((err) => {
                // If unsuccessful, reject promise with error
                logger.error(`Error retrieving pending tickets: ${err}`);
                reject(err);
            });
        });
    }else{
        return new Promise.reject({message: 'Action forbidden: user is not a manager'});
    }
}

// Function to get tickets by requester id
function getMyTickets(requester_id){
    // Log access
    logger.info('Ticket service layer accessed: getTicketsByUserID');
    // Call DAO layer to get all tickets by requester id
    return new Promise((resolve, reject) => {
        ticketDAO.getMyTickets(requester_id).then((data) => {
            // If successful, resolve promise with data
            logger.info('Tickets retrieved successfully')
            resolve(data);
        }).catch((err) => {
            // If unsuccessful, reject promise with error
            logger.error(`Error retrieving tickets: ${err}`);
            reject(err);
        });
    });
}

// Function to create tickets
function submitTicket(body){
    // Log access
    logger.info('Ticket service layer accessed: submitTicket');
    // Create ticket object (default status is pending)
    const ticket = { 
        ticket_id: uuid.v4(), 
        requester_id: body.requester_id, 
        amount: body.amount, 
        description: body.description, 
        status: 'Pending'
    }
    // Call DAO layer to submit ticket
    return new Promise((resolve, reject) => {
        ticketDAO.submitTicket(ticket).then((data) => {
            // If successful, resolve promise with data
            logger.info('Ticket submitted successfully')
            resolve(data);
        }).catch((err) => {
            // If unsuccessful, reject promise with error
            logger.error(`Error submitting ticket: ${err}`);
            reject(err);
        });
    });
}

// Function to update ticket status
function processTicket(id, status, role){
    // Log access
    logger.info('Ticket service layer accessed: processTicket');
    // Check to ensure user is a manager
    // Call DAO layer to update ticket status
    return new Promise((resolve, reject) => {
        if(role != 'Manager'){
            reject({message: 'Action forbidden: user is not a manager'});
        }  
        ticketDAO.processTicket(id, status).then((data) => {
            // If successful, resolve promise with data
            logger.info('Ticket processed successfully')
            resolve(data);
        }).catch((err) => {
            // If unsuccessful, reject promise with error
            logger.error(`Error processing ticket: ${err}`);
            reject(err);
        });
    });
}

module.exports = {
    getAllTickets,
    getPendingTickets,
    getMyTickets,
    submitTicket,
    processTicket
}