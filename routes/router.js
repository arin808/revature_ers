// Express router for all paths
const express = require ('express');
const router = express.Router();
const uuid = require('uuid');

// Imports for function calls
const mw = require('../utility/middleware.js');
const userDAO = require('../repository/userDAO.js');
const ticketDAO = require('../repository/ticketDAO.js');
const jwtUtil = require('../utility/jwtUtil.js');
// Root path
router.get('/', (req, res) => {
    res.send('Hello World!');
    });

// =================Login/Register========================
// Registration path
router.post('/register', mw.validateUser, (req, res) => {
    // Assign body of request to local variable
    const body = req.body;
    // Check if body is valid via middleware helper function
    if(body.valid){
        // Check if username is already taken
        userDAO.getUsername(body.username).then((data) => {
            // If username is taken, send error
            if(data.Count > 0){
                res.status(400);
                res.send('Username already exists');
            } else{
                // If username is not taken, create user
                const user = { 
                    user_id: uuid.v4(), 
                    username: body.username, 
                    password: body.password, 
                    role: 'Employee'
                }
                userDAO.createUser(user).then((data) => {
                    res.status(201);
                    res.send('User created');
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
    }else{
            res.status(400);
            res.send('Invalid user data');
        }
});

// Login path
router.post('/login', (req, res) => {
    // Assign body of request to local variable
    const body = req.body;
    // Check if username and password match
    // If match, login success, else log the error
    userDAO.getUser(body.username, body.password).then((data) => {
        // If result is returned, login success, else failure
        if(data.Count == 1){
            const user = data.Items[0];
            const token = jwtUtil.createJWT(user.username, user.role);

            res.status(200);
            res.send({ 
                message: "Login success!",
                token: token
            });
        }else{
            res.status(400);
            res.send('Invalid username or password');
        }
    }).catch((err) => {
        console.log(err);
    });
});

// =====================Tickets===========================
// Path to view all tickets
router.get('/allTickets', (req, res) => {
    // Call dao function to get all tickets
    // If successful, send data, else log error
    ticketDAO.getAllTickets().then((data) => {
        res.status(200);
        res.send(data.Items);
    }).catch((err) => {
        console.log(err);
    });
});

// Path to view all pending tickets
router.get('/pendingTickets', (req, res) => {
    // Verify token and ensure user is a manager
    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyJWT(token).then((payload) => {
        if(payload.role == 'Manager'){
            // Call dao function to get all pending tickets
            // If successful, send data, else log error
            ticketDAO.getPendingTickets().then((data) => {
                const tickets = JSON.stringify(data.Items);
                res.status(200);
                // Welcome user and print tickets
                res.send(`Welcome ${payload.username}, ${tickets}`);
            // If finding tickets fails, send error
            }).catch((err) => {
                console.log(err);
            });
        // If user is not a manager, forbid access
        }else{
            res.status(403);
            res.send(`Forbidden: you are not a manager, you are an ${payload.role}`);
        }
    // If token verification fails, send error
    }).catch((err) => {
        console.log(err);
        res.status(401).send({ message: "Failed to authenticate token."});
    });
});

// Path to view all tickets by an employee
router.get('/myTickets/:id', (req, res) => {
    // Assign id from request param to local variable
    const id = req.params.id;
    // Call dao function to get all tickets by id
    // If successful, send data, else log error
    ticketDAO.getMyTickets(id).then((data) => {
        res.status(200);
        res.send(data.Items);
    }).catch((err) => {
        console.log(err);
    });
});

// Path to submit a ticket
router.post('/submitTicket', mw.validateTicket, (req, res) => {
    // Assign body of request to local variable
    const body = req.body;
    // Check if body is valid via middleware helper function
    if(body.valid){
        // Create ticket object (default status is pending)
        const ticket = { 
            ticket_id: uuid.v4(), 
            requester_id: body.requester_id, 
            amount: body.amount, 
            description: body.description, 
            status: 'Pending'
        }
        // Call dao function to submit ticket
        // If successful, send data, else log error
        ticketDAO.submitTicket(ticket).then((data) => {
            res.status(201);
            res.send('Ticket submitted');
        }).catch((err) => {
            console.log(err);
        });
    }else{
        res.status(400);
        res.send('Invalid ticket data');
    }
});
// Manager path to approve a ticket by id
router.put('/approveTicket/:id',(req, res) => {
    // Verify token and ensure user is a manager
    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyJWT(token).then((payload) => {
        if(payload.role == 'Manager'){
            // Assign id from request param to local variable
            const id = req.params.id;
            // Call dao function to get ticket by id
            // If successful, check if ticket is pending else log error
            ticketDAO.getTicketById(id).then((data) => {
                if(data.Item.status == 'Pending'){
                    // If ticket is pending, call dao function to approve ticket
                    // If successful, send success message, else log error
                    ticketDAO.approveTicket(id).then((data) => {
                        res.status(200);
                        res.send('Ticket approved');
                    }).catch((err) => {
                        console.log(err);
                    });
                // If ticket isn't pending, send error
                }else{
                    res.status(400);
                    res.send('Ticket must be pending');
                }
            // If ticket isn't found, send error
            }).catch((err) => {
                console.log(err);
            });
        // If user is not a manager, forbid access
        }else{
            res.status(403);
            res.send(`Forbidden: you are not a manager, you are an ${payload.role}`);
        }
        // If token verification fails, send error
    }).catch((err) => {
        console.log(err);
        res.status(401).send({ message: "Failed to authenticate token."});
    });
});

// Manager path to approve a ticket by id
router.put('/denyTicket/:id',(req, res) => {
    // Verify token and ensure user is a manager
    const token = req.headers.authorization.split(' ')[1];
    jwtUtil.verifyJWT(token).then((payload) => {
        if(payload.role == 'Manager'){
            // Assign id from request param to local variable
            const id = req.params.id;
            // Call dao function to get ticket by id
            // If successful, check if ticket is pending else log error
            ticketDAO.getTicketById(id).then((data) => {
                if(data.Item.status == 'Pending'){
                    // If ticket is pending, call dao function to approve ticket
                    // If successful, send success message, else log error
                    ticketDAO.denyTicket(id).then((data) => {
                        res.status(200);
                        res.send('Ticket denied');
                    }).catch((err) => {
                        console.log(err);
                    });
                // If ticket isn't pending, send error
                }else{
                    res.status(400);
                    res.send('Ticket must be pending');
                }
            // If ticket isn't found, send error
            }).catch((err) => {
                console.log(err);
            });
        // If user is not a manager, forbid access
        }else{
            res.status(403);
            res.send(`Forbidden: you are not a manager, you are an ${payload.role}`);
        }
        // If token verification fails, send error
    }).catch((err) => {
        console.log(err);
        res.status(401).send({ message: "Failed to authenticate token."});
    });
});

    
module.exports = router;
