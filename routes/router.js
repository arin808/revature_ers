const express = require ('express');
const router = express.Router();

// Root path
router.get('/', (req, res) => {
    res.send('Hello World!');
    });


// =================Login/Register========================
// Registration path
router.post('/register', (req, res) => {
    res.send('Hello World!');
    });
// Login path
router.post('/login', (req, res) => {
    res.send('Hello World!');
    });

// =====================Tickets===========================
// Path to view all tickets
router.get('/allTickets', (req, res) => {
    res.send('Hello World!');
    });
// Path to view all tickets by an employee
router.get('/myTickets/:id', (req, res) => {
    res.send('Hello World!');
    });
// Path to submit a ticket
router.post('/submitTicket', (req, res) => {
    res.send('Hello World!');
    });
// Manager path to approve a ticket by id
router.put('/approveTicket/:id', (req, res) => {
    res.send('Hello World!');
    });
// Manager path to deny a ticket by id
router.put('/denyTicket/:id', (req, res) => {
    res.send('Hello World!');
    });
    
module.exports = router;
