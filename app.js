// Express app and variable setup
const express = require('express');
const app = express();
const port = 3000;
const uuid = require('uuid');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mw = require('./util/middleware.js');
const userDAO = require('./repository/userDAO.js');
const ticketDAO = require('./repository/ticketDAO.js');

//const router = require('./routes/app.js');
//app.use('/ers', app);

app.get('/', (req, res) => {
    res.send('Hello World!');
    });

// =================Login/Register========================
// Registration path
app.post('/register', mw.validateUser, (req, res) => {
    const body = req.body;
    if(body.valid){
        userDAO.getUsername(body.username).then((data) => {
            if(data.Count > 0){
                res.status(400);
                res.send('Username already exists');
            } else{
                const user = { 
                    user_id: uuid.v4(), 
                    username: body.username, 
                    password: body.password, 
                    isFinancialManager: false
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
app.post('/login', (req, res) => {
    const body = req.body;
    userDAO.getUser(body.username, body.password).then((data) => {
        if(data.Count == 1){
            res.status(200);
            res.send("Login success!");
        } else{
            res.status(400);
            res.send('Invalid username or password');
        }
    }).catch((err) => {
        console.log(err);
    });
});

// =====================Tickets===========================
// Path to view all tickets
app.get('/allTickets', (req, res) => {
    ticketDAO.getAllTickets().then((data) => {
        res.status(200);
        res.send(data.Items);
    }).catch((err) => {
        console.log(err);
    });
});
// Path to view all tickets by an employee
app.get('/myTickets/:id', (req, res) => {
    const id = req.params.id;
    ticketDAO.getMyTickets(id).then((data) => {
        res.status(200);
        res.send(data.Items);
    }).catch((err) => {
        console.log(err);
    });
});

// Path to submit a ticket
app.post('/submitTicket', mw.validateTicket, (req, res) => {
    const body = req.body;
    if(body.valid){
        const ticket = { 
            ticket_id: uuid.v4(), 
            requester_id: body.requester_id, 
            amount: body.amount, 
            description: body.description, 
            status: 'Pending'
        }
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
app.put('/approveTicket/:id',(req, res) => {
    const id = req.params.id;
    ticketDAO.getTicketById(id).then((data) => {
        let status = data.Item.status;
        if(status == 'Pending'){
            ticketDAO.approveTicket(id).then((data) => {
                res.status(200);
                res.send('Ticket approved');
            }).catch((err) => {
                console.log(err);
            });
        }else{
            res.status(400);
            res.send('Ticket must be pending');
        }
    }).catch((err) => {
        console.log(err);
    });
});
// Manager path to deny a ticket by id
app.put('/denyTicket/:id', (req, res) => {
    const id = req.params.id;

    ticketDAO.getTicketById(id).then((data) => {
        let status = data.Item.status;
        if(status == 'Pending'){
            ticketDAO.denyTicket(id).then((data) => {
                res.status(200);
                res.send('Ticket denied');
            }).catch((err) => {
                console.log(err);
            });
        }else{
            res.status(400);
            res.send('Ticket must be pending');
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});