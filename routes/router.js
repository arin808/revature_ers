// Express router for all paths
const express = require ('express');
const router = express.Router();
const uuid = require('uuid');

// Imports for function calls
const mw = require('../utility/middleware.js');
const userDAO = require('../repository/userDAO.js');
const ticketDAO = require('../repository/ticketDAO.js');
const userService = require('../service/userService.js');
const ticketService = require('../service/ticketService.js');
const jwtUtil = require('../utility/jwtUtil.js');

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

// Root path
router.get('/', (req, res) => {
    res.send('Hello and welcome to the Employee Reimbursement System!');
    });

// =================Login/Register========================
// Registration path
router.post('/user/register', mw.validateUser, (req, res) => {
    // Assign body of request to local variable
    const body = req.body;
    // Call service layer to register user
    userService.registerUser(body).then((data) => {
        // If successful, send success message, else log error
        if(data){
            res.status(201);
            res.send({message: 'User created'});
            logger.info(`User created: ${body}`);
        }else{
            res.status(400);
            res.send({message: 'User not created, user already exists'});
            logger.error(`User not created: ${body}`);
        }
    }).catch((err) => {
        logger.error(`Error registering user: ${err}`);
    });
});

// Login path
router.post('/user/login', (req, res) => {
    // Assign body of request to local variable
    const body = req.body;
    userService.loginUser(body.username, body.password).then((data) => {
        logger.info(`User with username: ${body.username} logged in`);
        res.status(200);
        res.send({message: 'Login successful', token: data});
    }).catch((err) => {
        res.status(401);
        res.send({message: `Login failed: ${err}`});
    });
});

// =====================Tickets===========================
// Path to view all tickets
router.get('/tickets/all', (req, res) => {
    // Call dao function to get all tickets
    // If successful, send data, else log error
   ticketService.getAllTickets().then((data) => {
        res.status(200);
        res.send({tickets: data.Items});
   }).catch((err) => {
        console.log(err);
        res.status(500);
        res.send({message: `Error retrieving tickets: ${err}`});
   });

});

// Path to view all pending tickets
router.get('/tickets/pending', (req, res) => {
    // Verify token and ensure user is a manager
    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyJWT(token).then((payload) => {
        // Call dao function to get all pending tickets
        // If successful, send data, else log error
        ticketService.getPendingTickets(payload.role).then((data) => {
            res.status(200);
            // Welcome user and print tickets
            res.send({message: `Welcome ${payload.username}`, tickets: data.Items});
            logger.info(`Pending tickets retrieved by ${payload.username}`);
        // If finding tickets fails, send error
        }).catch((err) => {
            logger.error({message:`Error retrieving pending tickets: ${err}`});
            console.log(err);
        });
    // If token verification fails, send error
    }).catch((err) => {
        console.log(err);
        res.status(401).send({ message: "Failed to authenticate token."});
        logger.error(`Error in verifiying token: ${err}`);
    });
});

// Path to view all tickets by an employee
router.get('/tickets/userTickets/:id', (req, res) => {
    // Assign id from request body to local variable
    const id = req.params.id;
    // Call dao function to get all tickets by id
    // If successful, send data, else log error
    ticketService.getMyTickets(id).then((data) => {
        res.status(200);
        res.send(data.Items);
        logger.info(`Tickets retrieved for user with id: ${id}`);
    }).catch((err) => {
        res.status(400);
        res.send({message: `Error retrieving tickets: ${err}`});
        logger.error(`Error retrieving user's tickets: ${err}`);
    });
});

// Path to submit a ticket
router.post('/tickets/submit', mw.validateTicket, (req, res) => {
    // Assign body of request to local variable
    const body = req.body;
    // If successful, send data, else log error
    ticketService.submitTicket(body).then((data) => {
        res.status(201);
        res.send({message: 'Ticket submitted'});
        logger.info(`Ticket submitted: ${JSON.stringify(data)}`);
    }).catch((err) => {
        res.status(400);
        res.send({message: `Error submitting ticket: ${err}`});
        logger.error(`Error submitting ticket: ${err}`);
    });
});

// Manager path to process a ticket by id
router.put('/tickets/process/:ticketID', mw.validateTicketStatus, (req, res) => {
    // Verify token and ensure user is a manager
    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyJWT(token).then((payload) => {
        // Assign id and status from request body to local variables
        const ticket_id = req.params.ticketID;
        const status = req.body.status;
        const role = payload.role;
        // Call service function to get ticket by id
        // If successful, check if ticket is pending else log error
        ticketDAO.processTicket(ticket_id, status, role).then((data) => {
            res.status(200);
            res.send({message: 'Ticket processed'});
            logger.info(`Ticket with id: ${ticket_id} processed`);
        }).catch((err) => {
            res.status(400);
            res.send({message: `Error processing ticket: ${err}`});
            logger.error(`Error processing ticket: ${err}`);
        });
    // If token verification fails, send error
    }).catch((err) => {
        console.log(err);
        res.status(401).send({ message: "Failed to authenticate token."});
        logger.error(`Error in verifiying token: ${err}`);
    });
});

module.exports = router;
